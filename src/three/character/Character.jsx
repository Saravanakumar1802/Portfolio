import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../../lib/gsap'
import { frame, studio, useStudio } from '../../lib/store'
import { character } from '../../data/character'
import { site } from '../../data/site'
import { CHAIR, ROUTE, SHOTS } from '../layout'
import GlbAvatar from './GlbAvatar'
import ProceduralAvatar from './ProceduralAvatar'
import SpeechBubble from './SpeechBubble'
import { FaceDriver, applyLook, applyTyping } from './overlays'
import { SIT_BACK, rig } from './rig'

// Matches the walk clip's stride so the feet don't slide (scripts/avatar logs it).
const WALK_SPEED = character.source === 'glb' ? character.walkSpeed : 1.05
const SEATED_YAW = Math.PI
// Root offset from the chair axis (along his facing) when standing in front of
// the chair and once seated. The mocap sit clip keeps the hips over the root,
// so the root slides back onto the cushion; the procedural clip moves the hips
// itself, so its root stays put.
const SEAT =
  character.source === 'glb' ? { stand: 0.26, seated: character.seatBack } : { stand: SIT_BACK, seated: SIT_BACK }
// Facing the camera from the chair (used when clicked mid-work).
const BREAK_YAW = Math.PI * 2 + Math.atan2(SHOTS.wide.position[0] - CHAIR.x, SHOTS.wide.position[2] - CHAIR.parkedZ)

// Dev-only: ?pose=idle|wave|talk|walk freezes the character at the greeting
// spot facing the camera, for inspecting the model.
const devPose = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('pose') : null

const headingTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2])
const distance = (a, b) => Math.hypot(b[0] - a[0], b[2] - a[2])
const standSpot = [CHAIR.x, 0, CHAIR.parkedZ + SEAT.stand]
const LOOK_WEIGHT = { waiting: 0, enter: 0.2, greet: 1, toChair: 0, work: 0.15, break: 0.9 }

const blobShadowTexture = (() => {
  let texture
  return () => {
    if (texture) return texture
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    texture = new THREE.CanvasTexture(canvas)
    return texture
  }
})()

