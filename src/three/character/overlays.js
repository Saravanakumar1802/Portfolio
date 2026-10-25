import * as THREE from 'three'

// Procedural layers applied on top of the playing clip each frame (after the
// mixer has written the pose): head look-at, typing hands, face expressions.
// Rotations are done around world axes so they work on any skeleton.

const _parent = new THREE.Quaternion()
const _delta = new THREE.Quaternion()
const _inverse = new THREE.Quaternion()

// Rotates `bone` by `angle` around a world-space `axis`, keeping its parent.
export function rotateInWorld(bone, axis, angle) {
  if (!bone || !angle) return
  bone.parent.updateWorldMatrix(true, false)
  bone.parent.getWorldQuaternion(_parent)
  _delta.setFromAxisAngle(axis, angle)
  // local' = P⁻¹ · D · P · local
  _delta.premultiply(_inverse.copy(_parent).invert()).multiply(_parent)
  bone.quaternion.premultiply(_delta)
}

const UP = new THREE.Vector3(0, 1, 0)

// Axis pointing to the character's side (its local +X) for a given yaw.
export function sideAxis(yaw, target = new THREE.Vector3()) {
  return target.set(Math.cos(yaw), 0, -Math.sin(yaw))
}

export function applyLook(api, yaw, pitch, facing, axis) {
  rotateInWorld(api.neck, UP, yaw * 0.4)
  rotateInWorld(api.head, UP, yaw * 0.6)
  rotateInWorld(api.head, sideAxis(facing, axis), pitch)
}

// Fingers tapping keys: each hand bobs from the wrist, fingers flick in turn.
export function applyTyping(api, time, weight, facing, axis) {
  if (!weight) return
  const side = sideAxis(facing, axis)
  ;['L', 'R'].forEach((hand, h) => {
    const phase = time * (h ? 11 : 9.5) + h * 1.7
    rotateInWorld(api.hands?.[hand], side, Math.sin(phase) * 0.07 * weight)
    api.fingers?.[hand]?.forEach((finger, i) => {
      const tap = Math.max(0, Math.sin(time * 13 + i * 1.9 + h * 2.4))
      rotateInWorld(finger, side, tap * tap * 0.35 * weight)
    })
  })
}

// Blinks at natural intervals, mouth shapes while speaking, a light smile.
export class FaceDriver {
  constructor(mesh) {
    this.mesh = mesh
    this.dict = mesh?.morphTargetDictionary ?? {}
    this.blinkIn = 1.5
    this.blinkT = -1
    this.mouth = { aa: 0, O: 0, JawOpen: 0, smile: 0 }
  }

  set(name, value) {
    const index = this.dict[name]
    if (index !== undefined) this.mesh.morphTargetInfluences[index] = value
  }

  update(delta, time, { talking, smiling }) {
    if (!this.mesh) return
    // Blink: quick close/open every 2–5.5s.
    this.blinkIn -= delta
    if (this.blinkIn <= 0 && this.blinkT < 0) {
      this.blinkT = 0
      this.blinkIn = 2 + Math.random() * 3.5
    }
    let blink = 0
    if (this.blinkT >= 0) {
      this.blinkT += delta
      blink = 1 - Math.abs(this.blinkT / 0.08 - 1)
      if (this.blinkT > 0.16) this.blinkT = -1
    }
    this.set('EyeBlinkLeft', Math.max(0, blink))
    this.set('EyeBlinkRight', Math.max(0, blink))

    // Speech: alternate open vowels with a rounded "O".
    const m = this.mouth
    const syllable = Math.max(0, Math.sin(time * 14)) * (0.6 + 0.4 * Math.sin(time * 3.1))
    const damp = (from, to) => THREE.MathUtils.damp(from, to, 18, delta)
    m.aa = damp(m.aa, talking ? syllable * 0.7 : 0)
    m.O = damp(m.O, talking ? Math.max(0, Math.sin(time * 7 + 1)) * 0.35 : 0)
    m.JawOpen = damp(m.JawOpen, talking ? syllable * 0.25 : 0)
    m.smile = THREE.MathUtils.damp(m.smile, smiling ? 0.55 : 0.12, 4, delta)
    this.set('aa', m.aa)
    this.set('O', m.O)
    this.set('JawOpen', m.JawOpen)
    this.set('MouthSmileLeft', m.smile)
    this.set('MouthSmileRight', m.smile)
    this.set('BrowInnerUp', talking ? 0.25 + syllable * 0.15 : 0)
  }
}
