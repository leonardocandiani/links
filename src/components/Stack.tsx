import { motion } from 'framer-motion';
import { Code2, Boxes, Database, BrainCircuit, MessageSquare } from 'lucide-react';

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

const groups = [
  {
    icon: Code2,
    label: 'Linguagens',
    items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Bash'],
  },
  {
    icon: Boxes,
    label: 'Frameworks & Runtimes',
    items: ['Next.js', 'React', 'Node.js', 'Bun', 'Vite', 'Three.js'],
  },
  {
    icon: Database,
    label: 'Dados & Infra',
    items: ['PostgreSQL', 'Supabase', 'Redis', 'Cloudflare', 'Vercel', 'Docker', 'Railway'],
  },
  {
    icon: BrainCircuit,
    label: 'IA & Agentes',
    items: ['Claude', 'OpenAI', 'n8n', 'LangChain', 'MCP', 'ElevenLabs'],
  },
  {
    icon: MessageSquare,
    label: 'Mensageria & Voz',
    items: ['UAZAPI', 'Evolution API', 'WhatsApp Business', 'Telegram'],
  },
];

export default function Stack() {
  return (
    <section id="stack" className="py-28 lg:py-36 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <span className="eyebrow text-accent/70">// ferramentas do dia a dia</span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mt-4 tracking-tight">
            A caixa de <span className="text-gradient-amber">ferramentas</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mt-4">
            O que eu uso pra tirar ideia do papel e botar pra rodar com cliente
            de verdade.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, i) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 hover:border-accent/20 transition-colors duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-lg bg-accent/[0.08] border border-accent/10">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-sm font-medium text-white/80 tracking-wide">
                    {group.label}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-accent hover:border-accent/20 transition-colors duration-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
