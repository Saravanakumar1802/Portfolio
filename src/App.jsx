import StudioLoader from './components/loader/StudioLoader'
import Chrome from './components/layout/Chrome'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Experience from './components/sections/Experience'
import Projects from './components/sections/Projects'
import Skills from './components/sections/Skills'
import Contact from './components/sections/Contact'
import { useReducedMotion } from './hooks/useMediaQuery'

export default function App() {
  const reducedMotion = useReducedMotion()
  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-4 z-[200] rounded-lg bg-ink px-4 py-2 font-semibold text-midnight"
      >
        Skip to content
      </a>
      <StudioLoader reducedMotion={reducedMotion} />
      <Chrome />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
