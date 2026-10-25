import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { character } from '../../data/character'

// Loads the rigged avatar (see scripts/avatar) and exposes what the director
// needs: clips mapped to actions, head/neck/hand bones and face morphs.

const findBone = (scene, pattern) => {
  let found = null
  scene.traverse((object) => {
    if (!found && object.isBone && pattern.test(object.name)) found = object
  })
  return found
}

const findBones = (scene, pattern) => {
  const bones = []
  scene.traverse((object) => {
    if (object.isBone && pattern.test(object.name)) bones.push(object)
  })
  return bones
}

// Which arm waves in a clip: the one whose upper arm moves the most.
function wavingSide(clip) {
  const motion = (side) => {
    const track = clip.tracks.find((t) => t.name === `Bip01_${side}_UpperArm.quaternion`)
    if (!track) return 0
    let total = 0
    for (let i = 4; i < track.values.length; i++) total += Math.abs(track.values[i] - track.values[i - 4])
    return total
  }
  return motion('R') >= motion('L') ? 'R' : 'L'
}

// A seated wave: the sitting clip, with the waving arm taken from the wave clip.
function seatedWave(sit, wave) {
  const side = wavingSide(wave)
  const arm = new RegExp(`^Bip01_${side}_(Clavicle|UpperArm|Forearm|Hand|Finger)`)
  const fromWave = wave.tracks.filter((t) => arm.test(t.name))
  const fromSit = sit.tracks.filter((t) => !arm.test(t.name))
  return new THREE.AnimationClip('sitWave', wave.duration, [
    ...fromSit.map((t) => t.clone()),
    ...fromWave.map((t) => t.clone()),
  ])
}

function upgradeMaterials(scene) {
  scene.traverse((object) => {
    if (!object.isMesh) return
    object.castShadow = true
    object.receiveShadow = true
    object.frustumCulled = false // skinned bounds don't follow animation
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      // Hair cards: anti-aliased cut-out edges with MSAA.
      if (material.alphaTest > 0) material.alphaToCoverage = true
    })
  })
}

export default function GlbAvatar({ onReady, ...props }) {
  // No Draco; enable the meshopt decoder (scripts/avatar output).
  const { scene, animations } = useGLTF(character.url, false, true)

  const fit = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene, true)
    const height = box.max.y - box.min.y
    return { scale: character.height / height, lift: -box.min.y }
  }, [scene])

  const clips = useMemo(() => {
    const byName = Object.fromEntries(animations.map((clip) => [clip.name, clip]))
    const pick = (action) => byName[character.clips[action]]
    const mapped = {
      idle: pick('idle') ?? animations[0],
      walk: pick('walk'),
      wave: pick('wave'),
      sit: pick('sit'),
      type: pick('type'),
      talk: pick('talk'),
    }
    mapped.walk ??= mapped.idle
    mapped.wave ??= mapped.idle
    mapped.talk ??= mapped.idle
    mapped.sit ??= mapped.idle
    mapped.type ??= mapped.sit
    mapped.sitWave = mapped.wave !== mapped.idle ? seatedWave(mapped.sit, mapped.wave) : mapped.sit
    return mapped
  }, [animations])

  useLayoutEffect(() => {
    upgradeMaterials(scene)
    let face = null
    scene.traverse((object) => {
      if (!face && object.isMesh && object.morphTargetDictionary) face = object
    })
    onReady?.({
      root: scene,
      clips,
      head: findBone(scene, /head$/i),
      neck: findBone(scene, /neck$/i),
      hands: { L: findBone(scene, /L_Hand$/), R: findBone(scene, /R_Hand$/) },
      fingers: { L: findBones(scene, /L_Finger[1-4]$/), R: findBones(scene, /R_Finger[1-4]$/) },
      face,
      seatOffset: character.seatOffset,
    })
  }, [scene, clips, onReady])

  return (
    <group {...props}>
      <group rotation={[0, character.rotationY, 0]} scale={fit.scale}>
        <primitive object={scene} position={[0, fit.lift, 0]} />
      </group>
    </group>
  )
}

useGLTF.preload(character.url, false, true)
