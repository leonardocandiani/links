import { motion } from 'framer-motion';


import { Instagram as InstagramIcon } from 'lucide-react';

const posts = [
  {
    image: '/images/post-dificil.jpg',
    title: 'Difícil não existe',
    description: 'Só existe o que você nunca fez.',
    featured: true,
  },
  {
    image: '/images/post-claude-context.jpg',
    title: 'Claude 1M Context',
    description: 'Nova era da IA com contexto expandido',
  },
  {
    image: '/images/post-anthropic-academy.jpg',
    title: 'Anthropic Academy',
    description: 'Educação em IA de ponta',
  },
  {
    image: '/images/post-meta-ai.jpg',
    title: 'Meta Layoffs & AI',
    description: 'O impacto da IA no mercado',
  },
];

export default function Instagram() {

  return (
    <section id="instagram" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Últimas do <span className="text-accent">Instagram</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto flex items-center justify-center gap-3">
            <InstagramIcon className="w-6 h-6 text-accent" />
            <a 
              href="https://instagram.com/leonardocandiani" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              @leonardocandiani
            </a>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Featured post - larger */}
          {posts
            .filter((post) => post.featured)
            .map((post, index) => (
              <a
                key={post.title}
                href="https://instagram.com/leonardocandiani"
                target="_blank"
                rel="noopener noreferrer"
                className="md:col-span-2 group relative overflow-hidden rounded-2xl aspect-[16/9]"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-white/80 text-lg">{post.description}</p>
                </div>
              </a>
            ))}

          {/* Regular posts */}
          {posts
            .filter((post) => !post.featured)
            .map((post, index) => (
              <a
                key={post.title}
                href="https://instagram.com/leonardocandiani"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl aspect-square"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent opacity-0 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-serif font-bold mb-2">
                    {post.title}
                  </h3>
                  <p className="text-white/80 text-sm">{post.description}</p>
                </div>
              </a>
            ))}
        </div>

        {/* CTA */}
        <div
          className="text-center mt-12"
        >
          <a
            href="https://instagram.com/leonardocandiani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full transition-all duration-300 hover:scale-105"
          >
            <InstagramIcon className="w-5 h-5" />
            Ver todos os posts
          </a>
        </div>
      </div>
    </section>
  );
}
