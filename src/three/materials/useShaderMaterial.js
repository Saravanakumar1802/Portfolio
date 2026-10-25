import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// Builds a ShaderMaterial once. Passing uniforms through the constructor keeps
// the object by reference, so mutating `material.uniforms.x.value` each frame
// reaches the GPU. (A `uniforms` JSX prop gets copied by R3F, which breaks that.)
export function useShaderMaterial(shader, uniforms, options) {
  const material = useMemo(
    () => new THREE.ShaderMaterial({ ...shader, uniforms: uniforms(), ...options }),
    // Built once per mount; shader sources and options are module constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  return material
}
