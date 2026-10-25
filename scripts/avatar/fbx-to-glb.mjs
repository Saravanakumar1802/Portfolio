// Converts a Microsoft Rocketbox avatar + animation FBX files into one
// untextured GLB (mesh, skeleton, named clips) using three.js in Node.
//
//   node scripts/avatar/fbx-to-glb.mjs <avatar.fbx> <out.glb> name=anim.fbx [name=anim.fbx ...]
//
// Textures are attached afterwards by build-avatar.mjs.
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

// --- Minimal browser shims for the loader/exporter -------------------------
globalThis.self ??= globalThis
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result
      this.onloadend?.()
    })
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`
      this.onloadend?.()
    })
  }
}

// Textures are not decoded here; record their file names only.
class TextureStub {
  setPath() {
    return this
  }
  load(url) {
    const texture = new THREE.Texture()
    texture.name = basename(url)
    return texture
  }
}
const manager = new THREE.LoadingManager()
manager.addHandler(/\.(tga|png|jpe?g|dds|bmp)$/i, new TextureStub())

const loader = new FBXLoader(manager)
const parse = (file) => loader.parse(readFileSync(file).buffer, '')

// Bones whose translation we keep from the animations. Everything else uses
// the avatar's own bone lengths, so clips fit its proportions exactly.
const KEEP_POSITION = new Set(['Bip01', 'Bip01_Pelvis'])

// Removes the root's horizontal travel so every clip plays in place and loops
// cleanly. The linear trend is subtracted, so sway and bob are kept. Returns
// the travel speed (units/s) that was removed, i.e. the clip's walking pace.
function removeRootDrift(clip) {
  const track = clip.tracks.find((t) => t.name === 'Bip01.position')
  if (!track) return 0
  const { times, values } = track
  const n = times.length
  const span = times[n - 1] - times[0] || 1
  const dx = values[(n - 1) * 3] - values[0]
  const dz = values[(n - 1) * 3 + 2] - values[2]
  for (let i = 0; i < n; i++) {
    const t = (times[i] - times[0]) / span
    values[i * 3] -= dx * t
    values[i * 3 + 2] -= dz * t
  }
  return Math.hypot(dx, dz) / span
}

function cleanClip(clip, name) {
  const pace = removeRootDrift(clip)
  if (pace > 1) console.log(`clip ${name}: removed root travel of ${pace.toFixed(1)} units/s`)
  const tracks = clip.tracks.filter((track) => {
    const [node, property] = track.name.split('.')
    if (property === 'scale') return false
    if (property === 'position') return KEEP_POSITION.has(node)
    return true
  })
  const cleaned = new THREE.AnimationClip(name, clip.duration, tracks)
  cleaned.optimize()
  return cleaned
}

// Only these facial blend shapes ship (175 exist). Prefix stripped on export.
const KEEP_MORPHS = [
  'AK_09_EyeBlinkLeft',
  'AK_10_EyeBlinkRight',
  'AK_25_JawOpen',
  'AK_44_MouthSmileLeft',
  'AK_45_MouthSmileRight',
  'AK_03_BrowInnerUp',
  'AA_VI_10_aa',
  'AA_VI_13_O',
]

function trimMorphs(mesh) {
  const dictionary = mesh.morphTargetDictionary
  if (!dictionary) return
  const geometry = mesh.geometry
  const keep = KEEP_MORPHS.map((short) => {
    const full = Object.keys(dictionary).find((key) => key.endsWith(short))
    if (!full) throw new Error(`missing morph ${short}`)
    return { name: short.replace(/^[A-Z]{2}_(VI_)?\d+_/, ''), index: dictionary[full] }
  })
  geometry.morphAttributes.position = keep.map(({ index, name }) => {
    const attribute = geometry.morphAttributes.position[index]
    attribute.name = name
    return attribute
  })
  // Normal deltas roughly double the size for little visible gain.
  delete geometry.morphAttributes.normal
  mesh.morphTargetDictionary = Object.fromEntries(keep.map(({ name }, i) => [name, i]))
  mesh.morphTargetInfluences = keep.map(() => 0)
}

// Picks the end time in [minT, maxT] whose pose best matches frame 0, so a
// trimmed loop wraps without a visible pop.
function bestLoopEnd(clip, minT, maxT) {
  const quatTracks = clip.tracks.filter((t) => t.name.endsWith('.quaternion'))
  const at = (track, time) => {
    const i = Math.min(track.times.length - 1, Math.max(0, Math.round(time * 30)))
    return track.values.slice(i * 4, i * 4 + 4)
  }
  let best = { time: maxT, error: Infinity }
  for (let t = minT; t <= Math.min(maxT, clip.duration); t += 1 / 30) {
    let error = 0
    for (const track of quatTracks) {
      const [a, b] = [at(track, 0), at(track, t)]
      error += 1 - Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])
    }
    if (error < best.error) best = { time: t, error }
  }
  return best.time
}

const TRIM = { idle: [6, 11.5], talk: [5, 9], sit: [8, 14], type: [8, 14] }

const [avatarFile, outFile, ...animArgs] = process.argv.slice(2)
if (!avatarFile || !outFile) {
  console.error('usage: fbx-to-glb.mjs <avatar.fbx> <out.glb> name=anim.fbx ...')
  process.exit(1)
}

const avatar = parse(avatarFile)
avatar.name = 'Avatar'

// Swap Phong materials for standard ones (glTF PBR), keeping the source map
// name so build-avatar.mjs knows which texture belongs where.
const materialReport = {}
avatar.traverse((object) => {
  if (!object.isMesh) return
  trimMorphs(object)
  // FBX UVs have their origin bottom-left; glTF expects top-left.
  const uv = object.geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i))
  const sources = Array.isArray(object.material) ? object.material : [object.material]
  const converted = sources.map((source) => {
    const material = new THREE.MeshStandardMaterial({ name: source.name, roughness: 0.75 })
    material.userData.sourceMap = source.map?.name ?? null
    materialReport[source.name] = {
      map: source.map?.name ?? null,
      normal: source.normalMap?.name ?? source.bumpMap?.name ?? null,
      alpha: source.alphaMap?.name ?? null,
      transparent: source.transparent,
    }
    return material
  })
  object.material = Array.isArray(object.material) ? converted : converted[0]
})

const clips = animArgs.map((arg) => {
  const [name, file] = arg.split('=')
  let source = parse(file).animations[0]
  if (!source) throw new Error(`no animation in ${file}`)
  if (TRIM[name]) {
    const end = bestLoopEnd(source, ...TRIM[name])
    source = THREE.AnimationUtils.subclip(source, name, 0, Math.round(end * 30), 30)
  }
  return cleanClip(source, name)
})

const box = new THREE.Box3().setFromObject(avatar)
console.log(
  JSON.stringify(
    {
      materials: materialReport,
      bbox: { min: box.min, max: box.max },
      unit: avatar.userData.unitScaleFactor,
      clips: clips.map((c) => [c.name, +c.duration.toFixed(2), c.tracks.length]),
    },
    null,
    1,
  ),
)

new GLTFExporter().parse(
  avatar,
  (glb) => {
    writeFileSync(outFile, Buffer.from(glb))
    console.log('wrote', outFile, (glb.byteLength / 1024).toFixed(0) + ' KB')
  },
  (error) => {
    console.error(error)
    process.exit(1)
  },
  { binary: true, animations: clips, onlyVisible: false },
)
