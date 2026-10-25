import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { COLORS, DESK, DESK_TOP_Y, KEYBOARD, MONITOR, SIDE_MONITOR } from '../layout'
import { noteTexture, walnutTexture } from '../materials/textures'
import { createCodeScreen, createDevChatScreen } from './screens'
import { frame, studio } from '../../lib/store'
import Keyboard from './Keyboard'
import Controller from './Controller'
import { useShaderMaterial } from '../materials/useShaderMaterial'

RectAreaLightUniformsLib.init()

const CURVE_RADIUS = 1.5

// Bends a geometry around the viewer: edges come forward like an ultrawide.
function bend(geometry) {
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, pos.getZ(i) + (x * x) / (2 * CURVE_RADIUS))
  }
  geometry.computeVertexNormals()
  return geometry
}

const metal = new THREE.MeshStandardMaterial({ color: '#1a1d29', metalness: 0.8, roughness: 0.35 })
const plastic = new THREE.MeshStandardMaterial({ color: '#0f1220', roughness: 0.5, metalness: 0.2 })

// Dashed crimson stitching around the desk mat.
function MatStitch() {
  const line = useMemo(() => {
    const w = 0.47
    const d = 0.18
    const points = [
      [-w, -d],
      [w, -d],
      [w, d],
      [-w, d],
      [-w, -d],
    ].map(([px, pz]) => new THREE.Vector3(px, 0, pz))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineDashedMaterial({ color: COLORS.crimson, dashSize: 0.008, gapSize: 0.006 })
    const object = new THREE.Line(geometry, material)
    object.computeLineDistances()
    return object
  }, [])
  return (
    <primitive
      object={line}
      position={[KEYBOARD.position[0] + 0.12, DESK_TOP_Y + 0.0045, KEYBOARD.position[2] + 0.02]}
    />
  )
}

function MainMonitor({ screen }) {
  const [x, y, z] = MONITOR.position
  const screenGeo = useMemo(() => bend(new THREE.PlaneGeometry(MONITOR.width, MONITOR.height, 40, 1)), [])
  const shellGeo = useMemo(
    () => bend(new THREE.BoxGeometry(MONITOR.width + 0.03, MONITOR.height + 0.03, 0.025, 40, 1, 1)),
    [],
  )
  const light = useRef()

  useEffect(() => {
    light.current?.lookAt(x, y - 0.25, 1)
  }, [x, y])

  return (
    <group position={[x, y, z]}>
      <mesh geometry={shellGeo} position={[0, 0, -0.016]} material={plastic} castShadow />
      <mesh geometry={screenGeo}>
        <meshBasicMaterial map={screen.texture} toneMapped={false} color="#d8deef" />
      </mesh>
      {/* Back hump + arm down to the desk. */}
      <mesh position={[0, -0.02, -0.075]} material={plastic} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.07]} />
      </mesh>
      <mesh position={[0, -0.2, -0.11]} material={metal} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.025]} />
      </mesh>
      <mesh position={[0, -y + DESK_TOP_Y + 0.006, -0.06]} material={metal} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.012, 0.2]} />
      </mesh>
      {/* Thin RGB strip on the lower bezel. */}
      <mesh position={[0, -MONITOR.height / 2 - 0.012, 0.002]}>
        <boxGeometry args={[0.08, 0.004, 0.004]} />
        <meshBasicMaterial color={COLORS.crimson} toneMapped={false} />
      </mesh>
      <rectAreaLight
        ref={light}
        color={COLORS.monitor}
        intensity={2.4}
        width={MONITOR.width}
        height={MONITOR.height}
        position={[0, 0, 0.05]}
      />
    </group>
  )
}

function SideMonitor({ screen }) {
  const [x, y, z] = SIDE_MONITOR.position
  return (
    <group position={[x, y, z]} rotation={[0, SIDE_MONITOR.rotationY, 0]}>
      <RoundedBox
        args={[SIDE_MONITOR.width + 0.025, SIDE_MONITOR.height + 0.025, 0.025]}
        radius={0.006}
        position={[0, 0, -0.014]}
        material={plastic}
        castShadow
      />
      <mesh>
        <planeGeometry args={[SIDE_MONITOR.width, SIDE_MONITOR.height]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} color="#d8deef" />
      </mesh>
      <mesh position={[0, -0.2, -0.06]} material={metal} castShadow>
        <boxGeometry args={[0.04, 0.38, 0.025]} />
      </mesh>
      <mesh position={[0, -y + DESK_TOP_Y + 0.006, -0.06]} material={metal} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.012, 32]} />
      </mesh>
    </group>
  )
}

const steamShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.x += sin(uv.y * 5.0 + uTime * 1.6) * 0.012 * uv.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      float wisp = sin(vUv.y * 9.0 - uTime * 2.2 + vUv.x * 6.0) * 0.5 + 0.5;
      float edge = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
      float fade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
      gl_FragColor = vec4(vec3(1.0), wisp * edge * fade * 0.22);
    }
  `,
}

function Mug() {
  const steam = useShaderMaterial(steamShader, () => ({ uTime: { value: 0 } }), {
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const body = useMemo(() => {
    const points = [
      [0, 0],
      [0.036, 0],
      [0.04, 0.005],
      [0.042, 0.09],
      [0.038, 0.09],
      [0.036, 0.008],
      [0, 0.008],
    ].map(([px, py]) => new THREE.Vector2(px, py))
    return new THREE.LatheGeometry(points, 40)
  }, [])

  useFrame((_, delta) => {
    steam.uniforms.uTime.value += delta
  })

  return (
    <group position={[1.24, DESK_TOP_Y, -0.9]}>
      <mesh geometry={body} castShadow>
        <meshStandardMaterial color={COLORS.crimson} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.045, 0.048, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.022, 0.006, 10, 24, Math.PI]} />
        <meshStandardMaterial color={COLORS.crimson} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.078, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.037, 32]} />
        <meshStandardMaterial color="#2b170e" roughness={0.15} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[i * 0.012 - 0.006, 0.17, 0]} rotation={[0, i * 1.2, 0]} material={steam}>
          <planeGeometry args={[0.07, 0.16, 1, 16]} />
        </mesh>
      ))}
    </group>
  )
}

function Mouse() {
  return (
    <group position={[1.08, DESK_TOP_Y + 0.004, -0.9]}>
      <mesh scale={[0.032, 0.018, 0.055]} castShadow>
        <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e9e2d8" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.017, -0.022]}>
        <boxGeometry args={[0.004, 0.004, 0.012]} />
        <meshBasicMaterial color={COLORS.crimson} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Headphones() {
  return (
    <group position={[1.6, DESK_TOP_Y, -0.86]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.005, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.01, 24]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.26, 12]} />
      </mesh>
      <mesh position={[0, 0.235, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.085, 0.012, 10, 32, Math.PI]} />
        <meshStandardMaterial color="#1c2340" roughness={0.6} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0.2, side * 0.085]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 28]} />
          <meshStandardMaterial color={side > 0 ? COLORS.crimson : '#1c2340'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function StickyNotes() {
  const notes = useMemo(
    () => [
      { text: 'ship\nit', color: '#ffd166', x: -0.47, y: 0.12, r: 0.12 },
      { text: 'drink\nwater', color: '#7cc4ff', x: -0.47, y: -0.02, r: -0.08 },
    ],
    [],
  )
  const [mx, my, mz] = MONITOR.position
  return notes.map((n) => (
    <mesh
      key={n.text}
      position={[mx + n.x, my + n.y, mz + (n.x * n.x) / (2 * CURVE_RADIUS) + 0.012]}
      rotation={[0, 0.3, n.r]}
    >
      <planeGeometry args={[0.065, 0.065]} />
      <meshStandardMaterial map={noteTexture(n.text, n.color)} roughness={0.9} />
    </mesh>
  ))
}

export default function Desk() {
  const walnut = useMemo(() => walnutTexture(), [])
  const code = useMemo(() => createCodeScreen(), [])
  const devChat = useMemo(() => createDevChatScreen(), [])
  const [dx, , dz] = DESK.position

  useFrame((_, delta) => {
    const phase = studio.get().phase
    // Fade the main screen into the OS wallpaper as the camera dives in.
    const wallpaper = THREE.MathUtils.smoothstep(frame.heroProgress, 0.55, 0.85)
    code.update(delta, { typing: phase === 'work' || phase === 'break', wallpaper })
    devChat.update(delta)
  })

  useEffect(
    () => () => {
      code.texture.dispose()
      devChat.texture.dispose()
    },
    [code, devChat],
  )

  return (
    <group>
      {/* Walnut top with a soft rounded edge. */}
      <RoundedBox
        args={[DESK.width, 0.04, DESK.depth]}
        radius={0.012}
        smoothness={3}
        position={[dx, DESK_TOP_Y - 0.02, dz]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={walnut} roughness={0.42} metalness={0.02} />
      </RoundedBox>

      {/* Steel frame: two T-legs and a cross beam. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[dx + side * (DESK.width / 2 - 0.12), 0, dz]}>
          <mesh position={[0, DESK_TOP_Y / 2 - 0.02, 0]} material={metal} castShadow>
            <boxGeometry args={[0.06, DESK_TOP_Y - 0.04, 0.06]} />
          </mesh>
          <mesh position={[0, 0.015, 0]} material={metal} castShadow receiveShadow>
            <boxGeometry args={[0.07, 0.03, DESK.depth - 0.06]} />
          </mesh>
          <mesh position={[0, DESK_TOP_Y - 0.06, 0]} material={metal}>
            <boxGeometry args={[0.05, 0.04, DESK.depth - 0.1]} />
          </mesh>
        </group>
      ))}
      <mesh position={[dx, DESK_TOP_Y - 0.12, dz - 0.25]} material={metal}>
        <boxGeometry args={[DESK.width - 0.3, 0.05, 0.03]} />
      </mesh>
      {/* Cable tray glow under the desk. */}
      <mesh position={[dx, DESK_TOP_Y - 0.045, dz - 0.33]}>
        <boxGeometry args={[DESK.width - 0.2, 0.006, 0.006]} />
        <meshBasicMaterial color={COLORS.monitor} toneMapped={false} />
      </mesh>

      {/* Felt desk mat with crimson stitching. */}
      <RoundedBox
        args={[0.98, 0.004, 0.4]}
        radius={0.002}
        position={[KEYBOARD.position[0] + 0.12, DESK_TOP_Y + 0.002, KEYBOARD.position[2] + 0.02]}
        receiveShadow
      >
        <meshStandardMaterial color="#161c36" roughness={1} />
      </RoundedBox>
      <MatStitch />

      <MainMonitor screen={code} />
      <SideMonitor screen={devChat} />
      <StickyNotes />
      <Keyboard />
      <Mouse />
      <Mug />
      <Headphones />
      <Controller position={[0.3, DESK_TOP_Y, -0.96]} rotation={[0, 0.5, 0]} />
    </group>
  )
}
