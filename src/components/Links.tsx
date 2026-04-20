import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Youtube, Sparkles, ChevronRight } from 'lucide-react';
import AmbientBg from './AmbientBg';
import ScrollPath from './ScrollPath';

const links = [
  {
    icon: FileText,
    title: 'Templates',
    description: 'Documentos e planilhas prontos pra você ganhar tempo',
    url: 'https://drive.google.com/drive/folders/1G1Tl5k01EDlUSDRx_sbuIUY5P14pHytz?usp=sharing',
  },
  {
    icon: Sparkles,
    title: 'Prompts de IA',
    description: 'Prompts testados que geram resultado de verdade',
    url: 'https://drive.google.com/drive/folders/13CFux9alUBxCOZBA2U3erz_Mi_OiUlta?usp=drive_link',
  },
  {
    icon: Youtube,
    title: 'YouTube',
    description: 'Aulas práticas sobre IA, automação e produtividade',
    url: 'https://youtube.com/@oleonardocandiani',
  },
];

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

export default function Links() {
  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <section id="links" className="py-32 lg:py-40 px-6 relative overflow-hidden">
      <AmbientBg variant={5} />
      <ScrollPath variant={2} />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight">
            Recursos <span className="text-accent">gratuitos</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl">
            Tudo que eu uso no dia a dia pra escalar empresas com IA.
            Pegue, aplique, colha o resultado.
          </p>
        </motion.div>

        <div className="space-y-4">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-card group block rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                onMouseMove={handleSpotlight}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: i * 0.1 }}
              >
                <div className="relative z-10 p-7 flex items-center gap-6">
                  <div className="p-3.5 rounded-xl bg-accent/[0.08] border border-accent/10 shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-serif font-bold group-hover:text-accent transition-colors duration-300">
                      {link.title}
                    </h3>
                    <p className="text-white/50 text-sm mt-0.5">{link.description}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
