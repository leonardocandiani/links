import { motion } from 'framer-motion';



export default function About() {

  return (
    <section id="about" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div
            className="relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img
                src="/images/profile-pic.jpg"
                alt="Leonardo Candiani"
                className="w-full h-full object-cover" loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
            </div>

          </div>

          {/* Content */}
          <div
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
              Sobre <span className="text-accent">Mim</span>
            </h2>
            
            <div className="space-y-4 text-white/80 text-lg leading-relaxed">
              <p>
                Especialista em tecnologia e inteligência artificial, baseado em Maringá, PR.
                Estudo automação desde 2018 e IA desde 2019.
              </p>
              
              <p>
                Atuo na <span className="text-white font-medium">SegSmart</span>, empresa 
                de tecnologia, e na <span className="text-white font-medium">Proteauto</span>, 
                de proteção veicular. Estou construindo o{' '}
                <span className="text-white font-medium">SixClaw</span> — um framework 
                multi-agente de IA para WhatsApp, produto da SixQuasar.
              </p>
              
              <p className="text-accent font-medium">
                Direto, sem enrolação. Construo coisas reais com IA.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="border-l-4 border-accent pl-6">
                <div className="text-4xl font-serif font-bold text-accent">7+</div>
                <div className="text-white/60 mt-1">Anos com automação</div>
              </div>
              <div className="border-l-4 border-accent pl-6">
                <div className="text-4xl font-serif font-bold text-accent">2019</div>
                <div className="text-white/60 mt-1">Trabalhando com IA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
