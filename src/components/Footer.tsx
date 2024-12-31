import React from 'react';
import { Youtube } from 'lucide-react';

export function Footer() {
  return (
    <div className="text-center">
      <p className="text-white/80 mb-4">Você está nos links de Leonardo Candiani</p>
      <a
        href="https://youtube.com/@oleonardocandiani?si=dV5nPL7bhpM9d_ah"
        className="inline-block text-[#ff9900] hover:text-[#ffd700] transition-colors duration-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Youtube className="w-8 h-8" />
      </a>
    </div>
  );
}