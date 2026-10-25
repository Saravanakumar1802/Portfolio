import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BACK_WALL_Z, COLORS } from '../layout'
import { weaveNormal } from '../materials/textures'

// Pointy-top honeycomb. Rows hold 4-5-6-5-4 cells centred on one axis; as
// neighbouring row counts differ by one, the half-cell offsets interlock
// exactly and the cluster reads as one symmetric hexagon.
const RADIUS = 0.118
const GAP = 0.014
const ROW_COUNTS = [4, 5, 6, 5, 4]
const CENTRE = [0.66, 1.32]
// Accent panels climb diagonally; LED halos sit behind a few others.
const ACCENT = new Set(['0:2', '1:2', '2:3', '3:3', '4:3'])
const LED = new Set(['1:0', '2:5', '4:0'])

function hexShape(radius) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const x = Math.cos(a) * radius
    const y = Math.sin(a) * radius
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

function useCells() {
  return useMemo(() => {
    const width = Math.sqrt(3) * RADIUS
    const rowStep = 1.5 * RADIUS
    const cells = []
    ROW_COUNTS.forEach((count, row) => {
      for (let i = 0; i < count; i++) {
        const key = `${row}:${i}`
        const offset = i - (count - 1) / 2
        const x = CENTRE[0] + offset * width
        const y = CENTRE[1] + row * rowStep
        // A soft relief: panels near the middle sit a little proud of the wall.
        const centre = Math.hypot(offset / 3, (row - 2) / 2.2)
        const depth = 0.004 + (1 - Math.min(1, centre)) * 0.018 + (ACCENT.has(key) ? 0.02 : 0)
        cells.push({ x, y, depth, accent: ACCENT.has(key), led: LED.has(key), phase: x * 3 + y * 2 })
      }
    })
    return cells
  }, [])
}

export default function AcousticWall() {
  const cells = useCells()
  const panels = useRef()
  const glows = useRef()
  const ledCells = useMemo(() => cells.filter((c) => c.led), [cells])
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hexShape(RADIUS - GAP / 2 - 0.006), {
      depth: 0.024,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 3,
      curveSegments: 1,
    })
    // UVs for the felt weave: planar in panel space.
    const pos = g.attributes.position
    const uv = new Float32Array(pos.count * 2)
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) * 4
      uv[i * 2 + 1] = pos.getY(i) * 4
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    return g
  }, [])
  const glowGeometry = useMemo(() => new THREE.ShapeGeometry(hexShape(RADIUS + 0.012)), [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.96,
        normalMap: weaveNormal(),
        normalScale: new THREE.Vector2(0.6, 0.6),
      }),
    [],
  )
  const scratch = useMemo(
    () => ({ m: new THREE.Matrix4(), c: new THREE.Color(), led: new THREE.Color(COLORS.monitor) }),
    [],
  )

  useLayoutEffect(() => {
    cells.forEach((cell, i) => {
      scratch.m.makeTranslation(cell.x, cell.y, BACK_WALL_Z + cell.depth)
      panels.current.setMatrixAt(i, scratch.m)
      const base = cell.accent ? '#8f2028' : i % 3 === 0 ? '#273058' : i % 2 ? '#1e2647' : '#222b50'
      panels.current.setColorAt(i, scratch.c.set(base))
    })
    panels.current.instanceMatrix.needsUpdate = true
    panels.current.instanceColor.needsUpdate = true
    ledCells.forEach((cell, i) => {
      scratch.m.makeTranslation(cell.x, cell.y, BACK_WALL_Z + 0.002)
      glows.current.setMatrixAt(i, scratch.m)
      glows.current.setColorAt(i, scratch.led)
    })
    glows.current.instanceMatrix.needsUpdate = true
    glows.current.instanceColor.needsUpdate = true
  }, [cells, ledCells, scratch])

  // LED halos breathe in a slow travelling wave.
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ledCells.forEach((cell, i) => {
      const pulse = 1.4 + Math.sin(t * 1.2 - cell.phase) * 0.9
      glows.current.setColorAt(i, scratch.c.copy(scratch.led).multiplyScalar(pulse))
    })
    glows.current.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={glows} args={[glowGeometry, undefined, ledCells.length]} raycast={() => null}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={panels} args={[geometry, material, cells.length]} castShadow receiveShadow />
    </group>
  )
}
