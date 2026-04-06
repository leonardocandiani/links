import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img
                src="/images/profile-pic.jpg"
                alt="Leonardo Candiani"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
            </div>
            
            {/* Decorative element */}
            <motion.div
              className="absolute -bottom-6 -right-6 w-48 h-48 border-4 border-accent rounded-2xl -z-10"
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
              Sobre <span className="text-accent">Mim</span>
            </h2>
            
            <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
              <p>
                Especialista em tecnologia e inteligência artificial, baseado em Maringá, PR.
                Estudo automação desde 2018 e IA desde 2019.
              </p>
              
              <p>
                Atuo na <span className="text-white font-medium">SegSmart</span> com 
                automação e IA aplicada a proteção veicular, e estou construindo o{' '}
                <span className="text-white font-medium">SixClaw</span> — um framework 
                multi-agente de IA para WhatsApp, produto da SixQuasar.
              </p>
              
              <p className="text-accent font-medium">
                Direto, sem enrolação. Construo coisas reais com IA.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="border-l-4 border-accent pl-6">
                <div className="text-4xl font-serif font-bold text-accent">7+</div>
                <div className="text-gray-500 mt-1">Anos com automação</div>
              </div>
              <div className="border-l-4 border-accent pl-6">
                <div className="text-4xl font-serif font-bold text-accent">2019</div>
                <div className="text-gray-500 mt-1">Trabalhando com IA</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
