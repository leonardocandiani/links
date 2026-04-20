import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import AmbientBg from './AmbientBg';
import DotMatrix from './DotMatrix';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function useTextScramble(text: string, delay = 0) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' ';
              if (i < iteration) return text[i];
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join('')
        );
        iteration += 0.4;
        if (iteration >= text.length) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, 35);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return display;
}

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

export default function Hero() {
  const firstName = useTextScramble('Leonardo', 400);
  const lastName = useTextScramble('Candiani', 700);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/bg-hero.jpg"
          alt=""
          className="w-full h-full object-cover opacity-20 lg:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/90 to-dark/30 hidden lg:block" />
        <div className="absolute inset-0 bg-dark/75 lg:hidden" />
      </div>

      {/* Interactive dot matrix */}
      <DotMatrix />

      {/* Ambient mesh gradient blobs */}
      <AmbientBg variant={1} />

      {/* Final dark gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-16">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-accent/90 border border-accent/20 rounded-full mb-10 bg-accent/[0.03] backdrop-blur-sm"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            IA & Automação para Empresas
          </motion.span>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter leading-[0.9] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <span className="block text-white/95">{firstName || '\u00A0'}</span>
            <span className="block text-accent mt-1">{lastName || '\u00A0'}</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/70 mb-6 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            Transformo empresas em <span className="text-white font-medium">máquinas de IA</span>.
            Agentes que atendem, vendem e escalam — enquanto você dorme.
          </motion.p>

          <motion.p
            className="text-sm md:text-base text-white/40 mb-12 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.9 }}
          >
            Sem enrolação. Sem hype. Resultado real, em semanas, não meses.
          </motion.p>

          <motion.div
            className="flex gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 1 }}
          >
            <a
              href="#contact"
              className="group px-8 py-4 bg-accent text-dark font-semibold rounded-full transition-all duration-300 hover:bg-accent-dim active:scale-[0.97] active:translate-y-[1px] shadow-[0_8px_32px_-8px_rgba(245,158,11,0.4)]"
            >
              Aplicar IA na minha empresa
            </a>
            <a
              href="#projects"
              className="px-8 py-4 border border-white/20 text-white/80 hover:text-accent hover:border-accent/40 font-medium rounded-full transition-all duration-300 active:scale-[0.97] active:translate-y-[1px] backdrop-blur-sm"
            >
              Ver projetos
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 2, duration: 0.5 },
          y: { delay: 2, duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <ArrowDown className="w-5 h-5 text-accent/60" />
      </motion.div>
    </section>
  );
}
