let webglSupport

export function supportsWebGL() {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    webglSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

// Starting render quality; PerformanceMonitor can lower it at runtime.
export function initialQuality() {
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse || cores <= 4 || memory <= 4) return 'mid'
  return 'high'
}
