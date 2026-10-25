import { useSyncExternalStore } from 'react'

// A minimal external store shared by the DOM and the 3D scene, so the
// canvas can read/write state without re-rendering the React tree.
function createStore(initial) {
  let state = initial
  const listeners = new Set()

  return {
    get: () => state,
    set(partial) {
      const next = typeof partial === 'function' ? partial(state) : partial
      state = { ...state, ...next }
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const studio = createStore({
  // 0 → 1 while the 3D chunk downloads and shaders compile.
  loadProgress: 0,
  // The loader has finished and revealed the page.
  revealed: false,
  // The canvas compiled and rendered its first frames.
  sceneReady: false,
  // The character model has loaded (the loader waits for it).
  avatarReady: false,
  // Character story: 'waiting' | 'enter' | 'greet' | 'toChair' | 'work' | 'break'
  phase: 'waiting',
  // Text shown in the character's speech bubble ('' hides it).
  speech: '',
  lampOn: true,
  // Incremented to ask the director to replay / skip the intro.
  replayToken: 0,
  skipToken: 0,
})

// Toolkit keyboard: which skill is highlighted, a token bumped per press, and
// how far the board has swung up as its section scrolls in (0 → 1).
export const keyboard = createStore({ activeId: null, pressId: null, pressToken: 0, entry: 1 })

export function useKeyboard(selector) {
  return useSyncExternalStore(keyboard.subscribe, () => selector(keyboard.get()))
}

// Values written every frame live outside React state entirely.
export const frame = {
  heroProgress: 0,
  pointer: { x: 0, y: 0 },
}

export function useStudio(selector) {
  return useSyncExternalStore(studio.subscribe, () => selector(studio.get()))
}
