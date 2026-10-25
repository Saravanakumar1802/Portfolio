import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '../layout'

const RADIUS = 0.15
// The glass is a shallow spherical cap: polar angle and depth scale.
const DOME = 0.32
const DOME_DEPTH = 0.24

// Printed dial: minute track, bold hour bars, numerals and a small signature.
function dialTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2
  const face = ctx.createRadialGradient(c, c * 0.8, 0, c, c, c)
  face.addColorStop(0, '#f7f4ee')
  face.addColorStop(1, '#e4ddd1')
  ctx.fillStyle = face
  ctx.fillRect(0, 0, size, size)

  ctx.translate(c, c)
  for (let i = 0; i < 60; i++) {
    const hour = i % 5 === 0
    const quarter = i % 15 === 0
    ctx.save()
    ctx.rotate((i / 60) * Math.PI * 2)
    ctx.fillStyle = quarter ? '#e8364f' : '#141a30'
    const w = quarter ? 18 : hour ? 12 : 4
    const h = quarter ? 70 : hour ? 54 : 22
    ctx.beginPath()
    ctx.roundRect(-w / 2, -c + 34, w, h, w / 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = '#141a30'
  ctx.font = '700 88px "Syne Variable", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ;[
    ['12', 0, -300],
    ['3', 300, 0],
    ['6', 0, 300],
    ['9', -300, 0],
  ].forEach(([label, x, y]) => ctx.fillText(label, x, y))
  ctx.font = '600 30px "Onest Variable", sans-serif'
  ctx.fillStyle = '#8f9bbd'
  ctx.fillText('SK · STUDIO', 0, 150)
  ctx.font = '500 22px "Martian Mono Variable", monospace'
  ctx.fillText('IST', 0, -150)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

// A tapered clock hand pointing up from the centre (+y).
function handGeometry(length, base, tip, tail = 0) {
  const shape = new THREE.Shape()
  shape.moveTo(-base / 2, -tail)
  shape.lineTo(base / 2, -tail)
  shape.lineTo(tip / 2, length)
  shape.quadraticCurveTo(0, length + tip, -tip / 2, length)
  shape.closePath()
  return new THREE.ExtrudeGeometry(shape, { depth: 0.003, bevelEnabled: false })
}

function shadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 30, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

export default function WallClock({ position }) {
  const hour = useRef()
  const minute = useRef()
  const second = useRef()
  const assets = useMemo(
    () => ({
      dial: dialTexture(),
      shadow: shadowTexture(),
      hour: handGeometry(0.075, 0.012, 0.006, 0.015),
      minute: handGeometry(0.112, 0.009, 0.004, 0.018),
      second: handGeometry(0.122, 0.003, 0.002, 0.035),
      glass: new THREE.SphereGeometry(1, 48, 12, 0, Math.PI * 2, 0, DOME),
    }),
    [],
  )
  useEffect(
    () => () => {
      Object.values(assets).forEach((asset) => asset.dispose?.())
    },
    [assets],
  )

  useFrame(() => {
    const now = new Date()
    const s = now.getSeconds() + now.getMilliseconds() / 1000
    const m = now.getMinutes() + s / 60
    const h = (now.getHours() % 12) + m / 60
    // Sweeping second hand, like a quartz sweep movement.
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2
  })

  const dark = <meshStandardMaterial color="#141a30" roughness={0.4} metalness={0.3} />

  return (
    <group position={position}>
      {/* Soft contact shadow on the wall. */}
      <mesh position={[0.012, -0.018, -0.024]}>
        <planeGeometry args={[RADIUS * 2.9, RADIUS * 2.9]} />
        <meshBasicMaterial map={assets.shadow} transparent depthWrite={false} />
      </mesh>
      {/* Case: a deep metal bezel ring facing the room. */}
      <mesh>
        <torusGeometry args={[RADIUS, 0.014, 20, 96]} />
        <meshStandardMaterial color="#1a1f33" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.012]}>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.024, 96, 1, true]} />
        <meshStandardMaterial color="#1a1f33" metalness={0.85} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <circleGeometry args={[RADIUS, 96]} />
        <meshStandardMaterial map={assets.dial} roughness={0.55} />
      </mesh>
      {/* Hands, stacked above the dial, with a crimson sweep second hand. */}
      <group ref={hour} position={[0, 0, -0.002]}>
        <mesh geometry={assets.hour}>{dark}</mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.002]}>
        <mesh geometry={assets.minute}>{dark}</mesh>
      </group>
      <group ref={second} position={[0, 0, 0.006]}>
        <mesh geometry={assets.second}>
          <meshStandardMaterial color={COLORS.crimson} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.03, 0.0015]}>
          <circleGeometry args={[0.007, 24]} />
          <meshStandardMaterial color={COLORS.crimson} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.0095]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.004, 24]} />
        <meshStandardMaterial color={COLORS.crimson} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Domed glass: a faint reflection catches the room light. */}
      <mesh
        position={[0, 0, 0.01 - Math.cos(DOME) * DOME_DEPTH]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[RADIUS / Math.sin(DOME), DOME_DEPTH, RADIUS / Math.sin(DOME)]}
      >
        <primitive object={assets.glass} attach="geometry" />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
