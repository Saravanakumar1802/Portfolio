import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { look } from '../../data/character'
import { denimNormal, weaveNormal } from '../materials/textures'
import { BODY } from './rig'
import { proceduralClips } from './proceduralClips'

// A stylized "designer toy" version of Saravana built entirely from code:
// named joint groups (animated by AnimationClips) wrapped in smooth shapes.

// Skin texture for the head sphere with the beard painted in, mapped with the
// sphere's UVs (u = 0.25 is the face, v runs top → bottom).
function paintHead(ctx, w, h) {
  ctx.fillStyle = look.skin
  ctx.fillRect(0, 0, w, h)
  // Soft cheek warmth.
  const blush = (u) => {
    const g = ctx.createRadialGradient(u * w, h * 0.55, 0, u * w, h * 0.55, w * 0.06)
    g.addColorStop(0, 'rgba(200,110,80,0.35)')
    g.addColorStop(1, 'rgba(200,110,80,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  blush(0.17)
  blush(0.33)
  // Beard: from the sideburns, along the cheek line, down over jaw and chin.
  const beardPath = () => {
    ctx.beginPath()
    ctx.moveTo(0.03 * w, 0.47 * h)
    ctx.bezierCurveTo(0.08 * w, 0.63 * h, 0.15 * w, 0.62 * h, 0.2 * w, 0.6 * h)
    ctx.bezierCurveTo(0.23 * w, 0.575 * h, 0.27 * w, 0.575 * h, 0.3 * w, 0.6 * h)
    ctx.bezierCurveTo(0.35 * w, 0.62 * h, 0.42 * w, 0.63 * h, 0.47 * w, 0.47 * h)
    ctx.lineTo(0.47 * w, h)
    ctx.lineTo(0.03 * w, h)
    ctx.closePath()
  }
  ctx.save()
  ctx.filter = 'blur(3px)'
  ctx.fillStyle = look.beard
  beardPath()
  ctx.fill()
  ctx.restore()
  // Stubble grain so the beard reads as hair, not paint.
  ctx.save()
  beardPath()
  ctx.clip()
  let seed = 5
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 2600; i++) {
    const u = 0.03 + rand() * 0.44
    const v = 0.5 + rand() * 0.5
    ctx.fillStyle = rand() > 0.4 ? 'rgba(6,4,3,0.55)' : 'rgba(90,60,45,0.14)'
    ctx.fillRect(u * w, v * h, 1.5, 2.5)
  }
  ctx.restore()
}

function paintJaw(ctx, w, h) {
  ctx.fillStyle = look.skin
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.filter = 'blur(2px)'
  ctx.fillStyle = look.beard
  ctx.fillRect(0, 0.36 * h, w, h)
  ctx.restore()
}

function canvasMap(width, height, paint) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  paint(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function useMaterials() {
  return useMemo(() => {
    const skin = new THREE.MeshPhysicalMaterial({
      color: look.skin,
      roughness: 0.52,
      sheen: 0.4,
      sheenColor: new THREE.Color('#ff9f73'),
      sheenRoughness: 0.6,
    })
    const face = skin.clone()
    face.color = new THREE.Color('#ffffff')
    face.map = canvasMap(512, 256, paintHead)
    const jaw = face.clone()
    jaw.map = canvasMap(128, 64, paintJaw)
    const shirt = new THREE.MeshStandardMaterial({
      color: look.shirt,
      roughness: 0.82,
      normalMap: denimNormal(),
      normalScale: new THREE.Vector2(0.28, 0.28),
    })
    const shirtDark = shirt.clone()
    shirtDark.color = new THREE.Color('#7a1a22')
    const trousers = new THREE.MeshStandardMaterial({
      color: look.trousers,
      roughness: 0.88,
      normalMap: weaveNormal(),
      normalScale: new THREE.Vector2(0.3, 0.3),
    })
    return {
      skin,
      face,
      jaw,
      shirt,
      shirtDark,
      trousers,
      hair: new THREE.MeshPhysicalMaterial({
        color: look.hair,
        roughness: 0.5,
        sheen: 0.6,
        sheenColor: new THREE.Color('#6b5a66'),
        sheenRoughness: 0.4,
      }),
      beard: new THREE.MeshStandardMaterial({ color: look.beard, roughness: 0.9 }),
      shoe: new THREE.MeshStandardMaterial({ color: look.shoe, roughness: 0.7, normalMap: weaveNormal() }),
      sole: new THREE.MeshStandardMaterial({ color: look.sole, roughness: 0.6 }),
      dark: new THREE.MeshStandardMaterial({ color: '#16110f', roughness: 0.35 }),
      eyeWhite: new THREE.MeshStandardMaterial({ color: '#f3eee8', roughness: 0.25 }),
      iris: new THREE.MeshStandardMaterial({ color: look.eye, roughness: 0.15 }),
      lips: new THREE.MeshStandardMaterial({ color: '#8a4a3a', roughness: 0.45 }),
      watch: new THREE.MeshStandardMaterial({ color: look.watch, metalness: 0.7, roughness: 0.3 }),
      button: new THREE.MeshStandardMaterial({ color: '#2a2422', metalness: 0.4, roughness: 0.4 }),
      highlight: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    }
  }, [])
}

// Torso shell from a lathe profile, flattened front-to-back.
function torsoGeometry(profile, depth = 0.7, width = 1.06) {
  const geometry = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    40,
  )
  geometry.scale(width, 1, depth)
  return geometry
}

// Curly hair: hundreds of small coils over the top and back of the head,
// fuller on top and tight on the sides, like the photo's curly top.
function useCurls() {
  return useMemo(() => {
    const curls = []
    let seed = 17
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    const golden = Math.PI * (3 - Math.sqrt(5))
    const N = 1500
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r
      // Keep to the scalp: skip the face, ears and below the hairline.
      if (y < -0.1) continue
      if (z > 0.3 && y < 0.42) continue
      if (Math.abs(x) > 0.75 && y < 0.2 && z > -0.4) continue
      const top = Math.max(0, y)
      const front = z > 0.1 ? 0.08 : 0
      // Layered volume: inner and outer shells give the curls depth.
      for (let layer = 0; layer < 2; layer++) {
        const puff = 0.06 + top * top * 0.42 + front + layer * 0.07 + rand() * 0.05
        if (layer === 1 && top < 0.2 && rand() > 0.4) continue
        curls.push({
          position: [x * 0.104 * (1 + puff), 0.112 + y * 0.126 * (1 + puff * 0.95), z * 0.11 * (1 + puff) - 0.004],
          scale: 0.0105 + top * 0.004 + rand() * 0.004,
          rotation: [rand() * 6.3, rand() * 6.3, rand() * 6.3],
          tone: rand(),
        })
      }
    }
    return curls
  }, [])
}

