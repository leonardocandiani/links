import Nav from './components/Nav';
import MouseSpotlight from './components/MouseSpotlight';
import Hero from './components/Hero';
import About from './components/About';
import Stack from './components/Stack';
import Projects from './components/Projects';
import GitHubStats from './components/GitHubStats';
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
      <Stack />
      <Projects />
      <GitHubStats />
      <Instagram />
      <Links />
      <Contact />
    </div>
  );
}

export default App;
