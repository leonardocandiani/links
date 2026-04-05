import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Youtube, Sparkles } from 'lucide-react';

const links = [
  {
    icon: FileText,
    title: 'Templates',
    description: 'Templates e recursos para produtividade',
    url: 'https://drive.google.com/drive/folders/1G1Tl5k01EDlUSDRx_sbuIUY5P14pHytz?usp=sharing',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Sparkles,
    title: 'Prompts',
    description: 'Prompts de IA para resultados incríveis',
    url: 'https://drive.google.com/drive/folders/13CFux9alUBxCOZBA2U3erz_Mi_OiUlta?usp=drive_link',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Youtube,
    title: 'YouTube',
    description: 'Conteúdo sobre IA e tecnologia',
    url: 'https://youtube.com/@oleonardocandiani',
    color: 'from-red-500 to-orange-600',
  },
];

export default function Links() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="links" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Recursos <span className="text-accent">Gratuitos</span>
          </h2>
          <p className="text-xl text-gray-400">
            Templates, prompts e conteúdo para turbinar sua produtividade
          </p>
        </motion.div>

        <div className="space-y-6">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative block"
              >
                <div className="relative p-8 rounded-2xl border border-gray-800 bg-dark-darker/50 backdrop-blur-sm hover:border-accent transition-all duration-500 overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${link.color}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-accent transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-gray-400">{link.description}</p>
                    </div>

                    <svg 
                      className="w-6 h-6 text-gray-600 group-hover:text-accent group-hover:translate-x-2 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
