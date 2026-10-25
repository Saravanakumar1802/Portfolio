import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { BACK_WALL_Z, COLORS, DESK, DESK_TOP_Y, KEYBOARD } from '../layout'
import { studio, useStudio } from '../../lib/store'
import { useShaderMaterial } from '../materials/useShaderMaterial'

const UP = new THREE.Vector3(0, 1, 0)

// A cylinder stretched between two points.
function Segment({ from, to, radius, material }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
    </mesh>
  )
}

const LAMP = {
  base: [0.2, DESK_TOP_Y, -1.38],
  elbow: [0.16, DESK_TOP_Y + 0.4, -1.46],
  head: [0.42, DESK_TOP_Y + 0.5, -1.12],
  target: [KEYBOARD.position[0] - 0.05, DESK_TOP_Y, KEYBOARD.position[2] + 0.05],
}

const coneShader = {
  vertexShader: /* glsl */ `
    varying float vFade;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vFade = clamp(-position.y / 0.62, 0.0, 1.0);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uPower;
    varying float vFade;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float facing = pow(abs(dot(vNormal, vView)), 1.6);
      float alpha = facing * (1.0 - vFade) * 0.16 * uPower;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
}

export function DeskLamp() {
  const lampOn = useStudio((s) => s.lampOn)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const spot = useRef()
  const bulb = useRef()
  const power = useRef(1)
  const target = useMemo(() => {
    const object = new THREE.Object3D()
    object.position.set(...LAMP.target)
    return object
  }, [])
  const cone = useShaderMaterial(
    coneShader,
    () => ({ uColor: { value: new THREE.Color(COLORS.lamp) }, uPower: { value: 1 } }),
    { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide },
  )
  const coneGeometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.34, 0.62, 40, 1, true)
    g.translate(0, -0.31, 0)
    return g
  }, [])
  const headQuaternion = useMemo(() => {
    const dir = new THREE.Vector3(...LAMP.target).sub(new THREE.Vector3(...LAMP.head)).normalize()
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
  }, [])
  const arm = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e9e2d8', roughness: 0.35, metalness: 0.3 }), [])

  useFrame((_, delta) => {
    power.current = THREE.MathUtils.damp(power.current, lampOn ? 1 : 0, 10, delta)
    if (spot.current) spot.current.intensity = 9 * power.current
    if (bulb.current) bulb.current.emissiveIntensity = 0.2 + 5 * power.current
    cone.uniforms.uPower.value = power.current
  })

  const toggle = (event) => {
    event.stopPropagation()
    studio.set((s) => ({ lampOn: !s.lampOn }))
  }

  return (
    <group
      onClick={toggle}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[LAMP.base[0], LAMP.base[1] + 0.012, LAMP.base[2]]} material={arm} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.024, 32]} />
      </mesh>
      <Segment from={LAMP.base} to={LAMP.elbow} radius={0.008} material={arm} />
      <Segment from={LAMP.elbow} to={LAMP.head} radius={0.008} material={arm} />
      <mesh position={LAMP.elbow} castShadow>
        <sphereGeometry args={[0.016, 16, 12]} />
        <meshStandardMaterial color={COLORS.crimson} roughness={0.4} />
      </mesh>
      <group position={LAMP.head} quaternion={headQuaternion}>
        <mesh position={[0, -0.03, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.07, 0.09, 32, 1, true]} />
          <meshStandardMaterial color={COLORS.crimson} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.024, 16, 12]} />
          <meshStandardMaterial ref={bulb} color="#fff4e0" emissive={COLORS.lamp} toneMapped={false} />
        </mesh>
        {/* Fake volumetric beam. */}
        <mesh geometry={coneGeometry} material={cone} position={[0, -0.06, 0]} raycast={() => null} />
      </group>
      <primitive object={target} />
      <spotLight
        ref={spot}
        position={LAMP.head}
        target={target}
        color={COLORS.lamp}
        angle={0.95}
        penumbra={0.75}
        decay={2}
        distance={6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={0.05}
        shadow-camera-far={5}
      />
    </group>
  )
}

function Fan({ position, speed }) {
  const blades = useRef()
  const ring = useRef()
  useFrame((state, delta) => {
    if (blades.current) blades.current.rotation.x += delta * speed
    if (ring.current) {
      ring.current.color.setHSL((state.clock.elapsedTime * 0.08 + position[1]) % 1, 0.85, 0.6)
    }
  })
  return (
    <group position={position}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.055, 0.006, 8, 32]} />
        <meshBasicMaterial ref={ring} toneMapped={false} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation={[(i / 7) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.004, 0.05, 0.02]} />
            <meshStandardMaterial color="#20253d" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function PCTower() {
  const glow = useRef()
  useFrame((state) => {
    if (glow.current) glow.current.color.setHSL((state.clock.elapsedTime * 0.08) % 1, 0.8, 0.55)
  })
  const W = 0.23
  const H = 0.5
  const D = 0.46
  return (
    <group position={[DESK.position[0] + DESK.width / 2 + 0.26, 0.02, DESK.position[2] + 0.05]}>
      {/* Case shell with an open glass side facing the room. */}
      <mesh position={[W / 2 - 0.005, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.01, H, D]} />
        <meshStandardMaterial color="#0f1220" roughness={0.4} metalness={0.5} />
      </mesh>
      {[H, 0].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, 0.012, D]} />
          <meshStandardMaterial color="#0f1220" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {[D / 2, -D / 2].map((z) => (
        <mesh key={z} position={[0, H / 2, z]} castShadow>
          <boxGeometry args={[W, H, 0.012]} />
          <meshStandardMaterial color="#0f1220" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[-W / 2, H / 2, 0]}>
        <boxGeometry args={[0.004, H - 0.01, D - 0.01]} />
        <meshStandardMaterial color="#9fb4ff" transparent opacity={0.12} roughness={0.05} metalness={0.1} />
      </mesh>
      {/* Internals. */}
      <mesh position={[W / 2 - 0.02, H / 2, 0]}>
        <boxGeometry args={[0.01, H - 0.06, D - 0.06]} />
        <meshStandardMaterial color="#151a2e" roughness={0.7} />
      </mesh>
      <RoundedBox args={[0.05, 0.05, 0.3]} radius={0.006} position={[0.02, 0.22, -0.02]} castShadow>
        <meshStandardMaterial color="#20253d" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <mesh position={[-0.006, 0.22, -0.02]}>
        <boxGeometry args={[0.002, 0.006, 0.28]} />
        <meshBasicMaterial color={COLORS.crimson} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.06, 0.37, -0.1 + i * 0.018]}>
          <boxGeometry args={[0.04, 0.07, 0.006]} />
          <meshStandardMaterial color="#1c2340" emissive={COLORS.monitor} emissiveIntensity={0.6} />
        </mesh>
      ))}
      <mesh position={[0.04, 0.37, 0.07]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.05, 28]} />
        <meshStandardMaterial color="#20253d" metalness={0.7} roughness={0.3} />
      </mesh>
      {[0.12, 0.25, 0.38].map((y) => (
        <Fan key={y} position={[0.02, y, D / 2 - 0.04]} speed={9 + y * 6} />
      ))}
      <pointLight ref={glow} position={[-0.25, 0.25, 0]} intensity={0.5} distance={1.6} decay={2} />
    </group>
  )
}

export function Plant() {
  const leaves = useRef([])
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.09, 0.05, 0.1, 0.2, 0, 0.3)
    shape.bezierCurveTo(-0.1, 0.2, -0.09, 0.05, 0, 0)
    const g = new THREE.ShapeGeometry(shape, 12)
    // Cup the leaf slightly so it catches light.
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.abs(pos.getX(i)) * 0.6)
    g.computeVertexNormals()
    return g
  }, [])
  const specs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = i * 2.4
        const height = 0.42 + (i % 5) * 0.12
        return { angle, height, tilt: 0.5 + (i % 3) * 0.25, scale: 0.9 + (i % 4) * 0.15 }
      }),
    [],
  )
  const potGeometry = useMemo(() => {
    const pts = [
      [0, 0],
      [0.16, 0],
      [0.19, 0.06],
      [0.21, 0.36],
      [0.2, 0.38],
      [0, 0.38],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 40)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    leaves.current.forEach((leaf, i) => {
      if (leaf) leaf.rotation.z = Math.sin(t * 0.8 + i) * 0.04
    })
  })

  return (
    <group position={[-0.62, 0, BACK_WALL_Z + 0.42]}>
      <mesh geometry={potGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#e9e2d8" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.19, 32]} />
        <meshStandardMaterial color="#2b1d14" roughness={1} />
      </mesh>
      {specs.map((spec, i) => (
        <group key={i} position={[0, 0.36, 0]} rotation={[0, spec.angle, 0]}>
          <group
            ref={(el) => {
              leaves.current[i] = el
            }}
            rotation={[spec.tilt, 0, 0]}
          >
            <mesh position={[0, spec.height / 2, 0]} castShadow>
              <cylinderGeometry args={[0.005, 0.007, spec.height, 6]} />
              <meshStandardMaterial color="#2f5e43" roughness={0.8} />
            </mesh>
            <mesh
              geometry={leafGeometry}
              position={[0, spec.height, 0]}
              rotation={[0.35, 0, 0]}
              scale={spec.scale}
              castShadow
            >
              <meshStandardMaterial color={i % 2 ? '#3f7d5a' : '#356e4e'} roughness={0.55} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

const dustShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    attribute float aSeed;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      p.y += mod(uTime * 0.02 * (0.5 + aSeed), 1.2);
      p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.05;
      p.z += cos(uTime * 0.25 + aSeed * 13.0) * 0.05;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (2.0 + aSeed * 3.0) * (2.2 / -mv.z);
      vAlpha = 0.25 + aSeed * 0.5;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      gl_FragColor = vec4(1.0, 0.86, 0.68, smoothstep(0.5, 0.0, d) * vAlpha);
    }
  `,
}

export function Dust({ count = 260 }) {
  const material = useShaderMaterial(dustShader, () => ({ uTime: { value: 0 } }), {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -1.2 + Math.random() * 3.2
      positions[i * 3 + 1] = Math.random() * 2.2
      positions[i * 3 + 2] = -1.5 + Math.random() * 2.6
      seeds[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [count])
  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })
  return <points geometry={geometry} material={material} raycast={() => null} />
}
