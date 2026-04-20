import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Sobre', href: '#about' },
  { label: 'Projetos', href: '#projects' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'Recursos', href: '#links' },
  { label: 'Contato', href: '#contact' },
];

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 60);
  });

  return (
    <>
      {/* Desktop nav — pill (centered via wrapper) */}
      <div className="hidden lg:block fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 1.2 }}
          className={`pointer-events-auto px-1.5 py-1.5 rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-dark/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              : 'bg-dark/30 backdrop-blur-md border border-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-0.5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-white/70 hover:text-accent transition-colors duration-300 rounded-full hover:bg-white/5 active:scale-[0.97]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.nav>
      </div>

      {/* Mobile — hamburger (centered via wrapper) */}
      <div className="lg:hidden fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 1 }}
          className="pointer-events-auto flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-dark/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] active:scale-[0.97] transition-transform"
          aria-label="Abrir menu"
        >
          <Menu className="w-4 h-4 text-white/90" />
          <span className="text-sm text-white/80 tracking-wide">Menu</span>
        </motion.button>
      </div>

      {/* Mobile — overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 z-[60] bg-dark/95 backdrop-blur-2xl flex flex-col"
          >
            <div className="flex justify-end p-5">
              <button
                onClick={() => setOpen(false)}
                className="p-3 rounded-full border border-white/10 active:scale-[0.95] transition-transform"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5 text-white/90" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center items-center gap-2 px-6">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.05 + i * 0.06 }}
                  className="text-4xl font-serif font-bold text-white/80 hover:text-accent transition-colors py-3 tracking-tight"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pb-10 text-center text-white/30 text-xs tracking-widest uppercase"
            >
              Leonardo Candiani
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
