import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// A DualSense-style gamepad at real scale (≈160 × 66 × 106 mm) lying on the
// desk. Local axes: +x right, +y up, −z toward the triggers (away from you).
const TOP = 0.034 // height of the top face of the body

const white = { color: '#eef0f4', roughness: 0.42 }
const black = { color: '#16171d', roughness: 0.3, metalness: 0.15 }

function FaceButton({ position, symbol }) {
  const ink = <meshStandardMaterial color="#c9ccd8" roughness={0.4} />
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.0058, 0.0062, 0.004, 24]} />
        <meshStandardMaterial {...black} />
      </mesh>
      <group position={[0, 0.0021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {symbol === 'cross' &&
          [Math.PI / 4, -Math.PI / 4].map((r) => (
            <mesh key={r} rotation={[0, 0, r]}>
              <planeGeometry args={[0.0065, 0.0009]} />
              {ink}
            </mesh>
          ))}
        {symbol === 'circle' && (
          <mesh>
            <ringGeometry args={[0.0021, 0.003, 24]} />
            {ink}
          </mesh>
        )}
        {symbol === 'square' && (
          <mesh>
            <ringGeometry args={[0.0021, 0.0031, 4, 1, Math.PI / 4]} />
            {ink}
          </mesh>
        )}
        {symbol === 'triangle' && (
          <mesh>
            <ringGeometry args={[0.0018, 0.0031, 3, 1, Math.PI / 2]} />
            {ink}
          </mesh>
        )}
      </group>
    </group>
  )
}

function Stick({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.0095, 0.011, 0.004, 32]} />
        <meshStandardMaterial color="#101116" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.0035, 0.004, 0.007, 16]} />
        <meshStandardMaterial color="#101116" roughness={0.6} />
      </mesh>
      {/* Rubber cap with a raised grip ring and a dished centre. */}
      <mesh position={[0, 0.0095, 0]} castShadow>
        <cylinderGeometry args={[0.0088, 0.0082, 0.0035, 32]} />
        <meshStandardMaterial color="#1d1f26" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.0114, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.0062, 0.0088, 32]} />
        <meshStandardMaterial color="#2c2f38" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0108, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0062, 32]} />
        <meshStandardMaterial color="#14151b" roughness={0.95} />
      </mesh>
    </group>
  )
}

export default function Controller({ position, rotation }) {
  const lightBar = useMemo(() => new THREE.MeshBasicMaterial({ color: '#4f8dff', toneMapped: false }), [])

  // The light bar breathes gently, like an idle controller.
  useFrame((state) => {
    lightBar.color.setHSL(0.6, 0.9, 0.55 + Math.sin(state.clock.elapsedTime * 1.4) * 0.12)
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Front body (white wings + black core). */}
      <RoundedBox
        args={[0.15, 0.03, 0.058]}
        radius={0.013}
        smoothness={4}
        position={[0, TOP - 0.015, -0.016]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...white} />
      </RoundedBox>
      <RoundedBox
        args={[0.074, 0.031, 0.05]}
        radius={0.012}
        smoothness={4}
        position={[0, TOP - 0.0145, -0.004]}
        castShadow
      >
        <meshStandardMaterial {...black} />
      </RoundedBox>
      {/* Grips sweep back and down toward the desk. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.054, TOP - 0.018, 0.022]} rotation={[0.38, side * 0.24, 0]}>
          <mesh scale={[1, 0.85, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.019, 0.038, 10, 24]} />
            <meshStandardMaterial {...white} />
          </mesh>
        </group>
      ))}
      {/* Touchpad framed by the light bars. */}
      <RoundedBox args={[0.064, 0.005, 0.034]} radius={0.002} position={[0, TOP + 0.002, -0.026]} castShadow>
        <meshStandardMaterial color="#f6f7fa" roughness={0.22} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.0335, TOP + 0.002, -0.026]} material={lightBar}>
          <boxGeometry args={[0.0018, 0.0035, 0.032]} />
        </mesh>
      ))}
      {/* Create / Options. */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.0034, 0.003, 0.009]}
          radius={0.001}
          position={[side * 0.041, TOP + 0.001, -0.036]}
        >
          <meshStandardMaterial {...black} />
        </RoundedBox>
      ))}
      {/* Centre button, mute button + its LED. */}
      <mesh position={[0, TOP + 0.0015, 0.004]}>
        <cylinderGeometry args={[0.0042, 0.0042, 0.003, 24]} />
        <meshStandardMaterial color="#2a2c34" roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.011, 0.003, 0.0035]} radius={0.001} position={[0, TOP + 0.001, 0.011]}>
        <meshStandardMaterial color="#2a2c34" roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, TOP + 0.0027, 0.011]}>
        <boxGeometry args={[0.0075, 0.0005, 0.0008]} />
        <meshBasicMaterial color="#ff8a3d" toneMapped={false} />
      </mesh>
      {/* D-pad on the left wing. */}
      <group position={[-0.054, TOP + 0.001, -0.016]}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2
          return (
            <RoundedBox
              key={i}
              args={[0.0068, 0.004, 0.009]}
              radius={0.0015}
              position={[Math.sin(a) * 0.0085, 0, -Math.cos(a) * 0.0085]}
              rotation={[0, -a, 0]}
              castShadow
            >
              <meshStandardMaterial {...black} />
            </RoundedBox>
          )
        })}
      </group>
      {/* Face buttons on the right wing. */}
      <group position={[0.054, TOP + 0.001, -0.016]}>
        <FaceButton position={[0, 0, -0.0105]} symbol="triangle" />
        <FaceButton position={[0.0105, 0, 0]} symbol="circle" />
        <FaceButton position={[0, 0, 0.0105]} symbol="cross" />
        <FaceButton position={[-0.0105, 0, 0]} symbol="square" />
      </group>
      <Stick position={[-0.024, TOP + 0.001, 0.012]} />
      <Stick position={[0.024, TOP + 0.001, 0.012]} />
      {/* Bumpers and triggers along the far edge. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.05, TOP - 0.006, -0.046]}>
          <RoundedBox args={[0.034, 0.008, 0.012]} radius={0.003} castShadow>
            <meshStandardMaterial {...black} />
          </RoundedBox>
          <RoundedBox
            args={[0.03, 0.016, 0.016]}
            radius={0.005}
            position={[0, -0.012, 0.002]}
            rotation={[0.45, 0, 0]}
            castShadow
          >
            <meshStandardMaterial {...white} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}
