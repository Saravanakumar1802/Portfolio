import { studio } from './store'

const FONTS = ['700 64px "Syne Variable"', '500 16px "Onest Variable"', '500 16px "Martian Mono Variable"']

let pending

// Loads everything the hero canvas needs, reporting progress to the loader.
// The 3D chunk downloads while the fonts (painted into canvas textures) load.
export function loadHeroScene() {
  pending ??= (async () => {
    const bump = (value) => studio.set((s) => ({ loadProgress: Math.max(s.loadProgress, value) }))
    bump(0.05)
    const scene = import('../three/HeroScene')
    await Promise.race([
      Promise.all(FONTS.map((font) => document.fonts.load(font))),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ])
    bump(0.2)
    const module = await scene
    bump(0.6)
    return module
  })()
  return pending
}
