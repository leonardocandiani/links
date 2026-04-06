import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'SixClaw',
    description: 'Framework multi-agente de IA para WhatsApp. Cada empresa tem seu próprio "Jarvis" — filtra, prioriza, responde e delega.',
    tech: ['AI Agents', 'WhatsApp', 'Claude', 'Bun'],
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    title: 'SegSmart',
    description: 'Empresa de tecnologia especializada em automação e inteligência artificial para negócios.',
    tech: ['Tecnologia', 'IA', 'Automação'],
    gradient: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    title: 'Proteauto',
    description: 'Proteção veicular com tecnologia. Vistorias com computer vision, CRM inteligente, dashboards e bots.',
    tech: ['Proteção Veicular', 'Computer Vision', 'CRM'],
    gradient: 'from-purple-500/20 to-pink-600/20',
  },
];

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-32 px-6 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <img src="/images/bg-projects.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Projetos em <span className="text-accent">Destaque</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Construindo o futuro com tecnologia e inteligência artificial
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl border border-gray-800 bg-dark-darker/50 backdrop-blur-sm hover:border-accent transition-all duration-500 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-3xl font-serif font-bold mb-4 group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-sm bg-accent/10 text-accent rounded-full border border-accent/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Link icon */}
                  <div className="flex justify-end">
                    <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