export default function Character({ reducedMotion }) {
  const root = useRef()
  const anchor = useRef()
  const shadow = useRef()
  const avatar = useRef(null)
  const mixer = useRef(null)
  const actions = useRef({})
  const current = useRef(null)
  const timeline = useRef(null)
  const look = useRef({ yaw: 0, pitch: 0, weight: 0, typing: 0 })
  const face = useRef(null)
  // Placement driven by GSAP: position on the floor, facing, and seated flag.
  const place = useRef({
    x: ROUTE.start[0],
    z: ROUTE.start[2],
    yaw: headingTo(ROUTE.start, ROUTE.greet),
    seated: false,
    seat: SEAT.stand,
  })
  const [ready, setReady] = useState(false)
  const [hovered, setHovered] = useState(false)
  const revealed = useStudio((s) => s.revealed)
  const replayToken = useStudio((s) => s.replayToken)
  const skipToken = useStudio((s) => s.skipToken)
  const speaking = useStudio((s) => s.speech !== '')
  useCursor(hovered)

  const scratch = useMemo(() => ({ v: new THREE.Vector3(), axis: new THREE.Vector3() }), [])

  const onReady = useCallback((api) => {
    avatar.current = api
    mixer.current?.stopAllAction()
    const m = new THREE.AnimationMixer(api.root)
    mixer.current = m
    actions.current = Object.fromEntries(
      Object.entries(api.clips)
        .filter(([, clip]) => clip)
        .map(([name, clip]) => [name, m.clipAction(clip)]),
    )
    current.current = null
    face.current = api.face ? new FaceDriver(api.face) : null
    if (import.meta.env.DEV) window.__studioAvatar = { api, place: place.current }
    setReady(true)
    studio.set({ avatarReady: true })
  }, [])

  const play = useCallback((name, fade = 0.35) => {
    const next = actions.current[name]
    if (!next || current.current === next) return
    next.reset().setEffectiveWeight(1).fadeIn(fade).play()
    current.current?.fadeOut(fade)
    current.current = next
  }, [])

  const say = (text) => studio.set({ speech: text })
  const setPhase = (phase) => studio.set({ phase })

  // Builds the intro story: walk in → greet → walk to chair → sit → swivel → type.
  const buildIntro = useCallback(() => {
    const p = place.current
    Object.assign(p, {
      x: ROUTE.start[0],
      z: ROUTE.start[2],
      yaw: headingTo(ROUTE.start, ROUTE.greet),
      seated: false,
      seat: SEAT.stand,
    })
    rig.chairYaw = 0
    rig.chairZ = CHAIR.parkedZ
    say('')

    const toCamera = headingTo(ROUTE.greet, SHOTS.wide.position)
    const toChair = headingTo(ROUTE.greet, standSpot)
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })

    tl.call(() => {
      setPhase('enter')
      play('walk', 0.2)
    })
      .to(p, {
        x: ROUTE.greet[0],
        z: ROUTE.greet[2],
        duration: distance(ROUTE.start, ROUTE.greet) / WALK_SPEED,
        ease: 'none',
      })
      .call(() => play('idle', 0.45))
      .to(p, { yaw: toCamera, duration: 0.55 }, '-=0.2')
      .call(() => {
        setPhase('greet')
        play('wave', 0.4)
        say(site.greeting[0])
      })
      .call(
        () => {
          play('talk', 0.5)
          say(site.greeting[1])
        },
        null,
        '+=2.4',
      )
      .call(() => say(''), null, '+=3.2')
      .call(() => {
        setPhase('toChair')
        play('idle', 0.3)
      })
      .to(p, { yaw: toChair, duration: 0.45 })
      .call(() => play('walk', 0.25), null, '-=0.15')
      .to(p, {
        x: standSpot[0],
        z: standSpot[2],
        duration: distance(ROUTE.greet, standSpot) / WALK_SPEED,
        ease: 'none',
      })
      .call(() => play('idle', 0.35))
      .to(p, { yaw: 0, duration: 0.6 }, '-=0.15')
      .call(() => {
        play('sit', 0.9)
        p.seated = true
      })
      // Lower back onto the cushion as the sit blends in.
      .to(p, { seat: SEAT.seated, duration: 0.9, ease: 'power2.inOut' })
      // Swivel round to the desk while the chair rolls in.
      .to(rig, {
        chairYaw: SEATED_YAW,
        duration: 1.5,
        onUpdate: () => {
          p.yaw = rig.chairYaw
        },
      })
      .to(rig, { chairZ: CHAIR.workZ, duration: 1.3, ease: 'power2.inOut' }, '<0.25')
      .call(
        () => {
          setPhase('work')
          play('type', 0.5)
        },
        null,
        '-=0.3',
      )
    return tl
  }, [play])

  // Starts once the loader reveals the page; replays on request.
  useEffect(() => {
    if (!ready || !revealed) return undefined
    timeline.current?.kill()
    if (devPose) {
      Object.assign(place.current, {
        x: ROUTE.greet[0],
        z: ROUTE.greet[2],
        yaw: headingTo(ROUTE.greet, SHOTS.wide.position),
        seated: false,
      })
      setPhase('greet')
      play(devPose, 0)
      return undefined
    }
    if (reducedMotion) {
      Object.assign(place.current, { yaw: SEATED_YAW, seated: true, seat: SEAT.seated })
      rig.chairYaw = SEATED_YAW
      rig.chairZ = CHAIR.workZ
      setPhase('work')
      play('type', 0)
      return undefined
    }
    timeline.current = buildIntro()
    return () => timeline.current?.kill()
  }, [ready, revealed, replayToken, reducedMotion, buildIntro, play])

  useEffect(() => {
    if (skipToken > 0) timeline.current?.progress(1)
  }, [skipToken])

  const onClick = (event) => {
    event.stopPropagation()
    const phase = studio.get().phase
    const quip = site.quips[Math.floor(Math.random() * site.quips.length)]
    if (phase === 'greet') {
      play('wave', 0.3)
      say(quip)
      return
    }
    if (phase !== 'work') return
    // Swivel round, wave, say something, swivel back to work.
    timeline.current?.kill()
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
    const yawUpdate = () => {
      place.current.yaw = rig.chairYaw
    }
    tl.call(() => {
      setPhase('break')
      play('sit', 0.4)
    })
      .to(rig, { chairZ: CHAIR.parkedZ, duration: 0.6 })
      .to(rig, { chairYaw: BREAK_YAW, duration: 1, onUpdate: yawUpdate }, '<0.2')
      .call(
        () => {
          play('sitWave', 0.35)
          say(quip)
        },
        null,
        '-=0.2',
      )
      .call(
        () => {
          play('sit', 0.4)
          say('')
        },
        null,
        '+=2.6',
      )
      .to(rig, { chairYaw: SEATED_YAW + Math.PI * 2, duration: 1.1, onUpdate: yawUpdate })
      .to(rig, { chairZ: CHAIR.workZ, duration: 0.8 }, '-=0.3')
      .call(() => {
        rig.chairYaw = SEATED_YAW
        place.current.yaw = SEATED_YAW
        setPhase('work')
        play('type', 0.5)
      })
    timeline.current = tl
  }

  useFrame((state, delta) => {
    const r = root.current
    const api = avatar.current
    if (!r || !api) return
    const p = place.current

    // Place the root: when seated it orbits the chair axis with the swivel.
    if (p.seated) {
      r.position.set(CHAIR.x + Math.sin(p.yaw) * p.seat, 0, rig.chairZ + Math.cos(p.yaw) * p.seat)
      if (api.seatOffset) r.position.add(scratch.v.set(...api.seatOffset))
    } else {
      r.position.set(p.x, 0, p.z)
    }
    r.rotation.y = p.yaw

    // One clock for everything: the story timeline and the clips advance by
    // the same capped frame delta, so a stalled frame slows the scene down
    // instead of letting his position jump ahead of his legs.
    const step = Math.min(delta, 0.1)
    const tl = timeline.current
    if (tl && tl.progress() < 1) tl.time(tl.time() + step)
    mixer.current?.update(step)

    // Procedural layers on top of the clip: head look, typing hands, face.
    const phase = studio.get().phase
    const talking = studio.get().speech !== ''
    const l = look.current
    l.weight = THREE.MathUtils.damp(l.weight, LOOK_WEIGHT[phase] ?? 0, 4, delta)
    l.yaw = THREE.MathUtils.damp(l.yaw, frame.pointer.x * 0.55, 6, delta)
    l.pitch = THREE.MathUtils.damp(l.pitch, -frame.pointer.y * 0.25, 6, delta)
    l.typing = THREE.MathUtils.damp(l.typing, phase === 'work' ? 1 : 0, 5, delta)
    const time = state.clock.elapsedTime
    if (api.hands) {
      applyLook(api, l.yaw * l.weight, l.pitch * l.weight, p.yaw, scratch.axis)
      applyTyping(api, time, l.typing, p.yaw, scratch.axis)
    } else {
      // Procedural rig: joints are axis-aligned with the character.
      api.neck?.rotateY(l.yaw * l.weight * 0.4)
      api.head?.rotateY(l.yaw * l.weight * 0.6)
      api.head?.rotateX(l.pitch * l.weight)
    }
    face.current?.update(delta, time, { talking, smiling: phase === 'greet' || phase === 'break' })
    if (api.mouth) {
      api.mouth.scale.y = talking ? 1 + Math.abs(Math.sin(time * 16)) * 1.8 : 1
    }

    // Bubble anchor rides above the head; blob shadow stays under the hips.
    if (api.head && anchor.current) {
      api.head.getWorldPosition(scratch.v)
      anchor.current.position.set(scratch.v.x, scratch.v.y + 0.34, scratch.v.z)
    }
    if (shadow.current) {
      shadow.current.position.set(p.seated ? CHAIR.x : p.x, 0.006, p.seated ? rig.chairZ : p.z)
    }
  })

  useEffect(() => () => mixer.current?.stopAllAction(), [])

  const avatarProps = {
    onReady,
    onClick,
    onPointerOver: (e) => {
      e.stopPropagation()
      setHovered(true)
    },
    onPointerOut: () => setHovered(false),
  }

  return (
    <>
      <group ref={root} position={ROUTE.start}>
        {character.source === 'glb' ? (
          <Suspense fallback={null}>
            <GlbAvatar {...avatarProps} />
          </Suspense>
        ) : (
          <ProceduralAvatar {...avatarProps} />
        )}
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial map={blobShadowTexture()} transparent depthWrite={false} />
      </mesh>
      <group ref={anchor}>
        {speaking && (
          <Html center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
            <SpeechBubble />
          </Html>
        )}
      </group>
    </>
  )
}
