import { motion } from 'framer-motion';


import { MessageCircle, Instagram, Youtube, Mail } from 'lucide-react';

const contacts = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Vamos conversar?',
    url: 'https://wa.me/5544998893474',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    description: '@leonardocandiani',
    url: 'https://instagram.com/leonardocandiani',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Youtube,
    title: 'YouTube',
    description: '@oleonardocandiani',
    url: 'https://youtube.com/@oleonardocandiani',
    color: 'from-red-500 to-orange-600',
  },
];

export default function Contact() {

  return (
    <section id="contact" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <img src="/images/bg-contact.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-dark pointer-events-none" />
      <div className="max-w-5xl mx-auto">
        <div
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Vamos <span className="text-accent">Conversar?</span>
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Tem um projeto em mente? Quer trocar ideias sobre IA? Estou sempre aberto para novas conexões.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.title}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="relative p-8 rounded-2xl border border-gray-800 bg-dark-darker/50 backdrop-blur-sm hover:border-accent transition-all duration-500 overflow-hidden text-center">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${contact.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${contact.color} mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-accent transition-colors">
                      {contact.title}
                    </h3>
                    <p className="text-white/80">{contact.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="text-center"
        >
          <a
            href="https://wa.me/5544998893474"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-12 py-5 bg-accent hover:bg-accent-dim text-dark font-bold text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
            Fale Comigo Agora
          </a>
        </div>
      </div>

      {/* Footer */}
      <div
        className="max-w-7xl mx-auto mt-32 pt-12 border-t border-gray-800 text-center text-white/60"
      >
        <p className="mb-4">
          Feito com ❤️ e muita IA • Leonardo Candiani © {new Date().getFullYear()}
        </p>
        <p className="text-sm">
          Construindo o futuro, uma linha de código por vez.
        </p>
      </div>
    </section>
  );
}
