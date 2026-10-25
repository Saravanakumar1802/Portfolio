import { CHAIR } from '../layout'

// Skeleton dimensions for the procedural character (metres) and the shared,
// per-frame values the director writes for other scene objects to read.

export const BODY = {
  hipsY: 0.95,
  spine: 0.1,
  chest: 0.17,
  neck: 0.2,
  head: 0.08,
  shoulderX: 0.185,
  shoulderY: 0.155,
  upperArm: 0.28,
  foreArm: 0.25,
  hipX: 0.095,
  hipDrop: 0.05,
  thigh: 0.44,
  shin: 0.4,
}

// Hips height when seated so the thighs rest on the cushion.
export const SIT_HIPS_Y = 0.6
// How far the hips travel back from the standing spot when sitting.
export const SIT_BACK = 0.3

export const JOINTS = [
  'hips',
  'spine',
  'chest',
  'neck',
  'head',
  'upperArmL',
  'foreArmL',
  'handL',
  'upperArmR',
  'foreArmR',
  'handR',
  'thighL',
  'shinL',
  'footL',
  'thighR',
  'shinR',
  'footR',
]

export const rig = {
  // Chair swivel angle and roll position, animated with the seated character.
  chairYaw: 0,
  chairZ: CHAIR.parkedZ,
}
