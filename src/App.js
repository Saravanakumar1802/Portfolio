import './App.css';
import About from './component/about/About';
import Header from './component/header/Header';
import Home from './component/home/Home';
import Skills from './component/skills/Skills';
import ProjectData from './component/projects/ProjectData';
import Contact from './component/contact/Contact';
import Footer from './component/footer/Footer';

function App() {
  return (
    <>

      <Header />

      <main className='main'>

        <Home />
        <About />
        <Skills />
        <ProjectData />
        <Contact />
        <Footer/>
  
      </main>




    </>
  );
}

export default App;
