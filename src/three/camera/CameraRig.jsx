import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../../lib/gsap'
import { frame, useStudio } from '../../lib/store'
import { SHOTS } from '../layout'

const v = (a) => new THREE.Vector3(...a)
const INTRO_SECONDS = 2.8
const introEase = gsap.parseEase('power3.inOut')

const devCamera = import.meta.env.DEV
  ? new URLSearchParams(window.location.search).get('cam')?.split(',').map(Number)
  : null

// Intro dolly → wide shot, then scroll flies wide → over-the-shoulder → into
// the monitor. Pointer adds gentle parallax; narrow screens pull back.
export default function CameraRig({ reducedMotion }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const revealed = useStudio((s) => s.revealed)
  const working = useStudio((s) => s.phase === 'work' || s.phase === 'break')
  const deskBlend = useRef(0)
  const intro = useRef({ raw: reducedMotion ? 1 : 0, t: reducedMotion ? 1 : 0 })
  const parallax = useRef(new THREE.Vector2())

  const path = useMemo(
    () => ({
      position: new THREE.CatmullRomCurve3([
        v(SHOTS.wide.position),
        v(SHOTS.shoulder.position),
        v(SHOTS.screen.position),
      ]),
      target: new THREE.CatmullRomCurve3([v(SHOTS.wide.target), v(SHOTS.shoulder.target), v(SHOTS.screen.target)]),
      wide: { position: v(SHOTS.wide.position), target: v(SHOTS.wide.target) },
      desk: { position: v(SHOTS.desk.position), target: v(SHOTS.desk.target) },
      introPosition: v(SHOTS.intro.position),
      introTarget: v(SHOTS.intro.target),
    }),
    [],
  )
  const scratch = useMemo(
    () => ({ position: new THREE.Vector3(), target: new THREE.Vector3(), back: new THREE.Vector3() }),
    [],
  )

  // The intro dolly advances with the frame clock (like the character), so a
  // stalled frame never makes the camera leap.
  useEffect(() => {
    if (reducedMotion) intro.current.t = 1
  }, [reducedMotion])

  useFrame((_, delta) => {
    if (revealed && intro.current.raw < 1) {
      intro.current.raw = Math.min(1, intro.current.raw + Math.min(delta, 0.1) / INTRO_SECONDS)
      intro.current.t = introEase(intro.current.raw)
    }
    const aspect = size.width / size.height
    const progress = reducedMotion ? 0 : frame.heroProgress
    const eased = THREE.MathUtils.smootherstep(progress, 0, 1)

    // Once he sits down, the opening shot eases in toward the desk.
    deskBlend.current = THREE.MathUtils.damp(deskBlend.current, working ? 1 : 0, 0.9, delta)
    const k = THREE.MathUtils.smootherstep(deskBlend.current, 0, 1)
    path.position.points[0].lerpVectors(path.wide.position, path.desk.position, k)
    path.target.points[0].lerpVectors(path.wide.target, path.desk.target, k)

    path.position.getPoint(eased, scratch.position)
    path.target.getPoint(eased, scratch.target)

    // Blend in from the intro shot.
    const t = intro.current.t
    if (t < 1) {
      scratch.position.lerpVectors(path.introPosition, scratch.position, t)
      scratch.target.lerpVectors(path.introTarget, scratch.target, t)
    }

    // Portrait screens: back the wide shot off so the scene fits, and aim
    // lower so the studio sits in the top half above the hero copy.
    const pullBack = aspect < 1.2 ? (1.2 - aspect) * 1.6 : 0
    if (pullBack > 0) {
      scratch.back.subVectors(scratch.position, scratch.target).normalize()
      scratch.position.addScaledVector(scratch.back, pullBack * (1 - eased))
      scratch.target.y -= pullBack * 0.75 * (1 - eased)
      scratch.target.x += pullBack * 0.04 * (1 - eased)
    }

    const calm = 1 - eased
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, frame.pointer.x, 3, delta)
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, frame.pointer.y, 3, delta)
    scratch.position.x += parallax.current.x * 0.22 * calm
    scratch.position.y += parallax.current.y * 0.1 * calm

    // Dev-only: ?cam=x,y,z,tx,ty,tz pins the camera for inspecting the scene.
    if (import.meta.env.DEV && devCamera) {
      scratch.position.set(...devCamera.slice(0, 3))
      scratch.target.set(...devCamera.slice(3, 6))
    }

    camera.position.copy(scratch.position)
    camera.lookAt(scratch.target)

    // Shift the frame right on wide screens so the hero copy has room on the left.
    const offset = aspect > 1.15 && !devCamera ? -6 * calm : 0
    if (Math.abs(camera.filmOffset - offset) > 0.001) {
      camera.filmOffset = offset
      camera.updateProjectionMatrix()
    }
  })

  return null
}
