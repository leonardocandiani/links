import { motion } from 'framer-motion';
import { Instagram as InstagramIcon } from 'lucide-react';
import AmbientBg from './AmbientBg';
import MarqueeText from './MarqueeText';

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

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };

export default function Instagram() {
  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);

  return (
    <section id="instagram" className="py-32 lg:py-40 px-6 relative overflow-hidden">
      <AmbientBg variant={4} />
      <MarqueeText text="CONTEÚDO" top="10%" />
      <MarqueeText text="IA · AUTOMAÇÃO · ESCALAR" reverse top="85%" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight">
            Conteúdo que <span className="text-accent">transforma</span>
          </h2>
          <p className="text-lg text-white/50 flex items-center gap-3">
            <InstagramIcon className="w-5 h-5 text-accent/70" />
            <a
              href="https://instagram.com/leonardocandiani"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-300"
            >
              @leonardocandiani
            </a>
          </p>
        </motion.div>

        {/* Asymmetric grid: featured wide + 3 stacked right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
          {/* Featured */}
          {featured.map((post) => (
            <motion.a
              key={post.title}
              href="https://instagram.com/leonardocandiani"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-auto lg:row-span-3 lg:min-h-[600px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ ...spring, delay: 0.1 }}
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2 group-hover:text-accent transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-white/70">{post.description}</p>
              </div>
            </motion.a>
          ))}

          {/* Regular — stacked vertically */}
          {regular.map((post, i) => (
            <motion.a
              key={post.title}
              href="https://instagram.com/leonardocandiani"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl aspect-[16/9] lg:aspect-auto lg:min-h-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...spring, delay: 0.15 + i * 0.1 }}
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <h3 className="text-lg font-serif font-bold">{post.title}</h3>
                <p className="text-white/70 text-sm">{post.description}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://instagram.com/leonardocandiani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-7 py-3.5 border border-white/10 text-white/70 hover:text-accent hover:border-accent/30 rounded-full transition-all duration-300 active:scale-[0.97]"
          >
            <InstagramIcon className="w-4 h-4" />
            Ver todos os posts
          </a>
        </motion.div>
      </div>
    </section>
  );
}
