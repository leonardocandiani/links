import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import AmbientBg from './AmbientBg';
import DotMatrix from './DotMatrix';

const projects = [
  {
    title: 'SixClaw',
    description:
      'Framework multi-agente de IA para WhatsApp. Sua empresa ganha um "Jarvis" próprio que filtra, prioriza, responde e delega — 24/7, sem custo de atendente.',
    tech: ['AI Agents', 'WhatsApp', 'Claude', 'Bun'],
    featured: true,
  },
  {
    title: 'SegSmart',
    description:
      'Plataforma de tecnologia e IA para corretores de seguros. Automatiza cotação, renovação e atendimento.',
    tech: ['Seguros', 'IA', 'Automação'],
  },
  {
    title: 'Proteauto',
    description:
      'Proteção veicular movida por IA. Vistoria com computer vision, CRM inteligente e bots que fecham venda no WhatsApp.',
    tech: ['Computer Vision', 'CRM', 'Bots'],
  },
];

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

export default function Projects() {
  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }, []);

  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-32 lg:py-40 px-6 relative overflow-hidden">
      <AmbientBg variant={3} />
      <DotMatrix />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight">
            IA que gera <span className="text-accent">resultado</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl">
            Projetos reais, empresas reais, receita real. Não é protótipo —
            é tecnologia que já está escalando negócios agora.
          </p>
        </motion.div>

        {/* Bento: featured (2/3) + stacked (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Featured project — spans 2 cols */}
          {featured && (
            <motion.div
              className="lg:col-span-2 lg:row-span-2 spotlight-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-12 flex flex-col justify-between min-h-[320px] lg:min-h-[420px] group cursor-pointer overflow-hidden"
              onMouseMove={handleSpotlight}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.1 }}
              whileHover={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs text-accent/70 tracking-widest uppercase">
                    Principal
                  </span>
                </div>
                <h3 className="text-3xl md:text-5xl font-serif font-bold mb-5 group-hover:text-accent transition-colors duration-300">
                  {featured.title}
                </h3>
                <p className="text-white/60 text-lg leading-relaxed max-w-[50ch] mb-8">
                  {featured.description}
                </p>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div className="flex flex-wrap gap-2">
                  {featured.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs bg-accent/[0.08] text-accent/80 rounded-full border border-accent/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-accent transition-colors" />
              </div>
            </motion.div>
          )}

          {/* Smaller projects */}
          {rest.map((project, i) => (
            <motion.div
              key={project.title}
              className="spotlight-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col justify-between min-h-[200px] group cursor-pointer overflow-hidden"
              onMouseMove={handleSpotlight}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.2 + i * 0.1 }}
              whileHover={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-white/50 leading-relaxed text-sm mb-5">
                  {project.description}
                </p>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 text-xs bg-accent/[0.06] text-accent/70 rounded-full border border-accent/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
