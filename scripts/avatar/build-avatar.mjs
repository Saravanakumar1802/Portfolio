// Attaches the WebP textures from textures.py to the GLB from fbx-to-glb.mjs,
// then compresses it (meshopt geometry/animation + WebP) for the web.
//
//   node scripts/avatar/build-avatar.mjs <raw.glb> <textures dir> <out.glb>
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, resample, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'

const [rawFile, textureDir, outFile] = process.argv.slice(2)
if (!rawFile || !textureDir || !outFile) {
  console.error('usage: build-avatar.mjs <raw.glb> <textures dir> <out.glb>')
  process.exit(1)
}

await MeshoptEncoder.ready
await MeshoptDecoder.ready
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })

const document = await io.read(rawFile)
const root = document.getRoot()
document.createExtension(EXTTextureWebP).setRequired(true)

const texture = (file) =>
  document
    .createTexture(file)
    .setURI(file)
    .setMimeType('image/webp')
    .setImage(new Uint8Array(readFileSync(join(textureDir, file))))

const looks = {
  m006_body: { color: 'body_color.webp', normal: 'body_normal.webp', roughness: 0.82 },
  m006_head: { color: 'head_color.webp', normal: 'head_normal.webp', rough: 'head_rough.webp', roughness: 1 },
  m006_opacity: { color: 'hair_color.webp', roughness: 0.95, alpha: true },
}

for (const material of root.listMaterials()) {
  const look = looks[material.getName()]
  if (!look) throw new Error(`unexpected material ${material.getName()}`)
  material.setBaseColorTexture(texture(look.color)).setMetallicFactor(0).setRoughnessFactor(look.roughness)
  if (look.normal) material.setNormalTexture(texture(look.normal)).setNormalScale(1)
  if (look.rough) material.setMetallicRoughnessTexture(texture(look.rough))
  if (look.alpha) material.setAlphaMode('MASK').setAlphaCutoff(0.18).setDoubleSided(true)
}

await document.transform(
  weld(),
  dedup(),
  resample({ tolerance: 0.0005 }),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)

await io.write(outFile, document)
const bytes = readFileSync(outFile).byteLength
console.log('wrote', outFile, (bytes / 1024 / 1024).toFixed(2), 'MB')
console.log(
  'clips',
  root.listAnimations().map((a) => a.getName()),
  'morphs',
  root.listMeshes()[0].getExtras()?.targetNames,
)
