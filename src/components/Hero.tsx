import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image + animated overlay */}
      <div className="absolute inset-0">
        <img src="/images/bg-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/30 via-transparent to-dark" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold mb-6 leading-tight">
            Leonardo
            <br />
            <span className="text-accent">Candiani</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-gray-400 mb-12 font-light tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Construindo o futuro com IA
        </motion.p>

        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a
            href="#projects"
            className="px-8 py-4 bg-accent hover:bg-accent-dim text-dark font-medium rounded-full transition-all duration-300 hover:scale-105"
          >
            Ver Projetos
          </a>
          <a
            href="#contact"
            className="px-8 py-4 border-2 border-accent text-accent hover:bg-accent hover:text-dark font-medium rounded-full transition-all duration-300 hover:scale-105"
          >
            Entrar em Contato
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="w-6 h-6 text-accent" />
      </motion.div>
    </section>
  );
}
