import { memo, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import * as THREE from 'three'
import { skillCategories } from '../../data/skills'
import { keyboard } from '../../lib/store'
import { COLUMNS, keyboardLayout } from './keyboardLayout'
import { useShaderMaterial } from '../materials/useShaderMaterial'

const GAP = 0.12
const CAP_HEIGHT = 0.5

const labelCache = new Map()
function labelTexture(text, width, dotColor, ink = '#0b1020') {
  const key = `${text}|${width}|${dotColor}`
  if (labelCache.has(key)) return labelCache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = 256 * width
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (dotColor) {
    ctx.fillStyle = dotColor
    ctx.beginPath()
    ctx.arc(46, 46, 16, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 74
  ctx.font = `600 ${size}px "Onest Variable", sans-serif`
  while (ctx.measureText(text).width > canvas.width - 40 && size > 24) {
    size -= 2
    ctx.font = `600 ${size}px "Onest Variable", sans-serif`
  }
  ctx.fillText(text, canvas.width / 2, 148)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  labelCache.set(key, texture)
  return texture
}

const TONES = { blank: '#2a3566', mod: '#1f2748', accent: '#e8364f' }

function Key({ data, geometry }) {
  const group = useRef()
  const material = useRef()
  const state = useRef({ y: 0, glow: 0, pressUntil: 0 })
  const { skill } = data
  const accent = skill ? skillCategories[skill.category].color : null
  const label = useMemo(() => {
    if (skill) return labelTexture(skill.name, data.width, accent)
    if (data.label) return labelTexture(data.label, Math.round(data.width), null, '#eef1fb')
    return null
  }, [skill, data, accent])
  const glowColor = useMemo(() => new THREE.Color(accent ?? '#7cc4ff'), [accent])

  useFrame((frameState, delta) => {
    const s = state.current
    const { activeId, pressId } = keyboard.get()
    const now = frameState.clock.elapsedTime
    if (pressId === data.id && s.lastToken !== keyboard.get().pressToken) {
      s.lastToken = keyboard.get().pressToken
      s.pressUntil = now + 0.22
    }
    const pressed = now < s.pressUntil
    const active = skill && activeId === skill.id
    s.y = THREE.MathUtils.damp(s.y, pressed ? -0.22 : active ? 0.12 : 0, 18, delta)
    s.glow = THREE.MathUtils.damp(s.glow, active || pressed ? 1 : 0, 10, delta)
    if (group.current) group.current.position.y = s.y
    if (material.current) material.current.emissiveIntensity = s.glow * 0.9
  })

  const press = (event) => {
    event.stopPropagation()
    const current = keyboard.get()
    keyboard.set({ pressId: data.id, pressToken: current.pressToken + 1, activeId: skill?.id ?? current.activeId })
  }

  return (
    <group position={[data.x + data.width / 2 - COLUMNS / 2, 0, data.row - 2]}>
      <group ref={group}>
        <mesh
          geometry={geometry}
          scale={[data.width - GAP, CAP_HEIGHT, 1 - GAP]}
          position={[0, CAP_HEIGHT / 2, 0]}
          onPointerOver={(event) => {
            event.stopPropagation()
            if (skill) keyboard.set({ activeId: skill.id })
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = ''
          }}
          onClick={press}
        >
          <meshStandardMaterial
            ref={material}
            color={skill ? '#e9e2d8' : TONES[data.tone]}
            emissive={glowColor}
            emissiveIntensity={0}
            roughness={0.45}
          />
        </mesh>
        {label && (
          <mesh position={[0, CAP_HEIGHT + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[data.width - GAP - 0.1, 1 - GAP - 0.1]} />
            <meshBasicMaterial map={label} transparent toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  )
}

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
    varying vec2 vUv;
    void main() {
      vec2 d = abs(vUv - 0.5) * 2.0;
      float edge = smoothstep(1.0, 0.35, length(d * vec2(0.9, 1.0)));
      vec3 a = vec3(0.91, 0.21, 0.31);
      vec3 b = vec3(0.49, 0.77, 1.0);
      vec3 color = mix(a, b, 0.5 + 0.5 * sin(vUv.x * 4.0 - uTime * 0.8));
      gl_FragColor = vec4(color, edge * 0.55);
    }
  `,
}

// Base tilt toward the viewer so the legends read clearly (≈32°).
const TILT = 0.56

function Cable() {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.2, -0.15, -2.9),
      new THREE.Vector3(-3.4, -0.3, -3.8),
      new THREE.Vector3(-4.6, -0.55, -4.6),
      new THREE.Vector3(-7, -0.6, -5.2),
    ])
    return new THREE.TubeGeometry(curve, 48, 0.09, 10, false)
  }, [])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#8f2028" roughness={0.55} />
    </mesh>
  )
}

function Board() {
  const keys = keyboardLayout
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.16), [])
  const tilt = useRef()
  const glow = useShaderMaterial(glowShader, () => ({ uTime: { value: 0 } }), {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera)

  // Fit the whole board (plus tilt headroom) inside the canvas.
  useEffect(() => {
    const aspect = size.width / size.height
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2)
    const halfH = Math.atan(Math.tan(halfV) * aspect)
    const distance = Math.max(6.2 / Math.tan(halfH), 4.2 / Math.tan(halfV))
    camera.position.set(0, distance * 0.5, distance * 0.87)
    camera.lookAt(0, 0.1, 0)
  }, [camera, size])

  useFrame((state, delta) => {
    glow.uniforms.uTime.value += delta
    if (!tilt.current) return
    // Scroll swings the board up from flat; the pointer adds a gentle sway.
    const entry = keyboard.get().entry
    const targetX = TILT * entry - state.pointer.y * 0.1
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, targetX, 5, delta)
    tilt.current.rotation.y = THREE.MathUtils.damp(
      tilt.current.rotation.y,
      state.pointer.x * 0.12 + (1 - entry) * -0.5,
      4,
      delta,
    )
  })

  return (
    <group ref={tilt}>
      <mesh position={[0, -0.25, 0]} geometry={geometry} scale={[COLUMNS + 0.6, 0.5, 5.6]}>
        <meshStandardMaterial color="#141a30" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow}>
        <planeGeometry args={[COLUMNS + 1.6, 6.6]} />
      </mesh>
      {keys.map((key) => (
        <Key key={key.id} data={key} geometry={geometry} />
      ))}
      <Cable />
    </group>
  )
}

function SkillsKeyboard({ active }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => keyboard.set({ activeId: null })}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 9, 5]} intensity={2.4} />
      <pointLight position={[-7, 3, 2]} color="#e8364f" intensity={40} distance={20} />
      <pointLight position={[7, 3, 2]} color="#7cc4ff" intensity={40} distance={20} />
      <Board />
    </Canvas>
  )
}

export default memo(SkillsKeyboard)
