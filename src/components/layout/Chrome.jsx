import { SECTION_IDS } from '../../data/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import Dock from './Dock'
import TopBar from './TopBar'
import SectionTransition from './SectionTransition'

// Fixed navigation chrome. Owns the active-section state so section changes
// re-render only the bars, never the page or its canvases.
export default function Chrome() {
  const active = useActiveSection(SECTION_IDS)
  return (
    <>
      <TopBar visible={active === 'home'} />
      <Dock active={active} />
      <SectionTransition />
    </>
  )
}
