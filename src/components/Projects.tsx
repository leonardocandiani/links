import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Lock } from 'lucide-react';
import { clusters } from '../data/projects';
import AmbientBg from './AmbientBg';
import DotMatrix from './DotMatrix';

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

export default function Projects() {
  const [active, setActive] = useState(clusters[0].id);
  const current = clusters.find((c) => c.id === active) ?? clusters[0];

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <section id="projects" className="py-28 lg:py-36 px-6 relative overflow-hidden">
      <AmbientBg variant={3} />
      <DotMatrix />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <span className="eyebrow text-accent/70">// o que eu construo</span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mt-4 mb-4 tracking-tight">
            Um ecossistema de <span className="text-gradient-amber">IA aplicada</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl">
            Não é protótipo. É tecnologia que já roda em produção, atende cliente
            real e fatura. Cada caixa abaixo é uma frente que toco hoje.
          </p>
        </motion.div>

        {/* Tabs de cluster */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-2 mb-10 -mx-1 px-1"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.1 }}
        >
          {clusters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-300 border ${
                active === c.id
                  ? 'bg-accent text-dark font-medium border-accent shadow-amber-sm'
                  : 'border-white/10 text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </motion.div>

        {/* Tagline do cluster ativo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-tag`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-7"
          >
            <p className="text-accent/80 font-serif text-xl md:text-2xl italic">
              {current.tagline}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Grid de projetos do cluster */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {current.projects.map((project, i) => {
              const Wrapper = project.url ? motion.a : motion.div;
              return (
                <Wrapper
                  key={project.name}
                  {...(project.url
                    ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="spotlight-card glow-border group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col min-h-[200px] overflow-hidden"
                  onMouseMove={handleSpotlight}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: i * 0.05 }}
                >
                  <div className="relative z-10 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-mono text-base text-white/90 group-hover:text-accent transition-colors duration-300">
                        {project.name}
                      </h3>
                      {project.openSource ? (
                        <span className="eyebrow text-accent/60 mt-1">OSS</span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed mb-5">
                      {project.blurb}
                    </p>
                  </div>
                  <div className="relative z-10 flex items-end justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-[11px] bg-accent/[0.06] text-accent/70 rounded-full border border-accent/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {project.url && (
                      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors shrink-0" />
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
