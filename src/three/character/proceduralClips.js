import * as THREE from 'three'
import { BODY, JOINTS, SIT_BACK, SIT_HIPS_Y } from './rig'

// Each clip is a pose function sampled into keyframes. A pose is
// { joint: [x, y, z] Euler radians, hipsPosition: [x, y, z] }. Conventions,
// with the character facing +z: negative x on arms/thighs swings forward,
// positive x on shins bends the knee, positive x on spine/head leans forward.

const TAU = Math.PI * 2
const zero = [0, 0, 0]

function standingBase(t = 0) {
  const breath = Math.sin(t * TAU * 0.25)
  return {
    hipsPosition: [0, BODY.hipsY + breath * 0.003, 0],
    hips: [0, 0, 0],
    spine: [0.02 + breath * 0.008, 0, 0],
    chest: [-0.02 - breath * 0.012, 0, 0],
    neck: [0.04, 0, 0],
    head: [-0.03, 0, 0],
    upperArmL: [0.03, 0, 0.1 + breath * 0.01],
    foreArmL: [-0.18, 0, 0],
    handL: [0, 0, 0.05],
    upperArmR: [0.03, 0, -0.1 - breath * 0.01],
    foreArmR: [-0.18, 0, 0],
    handR: [0, 0, -0.05],
    thighL: [0, 0, 0.03],
    shinL: [0.03, 0, 0],
    footL: [-0.03, 0, 0],
    thighR: [0, 0, -0.03],
    shinR: [0.03, 0, 0],
    footR: [-0.03, 0, 0],
  }
}

function idle(t) {
  const pose = standingBase(t)
  const sway = Math.sin(t * TAU * 0.25)
  pose.hips = [0, sway * 0.02, sway * 0.015]
  pose.hipsPosition[0] = sway * 0.008
  pose.head = [-0.03 + Math.sin(t * TAU * 0.5) * 0.01, Math.sin(t * TAU * 0.25 + 1) * 0.05, 0]
  return pose
}

function walk(t, duration) {
  const p = (t / duration) * TAU
  const s = Math.sin(p)
  const c = Math.cos(p)
  const pose = standingBase(0)
  pose.hipsPosition = [0, BODY.hipsY - 0.016 + Math.cos(2 * p) * 0.018, 0]
  pose.hips = [0, s * 0.09, c * 0.03]
  pose.spine = [0.06, 0, 0]
  pose.chest = [-0.02, -s * 0.12, -c * 0.02]
  pose.head = [-0.05, s * 0.03, 0]
  pose.thighL = [-0.48 * s, 0, 0.03]
  pose.thighR = [0.48 * s, 0, -0.03]
  pose.shinL = [0.08 + 0.75 * Math.max(0, c), 0, 0]
  pose.shinR = [0.08 + 0.75 * Math.max(0, -c), 0, 0]
  pose.footL = [-0.12 * s + 0.15 * Math.max(0, c), 0, 0]
  pose.footR = [0.12 * s + 0.15 * Math.max(0, -c), 0, 0]
  pose.upperArmL = [0.42 * s, 0, 0.1]
  pose.upperArmR = [-0.42 * s, 0, -0.1]
  pose.foreArmL = [-0.25 - 0.25 * Math.max(0, -s), 0, 0]
  pose.foreArmR = [-0.25 - 0.25 * Math.max(0, s), 0, 0]
  return pose
}

function waveArm(pose, t, side = 'R') {
  const sign = side === 'R' ? -1 : 1
  const w = Math.sin((t / 0.6) * TAU)
  pose[`upperArm${side}`] = [-0.3, 0, sign * 1.25]
  pose[`foreArm${side}`] = [0, 0, sign * (1.6 + w * 0.35)]
  pose[`hand${side}`] = [0, 0, sign * w * 0.15]
  return pose
}

function wave(t) {
  const pose = idle(0)
  waveArm(pose, t)
  pose.chest = [-0.03, 0.08, 0.04]
  pose.head = [-0.05, 0.08, -0.06]
  return pose
}

