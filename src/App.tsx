import Nav from './components/Nav';
import MouseSpotlight from './components/MouseSpotlight';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Instagram from './components/Instagram';
import Links from './components/Links';
import Contact from './components/Contact';

function App() {
  return (
    <div className="min-h-screen bg-dark text-white relative">
      <MouseSpotlight />
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Instagram />
      <Links />
      <Contact />
    </div>
  );
}

export default App;
