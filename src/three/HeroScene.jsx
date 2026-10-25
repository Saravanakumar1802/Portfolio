import { memo, useCallback, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { studio, useStudio } from '../lib/store'
import { initialQuality } from '../lib/device'
import { SHOTS } from './layout'
import Lights from './studio/Lights'
import Room from './studio/Room'
import Desk from './studio/Desk'
import Chair from './studio/Chair'
import { DeskLamp, Dust, PCTower, Plant } from './studio/Props'
import Character from './character/Character'
import CameraRig from './camera/CameraRig'
import PostFX from './effects/PostFX'

// Device pixel ratio cap per tier, and how far a struggling device may drop it.
const DPR = { high: 1.75, mid: 1.5 }
const MIN_DPR = 1
// Frame-rate monitoring starts once the intro is under way, so loading work
// is never mistaken for a slow device.
const MONITOR_DELAY = 4000

const bump = (value) => studio.set((s) => ({ loadProgress: Math.max(s.loadProgress, value) }))
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

// Soft image-based lighting from a procedural room (no HDR download), kept
// dim so the night mood stays but PBR surfaces get believable reflections.
function StudioEnvironment({ intensity = 0.28 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const texture = pmrem.fromScene(room, 0.04).texture
    scene.environment = texture
    scene.environmentIntensity = intensity
    return () => {
      scene.environment = null
      texture.dispose()
      room.dispose?.()
      pmrem.dispose()
    }
  }, [gl, scene, intensity])
  return null
}

function sceneTextures(scene) {
  const textures = new Set()
  scene.traverse((object) => {
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      if (!material) return
      Object.values(material).forEach((value) => value?.isTexture && textures.add(value))
      Object.values(material.uniforms ?? {}).forEach(({ value }) => value?.isTexture && textures.add(value))
    })
  })
  return [...textures]
}

// The canvas does not render while the loader is up. Once the avatar is in,
// shaders compile in parallel (KHR_parallel_shader_compile), textures upload
// one per frame, and two real frames are drawn — so the reveal never hits a
// first-use stall.
function WarmUp({ postFX, onWarm }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const advance = useThree((s) => s.advance)
  const avatarReady = useStudio((s) => s.avatarReady)

  useEffect(() => {
    bump(0.7)
    THREE.DefaultLoadingManager.onProgress = (_, loaded, total) => bump(0.7 + 0.15 * (loaded / total))
    return () => {
      THREE.DefaultLoadingManager.onProgress = undefined
    }
  }, [])

  useEffect(() => {
    if (!avatarReady) return undefined
    let cancelled = false
    ;(async () => {
      // With post-processing the scene renders into a buffer, which uses
      // different shader variants than drawing straight to the screen.
      const target = postFX ? new THREE.WebGLRenderTarget(1, 1) : null
      gl.setRenderTarget(target)
      await gl.compileAsync(scene, camera)
      gl.setRenderTarget(null)
      target?.dispose()
      if (cancelled) return
      bump(0.9)

      for (const texture of sceneTextures(scene)) {
        gl.initTexture(texture)
        await nextFrame()
        if (cancelled) return
      }
      bump(0.95)

      // Shadow maps, skinning and post-processing compile on the first draw.
      for (let i = 0; i < 2; i++) {
        advance(performance.now())
        await nextFrame()
        if (cancelled) return
      }
      onWarm()
    })()
    return () => {
      cancelled = true
    }
  }, [avatarReady, gl, scene, camera, advance, postFX, onWarm])

  return null
}

function HeroScene({ active, reducedMotion }) {
  const [tier] = useState(initialQuality)
  const [dpr, setDpr] = useState(DPR[tier])
  const [warm, setWarm] = useState(false)
  const [monitoring, setMonitoring] = useState(false)
  const revealed = useStudio((s) => s.revealed)

  // The canvas stays paused until the loader hands over, so the loader's
  // lights-on and dive have the GPU to themselves.

  // Shadows and post-processing are fixed for the session: toggling either
  // recompiles every shader, which is exactly the hitch to avoid. A slow
  // device sheds pixels (DPR) and the dust particles instead.
  const postFX = tier === 'high'

  const onWarm = useCallback(() => {
    setWarm(true)
    studio.set({ sceneReady: true, loadProgress: 1 })
  }, [])

  useEffect(() => {
    if (!revealed) return undefined
    const timer = setTimeout(() => setMonitoring(true), MONITOR_DELAY)
    return () => clearTimeout(timer)
  }, [revealed])

  const decline = () => setDpr((value) => Math.max(MIN_DPR, value - 0.25))

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, dpr]}
      frameloop={warm && revealed && active ? 'always' : 'never'}
      camera={{ fov: 36, near: 0.04, far: 40, position: SHOTS.intro.position }}
      gl={{ antialias: !postFX, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.3
        // Checking each program forces a synchronous wait on the GPU driver.
        gl.debug.checkShaderErrors = import.meta.env.DEV
      }}
      aria-hidden="true"
    >
      <color attach="background" args={['#0b1020']} />
      <fog attach="fog" args={['#0b1020', 9, 20]} />
      {monitoring && <PerformanceMonitor onDecline={decline} flipflops={3} />}

      <StudioEnvironment />
      <Lights />
      <Room />
      <Desk />
      <Chair />
      <DeskLamp />
      <PCTower />
      <Plant />
      {dpr > MIN_DPR && <Dust />}
      <Character reducedMotion={reducedMotion} />
      <CameraRig reducedMotion={reducedMotion} />
      {postFX && <PostFX />}
      {!warm && <WarmUp postFX={postFX} onWarm={onWarm} />}
    </Canvas>
  )
}

export default memo(HeroScene)
