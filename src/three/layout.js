// World layout for the studio, in metres. Floor is y = 0, the back wall sits
// at z = BACK_WALL_Z and the camera looks roughly toward -z.

export const BACK_WALL_Z = -1.6
export const RIGHT_WALL_X = 2.4

export const DESK = {
  position: [0.85, 0, -1.16],
  width: 1.7,
  depth: 0.76,
  height: 0.76,
}

// Top surface of the desk in world space.
export const DESK_TOP_Y = DESK.height

export const MONITOR = {
  // Centre of the curved main screen.
  position: [0.78, 1.1, -1.38],
  width: 0.86,
  height: 0.37,
}

export const SIDE_MONITOR = {
  position: [1.48, 1.14, -1.26],
  rotationY: -0.55,
  width: 0.3,
  height: 0.5,
}

export const KEYBOARD = { position: [0.78, DESK_TOP_Y + 0.012, -1.0] }

// Gaming chair: it starts parked away from the desk facing the room, and rolls
// in to `workZ` once he is seated and swivelled round.
export const CHAIR = { x: 0.8, parkedZ: -0.34, workZ: -0.76, seatHeight: 0.515 }
CHAIR.position = [CHAIR.x, 0, CHAIR.parkedZ]

// Character route.
export const ROUTE = {
  start: [-3.9, 0, 1.1],
  greet: [-0.25, 0, 0.75],
}

// Camera shots: position + look-at target.
export const SHOTS = {
  intro: { position: [-1.2, 3.4, 10.5], target: [0.3, 1.2, -0.4] },
  wide: { position: [-0.7, 1.75, 5.7], target: [0.32, 1.0, -0.35] },
  desk: { position: [-1.75, 1.65, 2.15], target: [0.6, 1.0, -0.75] },
  shoulder: { position: [0.42, 1.48, 0.62], target: [0.78, 1.08, -1.3] },
  screen: { position: [0.78, 1.1, -1.02], target: [0.78, 1.1, -1.5] },
}

export const COLORS = {
  lamp: '#ffd3a1',
  monitor: '#7cc4ff',
  crimson: '#e8364f',
  moon: '#8aa2ff',
  wall: '#171d36',
  wallDark: '#10152a',
}
