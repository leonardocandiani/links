import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

type Props = {
  variant?: 1 | 2 | 3;
};

const paths: Record<number, string> = {
  1: 'M -50,400 Q 300,100 600,450 T 1250,300',
  2: 'M 1250,200 Q 900,550 550,250 T -50,500',
  3: 'M -50,600 C 300,200 600,800 900,400 S 1250,500 1250,100',
};

export default function ScrollPath({ variant = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const fadeMask =
    'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)';

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
      style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`sp-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0)" />
            <stop offset="50%" stopColor="rgba(245, 158, 11, 0.45)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>
        </defs>
        <motion.path
          d={paths[variant]}
          stroke={`url(#sp-grad-${variant})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength, opacity }}
        />
      </svg>
    </div>
  );
}
