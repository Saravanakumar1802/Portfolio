// Section navigation goes through a shutter transition instead of scrolling.
// Components call navigateTo(id); SectionTransition performs the move.
let handler = null

export function setNavigationHandler(fn) {
  handler = fn
  return () => {
    if (handler === fn) handler = null
  }
}

export function navigateTo(id) {
  if (handler) handler(id)
  else document.getElementById(id)?.scrollIntoView()
}

// Instantly places a section at the top of the viewport and moves focus to it
// for keyboard and screen-reader users.
export function jumpTo(id) {
  const target = document.getElementById(id)
  if (!target) return
  const top = id === 'home' ? 0 : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: 'instant' })
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
  history.replaceState(null, '', `#${id}`)
}
