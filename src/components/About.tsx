import { motion } from 'framer-motion';
import AmbientBg from './AmbientBg';
import ScrollPath from './ScrollPath';

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

const stats = [
  { value: '7+', label: 'anos com automação' },
  { value: '2019', label: 'trabalhando com IA' },
  { value: '4', label: 'empresas ativas' },
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
            {/* Selo de localizacao */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-dark/70 backdrop-blur-md border border-white/10">
              <span className="font-mono text-xs text-white/70">Maringá · PR · Brasil</span>
            </div>
          </motion.div>

          {/* Content */}
          <div>
            <motion.span
              className="eyebrow text-accent/70 block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              // sobre mim
            </motion.span>

            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mt-4 mb-8 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring }}
            >
              Quem <span className="text-gradient-amber">constrói</span> o seu futuro
            </motion.h2>

            <motion.div
              className="space-y-5 text-white/70 text-lg leading-relaxed max-w-[55ch]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.15 }}
            >
              <p>
                Estou com automação desde 2018 e com IA desde 2019. Ajudo
                empresas a trocar processo manual por sistema que roda sozinho,
                com inteligência artificial de verdade, longe do hype.
              </p>
              <p>
                Sou cofundador da{' '}
                <span className="text-white font-medium">SixQuasar</span> e criador
                do <span className="text-white font-medium">SixClaw</span>, a
                plataforma multi-agente que opera venda e atendimento da{' '}
                <span className="text-white font-medium">Proteauto</span> e da{' '}
                <span className="text-white font-medium">SegSmart</span> no
                WhatsApp. O que aprendo no caminho vira conteúdo no YouTube.
              </p>
            </motion.div>

            {/* Filosofia */}
            <motion.blockquote
              className="mt-10 pl-6 border-l-2 border-accent/40"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.25 }}
            >
              <p className="font-serif text-2xl md:text-3xl italic text-white/85 leading-snug">
                Shipar vence perfeição.
              </p>
              <p className="text-white/45 text-base mt-2 max-w-[48ch]">
                Construo ferramentas pra resolver problema real do mercado, e
                depois descubro como escalar.
              </p>
            </motion.blockquote>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 mt-12"
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
                  <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-amber">
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