function Hair({ materials }) {
  const curls = useCurls()
  const mesh = useRef()
  // A fat torus reads as a single tight ringlet.
  const geometry = useMemo(() => new THREE.TorusGeometry(1, 0.55, 5, 9), [])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const c = new THREE.Color()
    const p = new THREE.Vector3()
    const sc = new THREE.Vector3()
    curls.forEach((curl, i) => {
      q.setFromEuler(e.set(...curl.rotation))
      m.compose(p.set(...curl.position), q, sc.setScalar(curl.scale))
      mesh.current.setMatrixAt(i, m)
      mesh.current.setColorAt(i, c.set(look.hair).offsetHSL(0.02, 0.05, curl.tone * 0.06))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
  }, [curls])

  return (
    <group>
      {/* Scalp: a crown cap plus a lower back panel give the hairline shape. */}
      <mesh position={[0, 0.118, -0.004]} scale={[0.106, 0.13, 0.114]} material={materials.hair} castShadow>
        <sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
      </mesh>
      <mesh position={[0, 0.118, -0.004]} scale={[0.106, 0.13, 0.114]} material={materials.hair} castShadow>
        <sphereGeometry args={[1, 28, 18, Math.PI * 0.98, Math.PI * 1.04, 0, Math.PI * 0.74]} />
      </mesh>
      <instancedMesh ref={mesh} args={[geometry, materials.hair, curls.length]} castShadow />
    </group>
  )
}

