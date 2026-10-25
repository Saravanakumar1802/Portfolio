import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import * as THREE from 'three'
import { KEYBOARD } from '../layout'
import { studio } from '../../lib/store'
import { useShaderMaterial } from '../materials/useShaderMaterial'

const UNIT = 0.0195
const GAP = 0.0024
const CAP_HEIGHT = 0.011
const PRESS_DEPTH = 0.004

// 65% layout, widths in key units. `c` marks colour: a = alpha, m = modifier, x = accent.
const ROWS = [
  [[1, 'x'], ...Array(13).fill([1, 'a']), [2, 'm']],
  [[1.5, 'm'], ...Array(12).fill([1, 'a']), [1.5, 'm'], [1, 'm']],
  [[1.75, 'm'], ...Array(11).fill([1, 'a']), [2.25, 'x'], [1, 'm']],
  [[2.25, 'm'], ...Array(10).fill([1, 'a']), [1.75, 'm'], [1, 'm'], [1, 'm']],
  [
    [1.25, 'm'],
    [1.25, 'm'],
    [1.25, 'm'],
    [6.25, 'a'],
    [1, 'm'],
    [1, 'm'],
    [1, 'm'],
    [1, 'm'],
    [1, 'm'],
  ],
]
const ROW_UNITS = 16
const COLORS = { a: '#e9e2d8', m: '#2a3566', x: '#e8364f' }

const glowShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uPower;
    varying vec2 vUv;
    vec3 hue(float h) {
      return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    }
    void main() {
      vec2 d = abs(vUv - 0.5) * 2.0;
      float edge = smoothstep(1.0, 0.55, max(d.x, d.y * 0.9));
      vec3 color = mix(vec3(0.91, 0.21, 0.31), hue(fract(vUv.x * 0.6 - uTime * 0.12)), 0.55);
      gl_FragColor = vec4(color * uPower, edge * 0.85);
    }
  `,
}

export default function Keyboard() {
  const keysRef = useRef()
  const glow = useShaderMaterial(glowShader, () => ({ uTime: { value: 0 }, uPower: { value: 1.6 } }), {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })

  const keys = useMemo(() => {
    const list = []
    ROWS.forEach((row, r) => {
      let cursor = -ROW_UNITS / 2
      row.forEach(([width, kind]) => {
        list.push({
          x: (cursor + width / 2) * UNIT,
          z: (r - 2) * UNIT,
          width: width * UNIT - GAP,
          kind,
          press: 0,
          drawn: null,
        })
        cursor += width
      })
    })
    return list
  }, [])

  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.18), [])
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      color: new THREE.Color(),
      position: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
    }),
    [],
  )
  const typing = useRef({ timer: 0 })

  useLayoutEffect(() => {
    const mesh = keysRef.current
    keys.forEach((key, i) => {
      key.drawn = null
      mesh.setColorAt(i, scratch.color.set(COLORS[key.kind]))
    })
    mesh.instanceColor.needsUpdate = true
  }, [keys, scratch])

  useFrame((_, delta) => {
    const mesh = keysRef.current
    if (!mesh) return
    glow.uniforms.uTime.value += delta
    const phase = studio.get().phase
    const isTyping = phase === 'work'

    // Fire a key roughly every 70ms while the character types.
    if (isTyping) {
      typing.current.timer -= delta
      if (typing.current.timer <= 0) {
        typing.current.timer = 0.045 + Math.random() * 0.06
        keys[Math.floor(Math.random() * keys.length)].press = 1
      }
    }

    let dirty = false
    keys.forEach((key, i) => {
      key.press = Math.max(0, key.press - delta * 9)
      const down = key.press > 0
      // Only rewrite matrices whose drawn state differs from the wanted one.
      if (key.drawn === down) return
      key.drawn = down
      dirty = true
      scratch.position.set(key.x, CAP_HEIGHT / 2 + 0.006 - (down ? PRESS_DEPTH : 0), key.z)
      scratch.scale.set(key.width, CAP_HEIGHT, UNIT - GAP)
      scratch.matrix.compose(scratch.position, scratch.rotation, scratch.scale)
      mesh.setMatrixAt(i, scratch.matrix)
    })
    if (dirty) mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={KEYBOARD.position} rotation={[0.06, 0, 0]}>
      <RoundedBox args={[ROW_UNITS * UNIT + 0.016, 0.014, 5 * UNIT + 0.016]} radius={0.005} castShadow receiveShadow>
        <meshStandardMaterial color="#141a30" metalness={0.7} roughness={0.32} />
      </RoundedBox>
      <instancedMesh ref={keysRef} args={[geometry, undefined, keys.length]} castShadow>
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <mesh position={[0, -0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow}>
        <planeGeometry args={[ROW_UNITS * UNIT + 0.06, 5 * UNIT + 0.06]} />
      </mesh>
    </group>
  )
}