function talk(t) {
  const pose = idle(0)
  const g = Math.sin(t * TAU * 0.5)
  pose.upperArmL = [-0.25, 0, 0.18]
  pose.foreArmL = [-1.05 + g * 0.15, 0.25, 0]
  pose.handL = [0, 0.3, 0.2]
  pose.head = [-0.02 + Math.sin(t * TAU) * 0.03, 0.06, Math.sin(t * TAU * 0.5) * 0.04]
  return pose
}

function seatedBase(t = 0) {
  const breath = Math.sin(t * TAU * 0.3)
  return {
    hipsPosition: [0, SIT_HIPS_Y, -SIT_BACK],
    hips: [0, 0, 0],
    spine: [-0.06 + breath * 0.006, 0, 0],
    chest: [0.02 - breath * 0.01, 0, 0],
    neck: [0.04, 0, 0],
    head: [0.02, 0, 0],
    upperArmL: [-0.28, 0, 0.16],
    foreArmL: [-1.0, -0.15, 0],
    handL: [0, 0, 0],
    upperArmR: [-0.28, 0, -0.16],
    foreArmR: [-1.0, 0.15, 0],
    handR: [0, 0, 0],
    thighL: [-1.4, 0, 0.08],
    shinL: [1.4, 0, -0.06],
    footL: [0.05, 0, 0],
    thighR: [-1.4, 0, -0.08],
    shinR: [1.4, 0, 0.06],
    footR: [0.05, 0, 0],
  }
}

function sit(t) {
  return seatedBase(t)
}

// Frequencies are whole multiples of 1 / duration so the loop is seamless.
function type(t) {
  const pose = seatedBase(t)
  const a = Math.sin(t * TAU * 4.2)
  const b = Math.sin(t * TAU * 3.3 + 1.3)
  pose.spine = [0.1, 0, 0]
  pose.chest = [0.06, 0, 0]
  pose.neck = [0.04, 0, 0]
  pose.head = [0.06 + Math.sin(t * TAU * 0.6) * 0.015, Math.sin(t * TAU * 0.3) * 0.04, 0]
  pose.upperArmL = [-0.95, 0, 0.16]
  pose.upperArmR = [-0.95, 0, -0.16]
  pose.foreArmL = [-0.95 + a * 0.04, -0.35, 0]
  pose.foreArmR = [-0.95 + b * 0.04, 0.35, 0]
  pose.handL = [0.12 + a * 0.12, 0, 0]
  pose.handR = [0.12 + b * 0.12, 0, 0]
  return pose
}

function sitWave(t) {
  const pose = seatedBase(0)
  waveArm(pose, t)
  pose.spine = [-0.1, 0, 0]
  pose.chest = [0, 0.1, 0.04]
  pose.head = [-0.04, 0.06, -0.05]
  return pose
}

const POSES = {
  idle: { fn: idle, duration: 4, samples: 32 },
  walk: { fn: walk, duration: 1.05, samples: 24 },
  wave: { fn: wave, duration: 1.2, samples: 24 },
  talk: { fn: talk, duration: 2, samples: 24 },
  sit: { fn: sit, duration: 10 / 3, samples: 16 },
  type: { fn: type, duration: 10 / 3, samples: 90 },
  sitWave: { fn: sitWave, duration: 1.2, samples: 24 },
}

const euler = new THREE.Euler()
const quaternion = new THREE.Quaternion()

function bake(name, { fn, duration, samples }) {
  const times = []
  const rotations = Object.fromEntries(JOINTS.map((joint) => [joint, []]))
  const hips = []

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * duration
    times.push(t)
    // Sample the last key at t = 0 so loops close seamlessly.
    const pose = fn(i === samples ? 0 : t, duration)
    JOINTS.forEach((joint) => {
      quaternion.setFromEuler(euler.set(...(pose[joint] ?? zero)))
      rotations[joint].push(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
    })
    hips.push(...pose.hipsPosition)
  }

  const tracks = JOINTS.map(
    (joint) => new THREE.QuaternionKeyframeTrack(`${joint}.quaternion`, times, rotations[joint]),
  )
  tracks.push(new THREE.VectorKeyframeTrack('hips.position', times, hips))
  return new THREE.AnimationClip(name, duration, tracks)
}

let baked

export function proceduralClips() {
  baked ??= Object.fromEntries(Object.entries(POSES).map(([name, spec]) => [name, bake(name, spec)]))
  return baked
}
