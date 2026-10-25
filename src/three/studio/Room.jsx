import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BACK_WALL_Z, COLORS, RIGHT_WALL_X } from '../layout'
import AcousticWall from './AcousticWall'
import WallClock from './WallClock'
import { cityTexture, floorTexture, posterTexture, rugTexture } from '../materials/textures'
import { useShaderMaterial } from '../materials/useShaderMaterial'

const WINDOW = { x0: -2.35, x1: -0.95, y0: 1.0, y1: 2.25 }
const WALL_TOP = 3.4
const WALL_LEFT = -5
const WALL_THICK = 0.08

function WallBlock({ x0, x1, y0, y1, material }) {
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, BACK_WALL_Z - WALL_THICK / 2]} material={material} receiveShadow>
      <boxGeometry args={[x1 - x0, y1 - y0, WALL_THICK]} />
    </mesh>
  )
}

const rainShader = {
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
    float hash(float n) { return fract(sin(n) * 43758.5453); }
    void main() {
      float columns = 90.0;
      float col = floor(vUv.x * columns);
      float speed = 0.35 + hash(col) * 0.6;
      float offset = hash(col + 3.1);
      float y = fract(vUv.y + uTime * speed + offset);
      float len = 0.06 + hash(col + 7.7) * 0.12;
      float streak = smoothstep(0.0, len, y) * (1.0 - step(len, y));
      float lane = 1.0 - abs(fract(vUv.x * columns) - 0.5) * 2.0;
      streak *= smoothstep(0.75, 1.0, lane) * step(0.55, hash(col + 1.3));
      float alpha = streak * 0.35 + 0.05;
      gl_FragColor = vec4(vec3(0.72, 0.82, 1.0), alpha);
    }
  `,
}

function CityWindow() {
  const rain = useShaderMaterial(rainShader, () => ({ uTime: { value: 0 } }), { transparent: true, depthWrite: false })
  const city = useMemo(() => cityTexture(), [])
  const width = WINDOW.x1 - WINDOW.x0
  const height = WINDOW.y1 - WINDOW.y0
  const cx = (WINDOW.x0 + WINDOW.x1) / 2
  const cy = (WINDOW.y0 + WINDOW.y1) / 2
  const frameMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0c0f1c', roughness: 0.4, metalness: 0.6 }),
    [],
  )

  useFrame((_, delta) => {
    rain.uniforms.uTime.value += delta
  })

  return (
    <group>
      {/* Distant skyline: sits well behind the wall so it parallaxes with the camera. */}
      <mesh position={[cx - 0.2, cy + 0.15, BACK_WALL_Z - 2.2]}>
        <planeGeometry args={[5.6, 2.8]} />
        <meshBasicMaterial map={city} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[cx, cy, BACK_WALL_Z - 0.02]} material={rain}>
        <planeGeometry args={[width, height]} />
      </mesh>
      {/* Frame and mullions. */}
      {[
        [cx, WINDOW.y1, width + 0.08, 0.05],
        [cx, WINDOW.y0, width + 0.08, 0.07],
        [cx, cy, width, 0.03],
      ].map(([x, y, w, h], i) => (
        <mesh key={`h${i}`} position={[x, y, BACK_WALL_Z]} material={frameMaterial}>
          <boxGeometry args={[w, h, 0.06]} />
        </mesh>
      ))}
      {[WINDOW.x0, WINDOW.x1, cx].map((x, i) => (
        <mesh key={`v${i}`} position={[x, cy, BACK_WALL_Z]} material={frameMaterial}>
          <boxGeometry args={[i === 2 ? 0.03 : 0.05, height, 0.06]} />
        </mesh>
      ))}
      {/* Sill with a little cactus. */}
      <mesh position={[cx, WINDOW.y0 - 0.03, BACK_WALL_Z + 0.08]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.2, 0.04, 0.2]} />
        <meshStandardMaterial color="#e9e2d8" roughness={0.7} />
      </mesh>
      <group position={[cx + 0.4, WINDOW.y0 + 0.06, BACK_WALL_Z + 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.035, 0.08, 20]} />
          <meshStandardMaterial color="#c9b49b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <capsuleGeometry args={[0.028, 0.1, 6, 12]} />
          <meshStandardMaterial color="#3f7d5a" roughness={0.75} />
        </mesh>
      </group>
    </group>
  )
}

// "</>" bent from glowing tubes.
function NeonSign() {
  const tubes = useMemo(() => {
    const s = 0.11
    const paths = [
      [
        [-1.5, 0.6],
        [-2.3, 0],
        [-1.5, -0.6],
      ],
      [
        [0.45, 0.8],
        [-0.45, -0.8],
      ],
      [
        [1.5, 0.6],
        [2.3, 0],
        [1.5, -0.6],
      ],
    ]
    return paths.map((pts) => {
      const curve = new THREE.CurvePath()
      for (let i = 0; i < pts.length - 1; i++) {
        curve.add(
          new THREE.LineCurve3(
            new THREE.Vector3(pts[i][0] * s, pts[i][1] * s, 0),
            new THREE.Vector3(pts[i + 1][0] * s, pts[i + 1][1] * s, 0),
          ),
        )
      }
      return new THREE.TubeGeometry(curve, 24, 0.009, 8, false)
    })
  }, [])

  return (
    <group position={[-0.32, 2.42, BACK_WALL_Z + 0.06]}>
      {tubes.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial
            color={COLORS.crimson}
            emissive={COLORS.crimson}
            emissiveIntensity={4}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight color={COLORS.crimson} intensity={0.9} distance={2.2} decay={2} position={[0, 0, 0.2]} />
    </group>
  )
}

function Shelf() {
  const books = useMemo(() => {
    const palette = ['#8f2028', '#e9e2d8', '#2a3566', '#7cc4ff', '#1c2446', '#ffd166', '#3f7d5a']
    let x = 0
    return Array.from({ length: 11 }, (_, i) => {
      const w = 0.025 + ((i * 37) % 7) * 0.004
      const h = 0.17 + ((i * 53) % 5) * 0.018
      const book = { x: x + w / 2, w, h, color: palette[i % palette.length], tilt: i === 10 ? 0.28 : 0 }
      x += w + 0.004
      return book
    })
  }, [])

  return (
    <group position={[1.8, 2.02, BACK_WALL_Z + 0.13]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.03, 0.24]} />
        <meshStandardMaterial color="#5b3622" roughness={0.6} />
      </mesh>
      {books.map((b, i) => (
        <mesh
          key={i}
          position={[-0.42 + b.x + (b.tilt ? 0.03 : 0), 0.015 + b.h / 2, 0]}
          rotation={[0, 0, b.tilt]}
          castShadow
        >
          <boxGeometry args={[b.w, b.h, 0.16]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}
      {/* Tiny trophy and a succulent. */}
      <group position={[0.16, 0.015, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.06, 0.04, 0.06]} />
          <meshStandardMaterial color="#141a30" />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.012, 0.09, 20]} />
          <meshStandardMaterial color="#e2b85c" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
      <group position={[0.34, 0.015, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.08, 20]} />
          <meshStandardMaterial color="#e9e2d8" roughness={0.9} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={i}
            position={[Math.cos(i * 0.9) * 0.025, 0.1, Math.sin(i * 0.9) * 0.025]}
            rotation={[Math.sin(i * 0.9) * 0.5, 0, -Math.cos(i * 0.9) * 0.5]}
            castShadow
          >
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color="#5c9c74" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function Room() {
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.92 }), [])
  const floorMap = useMemo(() => floorTexture(), [])
  const rugMap = useMemo(() => rugTexture(), [])
  const poster = useMemo(() => posterTexture(), [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0, 0.6]} receiveShadow>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial map={floorMap} color="#8d93b8" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Back wall built around the window opening. */}
      <WallBlock x0={WALL_LEFT} x1={WINDOW.x0} y0={0} y1={WALL_TOP} material={wallMaterial} />
      <WallBlock x0={WINDOW.x1} x1={RIGHT_WALL_X} y0={0} y1={WALL_TOP} material={wallMaterial} />
      <WallBlock x0={WINDOW.x0} x1={WINDOW.x1} y0={0} y1={WINDOW.y0} material={wallMaterial} />
      <WallBlock x0={WINDOW.x0} x1={WINDOW.x1} y0={WINDOW.y1} y1={WALL_TOP} material={wallMaterial} />

      <mesh position={[RIGHT_WALL_X, WALL_TOP / 2, 0.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[4.2, WALL_TOP]} />
        <meshStandardMaterial color={COLORS.wallDark} roughness={0.92} />
      </mesh>

      {/* Skirting line for a touch of craft. */}
      <mesh position={[-1.3, 0.04, BACK_WALL_Z + 0.01]}>
        <boxGeometry args={[7.4, 0.08, 0.02]} />
        <meshStandardMaterial color="#0e1328" />
      </mesh>

      <CityWindow />
      <AcousticWall />
      <NeonSign />
      <WallClock position={[-0.34, 1.74, BACK_WALL_Z + 0.04]} />
      <Shelf />

      {/* Framed poster on the side wall. */}
      <group position={[RIGHT_WALL_X - 0.02, 1.55, 0.35]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.56, 0.76, 0.02]} />
          <meshStandardMaterial color="#0c0f1c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.5, 0.7]} />
          <meshStandardMaterial map={poster} roughness={0.7} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.75, 0.004, -0.2]} receiveShadow>
        <circleGeometry args={[1.05, 64]} />
        <meshStandardMaterial map={rugMap} roughness={1} />
      </mesh>
    </group>
  )
}
