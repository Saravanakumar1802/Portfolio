// The hero character.
//  - 'glb':        a rigged model (default: public/models/saravana.glb, built by
//                  scripts/avatar from the MIT-licensed Microsoft Rocketbox library)
//  - 'procedural': the stylized fallback built in code (src/three/character/ProceduralAvatar.jsx)
//
// For a GLB, map each action the director uses to the clip name inside the file.
export const character = {
  source: 'glb',
  url: '/models/saravana.glb',
  // Rendered height in metres; the model is scaled to fit.
  height: 1.8,
  // Extra turn if the model doesn't face +Z.
  rotationY: 0,
  // Walking pace that matches the walk clip's stride (m/s at this height).
  walkSpeed: 0.975,
  // Seated: how far the hips sit forward (+) / back (−) of the chair axis,
  // plus a final nudge so they rest on the cushion.
  seatBack: -0.07,
  seatOffset: [0, -0.012, 0],
  clips: {
    idle: 'idle',
    walk: 'walk',
    wave: 'wave',
    sit: 'sit',
    type: 'type',
    talk: 'talk',
  },
}

// Look of the procedural fallback character, sampled from the profile photo.
export const look = {
  skin: '#b06a45',
  skinShade: '#8e5133',
  hair: '#141012',
  beard: '#1f1612',
  shirt: '#8f2028',
  shirtStitch: '#c4515a',
  trousers: '#e9e2d8',
  shoe: '#f4f1ec',
  sole: '#d9d3ca',
  watch: '#3a3634',
  eye: '#24160f',
}
