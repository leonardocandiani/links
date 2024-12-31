import React from 'react';
import { Container } from './components/Container';
import { Hero } from './components/Hero';
import { LinkSection } from './components/LinkSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Container>
        <Hero />
        <LinkSection />
        <AboutSection />
        <Footer />
      </Container>
    </div>
  );
}

export default App;