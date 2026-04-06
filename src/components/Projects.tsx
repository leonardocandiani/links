import { motion } from 'framer-motion';


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

  return (
    <section id="projects" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="max-w-7xl mx-auto">
        <div
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Projetos em <span className="text-accent">Destaque</span>
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Construindo o futuro com tecnologia e inteligência artificial
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-accent transition-all duration-500 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-3xl font-serif font-bold mb-4 group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-white mb-6 leading-relaxed">
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
                    <ExternalLink className="w-5 h-5 text-white/80 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
