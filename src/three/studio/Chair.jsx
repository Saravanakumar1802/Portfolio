import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { CHAIR, COLORS } from '../layout'
import { leatherNormal } from '../materials/textures'
import { rig } from '../character/rig'

// Gaming chair. The whole chair rolls with `rig.chairZ`; everything above the
// gas lift swivels with `rig.chairYaw`. The character director animates both.
export default function Chair() {
  const chair = useRef()
  const swivel = useRef()
  const normalMap = useMemo(() => leatherNormal(), [])
  const leather = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1f36',
        roughness: 0.55,
        normalMap,
        normalScale: new THREE.Vector2(0.25, 0.25),
      }),
    [normalMap],
  )
  const accent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COLORS.crimson,
        roughness: 0.5,
        normalMap,
        normalScale: new THREE.Vector2(0.3, 0.3),
      }),
    [normalMap],
  )
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141824', metalness: 0.85, roughness: 0.3 }), [])

  useFrame(() => {
    if (swivel.current) swivel.current.rotation.y = rig.chairYaw
    if (chair.current) chair.current.position.z = rig.chairZ
  })

  const seatY = CHAIR.seatHeight

  return (
    <group ref={chair} position={CHAIR.position}>
      {/* Five-star base with casters. */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.07, 0.17]} rotation={[0.12, 0, 0]} material={steel} castShadow>
              <boxGeometry args={[0.05, 0.035, 0.34]} />
            </mesh>
            <mesh position={[0, 0.028, 0.32]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.026, 0.026, 0.03, 16]} />
              <meshStandardMaterial color="#0b0e18" roughness={0.6} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.09, 0]} material={steel} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.06, 24]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} material={steel} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 16]} />
      </mesh>

      <group ref={swivel}>
        {/* Seat cushion with side bolsters. */}
        <RoundedBox
          args={[0.5, 0.09, 0.5]}
          radius={0.035}
          smoothness={4}
          position={[0, seatY - 0.045, 0.01]}
          material={leather}
          castShadow
          receiveShadow
        />
        {[-1, 1].map((side) => (
          <RoundedBox
            key={side}
            args={[0.06, 0.05, 0.46]}
            radius={0.022}
            position={[side * 0.24, seatY + 0.005, 0.01]}
            material={accent}
            castShadow
          />
        ))}
        {/* Backrest, tilted back slightly. */}
        <group position={[0, seatY + 0.02, -0.24]} rotation={[-0.16, 0, 0]}>
          <RoundedBox
            args={[0.5, 0.82, 0.1]}
            radius={0.045}
            smoothness={4}
            position={[0, 0.41, 0]}
            material={leather}
            castShadow
            receiveShadow
          />
          {[-1, 1].map((side) => (
            <RoundedBox
              key={side}
              args={[0.07, 0.6, 0.13]}
              radius={0.03}
              position={[side * 0.235, 0.32, 0.02]}
              material={accent}
              castShadow
            />
          ))}
          {/* Centre stitching stripes. */}
          {[-0.07, 0.07].map((x) => (
            <mesh key={x} position={[x, 0.42, 0.052]}>
              <boxGeometry args={[0.012, 0.66, 0.004]} />
              <meshStandardMaterial color={COLORS.crimson} roughness={0.5} />
            </mesh>
          ))}
          {/* Headrest pillow and lumbar cushion. */}
          <RoundedBox
            args={[0.26, 0.12, 0.07]}
            radius={0.04}
            position={[0, 0.72, 0.075]}
            material={accent}
            castShadow
          />
          <RoundedBox
            args={[0.3, 0.13, 0.07]}
            radius={0.04}
            position={[0, 0.18, 0.075]}
            material={leather}
            castShadow
          />
        </group>
        {/* Armrests. */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.29, seatY, -0.02]}>
            <mesh position={[0, 0.08, 0]} material={steel} castShadow>
              <boxGeometry args={[0.03, 0.16, 0.05]} />
            </mesh>
            <RoundedBox args={[0.07, 0.03, 0.26]} radius={0.012} position={[0, 0.17, 0.02]} castShadow>
              <meshStandardMaterial color="#0f1220" roughness={0.6} />
            </RoundedBox>
          </group>
        ))}
      </group>
    </group>
  )
}