function Face({ materials, blinkRefs, mouthRef }) {
  return (
    <group>
      {/* Eyes */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.037, 0.128, 0.096]}>
          <mesh scale={[0.0145, 0.0095, 0.0075]} material={materials.eyeWhite}>
            <sphereGeometry args={[1, 20, 14]} />
          </mesh>
          <mesh position={[0, -0.0005, 0.0075]} material={materials.iris}>
            <circleGeometry args={[0.0068, 20]} />
          </mesh>
          <mesh position={[0.0025, 0.002, 0.008]} material={materials.highlight}>
            <circleGeometry args={[0.0018, 10]} />
          </mesh>
          {/* Upper lid, scaled by the blink animation. */}
          <group
            ref={(el) => {
              blinkRefs.current[side > 0 ? 1 : 0] = el
            }}
            position={[0, 0.012, 0]}
          >
            <mesh position={[0, -0.006, 0.002]} scale={[0.0175, 0.008, 0.011]} material={materials.skin}>
              <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
          {/* Thick brows. */}
          <mesh
            position={[side * 0.002, 0.022, 0.003]}
            rotation={[0, 0, Math.PI / 2 + side * 0.12]}
            scale={[1, 0.85, 0.7]}
            material={materials.beard}
          >
            <capsuleGeometry args={[0.0055, 0.024, 4, 8]} />
          </mesh>
        </group>
      ))}
      {/* Nose */}
      <mesh
        position={[0, 0.103, 0.106]}
        rotation={[0.35, 0, 0]}
        scale={[0.0145, 0.028, 0.016]}
        material={materials.skin}
      >
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.011, 0.09, 0.104]} scale={0.0078} material={materials.skin}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
      ))}
      {/* Moustache and lips sit on the painted beard. */}
      <mesh position={[0, 0.076, 0.104]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.65]} material={materials.beard}>
        <capsuleGeometry args={[0.0075, 0.03, 4, 10]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.025, 0.066, 0.1]} rotation={[0, 0, side * 0.5]} material={materials.beard}>
          <capsuleGeometry args={[0.006, 0.018, 4, 8]} />
        </mesh>
      ))}
      <group ref={mouthRef} position={[0, 0.058, 0.104]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.6]} material={materials.lips}>
          <capsuleGeometry args={[0.0045, 0.018, 4, 10]} />
        </mesh>
      </group>
      {/* Ears */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.101, 0.112, 0.002]} scale={[0.014, 0.028, 0.02]} material={materials.skin}>
          <sphereGeometry args={[1, 14, 12]} />
        </mesh>
      ))}
    </group>
  )
}

