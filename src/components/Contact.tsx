import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram, Youtube } from 'lucide-react';
import AmbientBg from './AmbientBg';
import RadialPulse from './RadialPulse';
import ScrollPath from './ScrollPath';

const contacts = [
  {
    icon: MessageCircle,
    title: 'WhatsApp direto',
    description: 'Resposta em até 24h',
    url: 'https://wa.me/5544998893474?text=Ol%C3%A1%20Leo%2C%20quero%20aplicar%20IA%20na%20minha%20empresa',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    description: '@leonardocandiani',
    url: 'https://instagram.com/leonardocandiani',
  },
  {
    icon: Youtube,
    title: 'YouTube',
    description: '@oleonardocandiani',
    url: 'https://youtube.com/@oleonardocandiani',
  },
];

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

export default function Contact() {
  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <section id="contact" className="py-32 lg:py-40 px-6 relative overflow-hidden">
      <AmbientBg variant={6} />
      <ScrollPath variant={3} />
      <RadialPulse />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            Sua empresa merece <span className="text-accent">IA de verdade</span>
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-3">
            Se você é empresário e quer parar de depender de processos manuais,
            atendentes sobrecarregados e planilhas que ninguém atualiza — bora
            conversar.
          </p>
          <p className="text-base text-white/40 max-w-xl">
            Projeto sob medida, implementação rápida, resultado mensurável.
            Sem pacote fechado, sem papo de agência.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          {contacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <motion.a
                key={contact.title}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-card group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 text-center overflow-hidden"
                onMouseMove={handleSpotlight}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: i * 0.1 }}
              >
                <div className="relative z-10">
                  <div className="inline-flex p-3.5 rounded-xl bg-accent/[0.08] border border-accent/10 mb-5">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-1.5 group-hover:text-accent transition-colors duration-300">
                    {contact.title}
                  </h3>
                  <p className="text-white/50 text-sm">{contact.description}</p>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.3 }}
        >
          <a
            href="https://wa.me/5544998893474?text=Ol%C3%A1%20Leo%2C%20quero%20aplicar%20IA%20na%20minha%20empresa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-12 py-5 bg-accent hover:bg-accent-dim text-dark font-bold text-lg rounded-full transition-all duration-300 active:scale-[0.97] active:translate-y-[1px] shadow-[0_12px_40px_-8px_rgba(245,158,11,0.5)]"
          >
            <MessageCircle className="w-5 h-5" />
            Quero aplicar IA na minha empresa
          </a>
          <p className="text-xs text-white/30 mt-4 tracking-wide">
            Resposta em até 24h &middot; Atendimento pessoal, direto comigo
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="max-w-7xl mx-auto mt-32 pt-10 border-t border-white/[0.06] text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-white/40 text-sm mb-2">
          Leonardo Candiani &middot; {new Date().getFullYear()}
        </p>
        <p className="text-white/25 text-xs">
          Construindo o futuro, uma linha de código por vez.
        </p>
      </motion.footer>
    </section>
  );
}
