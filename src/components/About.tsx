import { motion } from 'framer-motion';
import AmbientBg from './AmbientBg';
import ScrollPath from './ScrollPath';

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

const stats = [
  { value: '7+', label: 'Anos com automação' },
  { value: '2019', label: 'Trabalhando com IA' },
  { value: '4', label: 'Empresas ativas' },
];

export default function About() {
  return (
    <section id="about" className="py-32 lg:py-40 px-6 relative overflow-hidden">
      <AmbientBg variant={2} />
      <ScrollPath variant={1} />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Image — slightly oversized with overlap */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ ...spring }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <img
                src="/images/profile-pic.jpg"
                alt="Leonardo Candiani"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
            </div>
            {/* Accent bar */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-accent/20 rounded-2xl" />
          </motion.div>

          {/* Content */}
          <div>
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-8 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring }}
            >
              Quem <span className="text-accent">constrói</span> o seu futuro
            </motion.h2>

            <motion.div
              className="space-y-5 text-white/70 text-lg leading-relaxed max-w-[55ch]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.15 }}
            >
              <p>
                Desde 2018 com automação e 2019 com IA, ajudo empresas a
                transformar processos manuais em sistemas que rodam sozinhos —
                com inteligência artificial de verdade, não hype.
              </p>
              <p>
                Trabalho na{' '}
                <span className="text-white font-medium">SegSmart</span>{' '}
                (tecnologia para corretores) e na{' '}
                <span className="text-white font-medium">Proteauto</span>{' '}
                (proteção veicular com computer vision). Sou fundador da{' '}
                <span className="text-white font-medium">Six Quasar</span>,
                criadora do <span className="text-white font-medium">SixClaw</span>{' '}
                — framework multi-agente de IA para WhatsApp que hoje atende
                milhares de clientes.
              </p>
              <p className="text-accent/90 font-medium text-base tracking-wide">
                Se você é empresário e quer aplicar IA no seu negócio, esse é o
                lugar certo.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 mt-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.3 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="border-l border-accent/30 pl-5"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: 0.4 + i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-serif font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