function Arm({ side, materials }) {
  const s = side === 'L' ? 1 : -1
  return (
    <group name={`upperArm${side}`} position={[s * BODY.shoulderX, BODY.shoulderY, 0]}>
      {/* Shoulder cap + sleeve */}
      <mesh scale={[1, 0.9, 0.95]} material={materials.shirt} castShadow>
        <sphereGeometry args={[0.053, 20, 16]} />
      </mesh>
      <mesh position={[0, -0.13, 0]} material={materials.shirt} castShadow>
        <cylinderGeometry args={[0.052, 0.049, 0.24, 20]} />
      </mesh>
      <group name={`foreArm${side}`} position={[0, -BODY.upperArm, 0]}>
        {/* Elbow + rolled cuff just below it */}
        <mesh material={materials.shirt} castShadow>
          <sphereGeometry args={[0.05, 18, 14]} />
        </mesh>
        <mesh position={[0, -0.035, 0]} material={materials.shirtDark} castShadow>
          <cylinderGeometry args={[0.053, 0.055, 0.06, 20]} />
        </mesh>
        <mesh position={[0, -0.145, 0]} material={materials.skin} castShadow>
          <cylinderGeometry args={[0.036, 0.029, 0.19, 16]} />
        </mesh>
        {side === 'L' && (
          <group position={[0, -0.215, 0]}>
            <mesh material={materials.watch}>
              <cylinderGeometry args={[0.033, 0.033, 0.018, 20]} />
            </mesh>
            <mesh position={[s * 0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.watch}>
              <cylinderGeometry args={[0.016, 0.016, 0.01, 20]} />
            </mesh>
          </group>
        )}
        <group name={`hand${side}`} position={[0, -BODY.foreArm, 0]}>
          <RoundedBox
            args={[0.03, 0.075, 0.07]}
            radius={0.013}
            position={[0, -0.035, 0.004]}
            material={materials.skin}
            castShadow
          />
          {/* Fingers, slightly curled */}
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[0, -0.085, -0.022 + i * 0.016]}
              rotation={[-0.15, 0, s * 0.12]}
              material={materials.skin}
              castShadow
            >
              <capsuleGeometry args={[0.0075, 0.03 - Math.abs(i - 1.5) * 0.004, 4, 8]} />
            </mesh>
          ))}
          <mesh position={[s * -0.004, -0.04, 0.042]} rotation={[0.6, 0, 0]} material={materials.skin}>
            <capsuleGeometry args={[0.008, 0.026, 4, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Leg({ side, materials }) {
  const s = side === 'L' ? 1 : -1
  return (
    <group name={`thigh${side}`} position={[s * BODY.hipX, -BODY.hipDrop, 0]}>
      <mesh position={[0, -BODY.thigh / 2, 0]} material={materials.trousers} castShadow>
        <cylinderGeometry args={[0.094, 0.08, BODY.thigh + 0.02, 22]} />
      </mesh>
      <group name={`shin${side}`} position={[0, -BODY.thigh, 0]}>
        <mesh material={materials.trousers} castShadow>
          <sphereGeometry args={[0.08, 20, 14]} />
        </mesh>
        {/* Wide, straight trouser leg breaking over the shoe. */}
        <mesh position={[0, -BODY.shin / 2 + 0.005, 0.004]} material={materials.trousers} castShadow>
          <cylinderGeometry args={[0.079, 0.086, BODY.shin + 0.01, 22]} />
        </mesh>
        <group name={`foot${side}`} position={[0, -BODY.shin, 0]}>
          {/* White high-top sneaker */}
          <mesh position={[0, -0.005, 0]} material={materials.shoe} castShadow>
            <cylinderGeometry args={[0.047, 0.05, 0.07, 18]} />
          </mesh>
          <RoundedBox
            args={[0.092, 0.07, 0.25]}
            radius={0.032}
            smoothness={3}
            position={[0, -0.025, 0.05]}
            material={materials.shoe}
            castShadow
          />
          <RoundedBox
            args={[0.1, 0.026, 0.27]}
            radius={0.011}
            position={[0, -0.047, 0.05]}
            material={materials.sole}
            castShadow
          />
          <mesh position={[0, -0.03, 0.155]} scale={[0.045, 0.026, 0.035]} material={materials.sole}>
            <sphereGeometry args={[1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0, -0.042, 0.05]}>
            <boxGeometry args={[0.101, 0.004, 0.262]} />
            <meshStandardMaterial color="#1c2340" roughness={0.6} />
          </mesh>
          {/* Laces */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.006 - i * 0.012, 0.045 + i * 0.026]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.04, 0.004, 0.006]} />
              <meshStandardMaterial color="#f7f4ef" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

function useShirtGeometry() {
  const lower = useMemo(
    () =>
      torsoGeometry([
        [0.0, -0.22],
        [0.165, -0.22],
        [0.168, -0.16],
        [0.156, -0.06],
        [0.152, 0.04],
        [0.156, 0.12],
        [0.15, 0.17],
      ]),
    [],
  )
  const upper = useMemo(
    () =>
      torsoGeometry([
        [0.164, -0.03],
        [0.172, 0.05],
        [0.178, 0.12],
        [0.168, 0.17],
        [0.13, 0.205],
        [0.075, 0.222],
        [0.0, 0.226],
      ]),
    [],
  )
  const neckline = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.045, 0)
    shape.lineTo(0.045, 0)
    shape.lineTo(0, -0.085)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [])

  return { lower, upper, neckline }
}

