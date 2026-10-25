import { FiCommand, FiGitBranch, FiGrid, FiHome, FiMessageCircle, FiUser } from 'react-icons/fi'

// Page sections in scroll order, used by the dock and active-section tracking.
export const SECTIONS = [
  { id: 'home', label: 'Home', icon: FiHome, tagline: 'Back to the studio' },
  { id: 'about', label: 'About', icon: FiUser, tagline: 'Booting SaravanaOS' },
  { id: 'experience', label: 'Experience', icon: FiGitBranch, tagline: '2.3 years of commits' },
  { id: 'work', label: 'Work', icon: FiGrid, tagline: 'Things I’ve shipped' },
  { id: 'skills', label: 'Toolkit', icon: FiCommand, tagline: 'One key away' },
  { id: 'contact', label: 'Contact', icon: FiMessageCircle, tagline: 'Let’s build something' },
]

export const SECTION_IDS = SECTIONS.map((s) => s.id)
