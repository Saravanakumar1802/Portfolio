import { useEffect, useRef } from 'react'
import { COLORS, ROUTE } from '../layout'

// Night-studio lighting: cool moonlight through the window, a crimson rim on
// the walkway, a soft cool fill from the room. The desk lamp (Props) and the
// monitor glow (Desk) are the warm and cool key lights.
export default function Lights() {
  const rim = useRef()
  const moon = useRef()
  const key = useRef()

  useEffect(() => {
    rim.current?.target.position.set(ROUTE.greet[0], 1, ROUTE.greet[2])
    rim.current?.target.updateMatrixWorld()
    moon.current?.target.position.set(0.2, 0, 0)
    moon.current?.target.updateMatrixWorld()
    key.current?.target.position.set(ROUTE.greet[0], 1.2, ROUTE.greet[2])
    key.current?.target.updateMatrixWorld()
  }, [])

  return (
    <>
      <hemisphereLight args={['#4a5aa8', '#151a33', 1.1]} />
      <directionalLight ref={moon} color={COLORS.moon} intensity={0.55} position={[-2.2, 3.2, -4]} />
      <spotLight
        ref={rim}
        color={COLORS.crimson}
        intensity={26}
        angle={0.6}
        penumbra={0.9}
        decay={2}
        distance={9}
        position={[-2.6, 2.8, -1.2]}
      />
      {/* Key light on the greeting spot so the face reads at a distance. */}
      <spotLight
        ref={key}
        color="#dfe6ff"
        intensity={55}
        angle={0.42}
        penumbra={1}
        decay={2}
        distance={12}
        position={[-1.4, 3.4, 3.6]}
      />
      <pointLight color="#5b6cc4" intensity={3} distance={7} decay={2} position={[1.5, 2.2, 1.8]} />
      <pointLight color="#ffb98a" intensity={1.6} distance={5} decay={2} position={[0.4, 1.8, -0.6]} />
    </>
  )
}