export default function ProceduralAvatar({ onReady, ...props }) {
  const materials = useMaterials()
  const shirt = useShirtGeometry()
  const root = useRef()
  const head = useRef()
  const neck = useRef()
  const mouth = useRef()
  const blinkRefs = useRef([])
  const blink = useRef({ next: 2, t: -1 })

  useLayoutEffect(() => {
    onReady?.({
      root: root.current,
      clips: proceduralClips(),
      head: head.current,
      neck: neck.current,
      mouth: mouth.current,
    })
  }, [onReady])

  // Natural blinking at random intervals.
  useFrame((_, delta) => {
    const b = blink.current
    b.next -= delta
    if (b.next <= 0 && b.t < 0) {
      b.t = 0
      b.next = 2 + Math.random() * 3.5
    }
    let open = 1
    if (b.t >= 0) {
      b.t += delta
      open = Math.abs(1 - Math.min(2, b.t / 0.07))
      if (b.t > 0.14) b.t = -1
    }
    blinkRefs.current.forEach((lid) => {
      if (lid) lid.scale.y = 1 + (1 - open) * 1.6
    })
  })

  const m = materials
  return (
    <group ref={root} {...props}>
      <group name="hips" position={[0, BODY.hipsY, 0]}>
        {/* Trouser seat */}
        <mesh position={[0, -0.04, 0]} scale={[0.172, 0.12, 0.1]} material={m.trousers} castShadow>
          <sphereGeometry args={[1, 28, 18]} />
        </mesh>
        <Leg side="L" materials={m} />
        <Leg side="R" materials={m} />

        <group name="spine" position={[0, BODY.spine, 0]}>
          {/* Untucked hem over the waistband */}
          <mesh geometry={shirt.lower} position={[0, -0.02, 0]} material={m.shirt} castShadow />
          <mesh position={[0, -0.03, 0.12]} material={m.shirtDark}>
            <boxGeometry args={[0.026, 0.22, 0.006]} />
          </mesh>
          {[-0.11, -0.03].map((y) => (
            <mesh key={y} position={[0, y, 0.124]} rotation={[Math.PI / 2, 0, 0]} material={m.button}>
              <cylinderGeometry args={[0.0065, 0.0065, 0.004, 12]} />
            </mesh>
          ))}

          <group name="chest" position={[0, BODY.chest, 0]}>
            <mesh geometry={shirt.upper} material={m.shirt} castShadow />
            <mesh position={[0, 0.03, 0.124]} material={m.shirtDark}>
              <boxGeometry args={[0.026, 0.13, 0.006]} />
            </mesh>
            <mesh position={[0, 0.06, 0.128]} rotation={[Math.PI / 2, 0, 0]} material={m.button}>
              <cylinderGeometry args={[0.0065, 0.0065, 0.004, 12]} />
            </mesh>
            {/* Chest pockets with flaps and buttons */}
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.08, 0.07, 0.12]} rotation={[-0.05, side * 0.32, 0]}>
                <RoundedBox args={[0.072, 0.078, 0.012]} radius={0.005} material={m.shirt} castShadow />
                <RoundedBox
                  args={[0.076, 0.026, 0.016]}
                  radius={0.005}
                  position={[0, 0.03, 0.003]}
                  material={m.shirtDark}
                />
                <mesh position={[0, 0.026, 0.012]} rotation={[Math.PI / 2, 0, 0]} material={m.button}>
                  <cylinderGeometry args={[0.005, 0.005, 0.004, 10]} />
                </mesh>
              </group>
            ))}
            {/* Open collar showing skin */}
            <mesh geometry={shirt.neckline} position={[0, 0.232, 0.092]} rotation={[-0.32, 0, 0]} material={m.skin} />
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.05, 0.215, 0.07]}
                rotation={[-0.6, side * -0.5, side * 0.55]}
                material={m.shirtDark}
                castShadow
              >
                <boxGeometry args={[0.07, 0.05, 0.008]} />
              </mesh>
            ))}
            <Arm side="L" materials={m} />
            <Arm side="R" materials={m} />

            <group ref={neck} name="neck" position={[0, BODY.neck, 0.005]}>
              <mesh position={[0, 0.04, 0]} material={m.skin} castShadow>
                <cylinderGeometry args={[0.047, 0.052, 0.11, 18]} />
              </mesh>
              <group ref={head} name="head" position={[0, BODY.head, 0.01]} scale={1.1}>
                <mesh position={[0, 0.11, 0]} scale={[0.1, 0.122, 0.11]} material={m.face} castShadow>
                  <sphereGeometry args={[1, 40, 28]} />
                </mesh>
                <mesh position={[0, 0.05, 0.03]} scale={[0.078, 0.06, 0.075]} material={m.jaw}>
                  <sphereGeometry args={[1, 28, 18]} />
                </mesh>
                <Face materials={m} blinkRefs={blinkRefs} mouthRef={mouth} />
                <Hair materials={m} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
