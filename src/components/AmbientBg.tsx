import { motion } from 'framer-motion';

type Blob = {
  className: string;
  x: number[];
  y: number[];
  scale?: number[];
  duration: number;
};

const variants: Record<number, Blob[]> = {
  1: [
    {
      className: '-top-20 -left-40 w-[600px] h-[600px] bg-accent/[0.08] blur-[140px]',
      x: [0, 120, 40, 0],
      y: [0, 80, -40, 0],
      duration: 28,
    },
    {
      className: 'top-1/4 -right-20 w-[500px] h-[500px] bg-orange-500/[0.06] blur-[130px]',
      x: [0, -100, 50, 0],
      y: [0, 120, -50, 0],
      duration: 32,
    },
    {
      className: '-bottom-40 left-1/3 w-[700px] h-[700px] bg-amber-600/[0.05] blur-[150px]',
      x: [0, -80, 100, 0],
      y: [0, -60, 40, 0],
      duration: 36,
    },
    {
      className: 'top-1/2 left-1/2 w-[400px] h-[400px] bg-accent/[0.07] blur-[120px]',
      x: [0, 60, -80, 0],
      y: [0, -100, 60, 0],
      scale: [1, 1.2, 0.9, 1],
      duration: 24,
    },
  ],
  2: [
    {
      className: '-top-40 right-1/4 w-[550px] h-[550px] bg-accent/[0.06] blur-[130px]',
      x: [0, -80, 60, 0],
      y: [0, 100, -30, 0],
      duration: 30,
    },
    {
      className: 'bottom-0 -left-20 w-[500px] h-[500px] bg-amber-500/[0.05] blur-[140px]',
      x: [0, 90, -40, 0],
      y: [0, -70, 50, 0],
      duration: 34,
    },
  ],
  3: [
    {
      className: '-top-20 left-1/4 w-[650px] h-[650px] bg-orange-500/[0.05] blur-[140px]',
      x: [0, 100, -60, 0],
      y: [0, 80, -40, 0],
      duration: 32,
    },
    {
      className: 'bottom-0 -right-40 w-[600px] h-[600px] bg-accent/[0.07] blur-[140px]',
      x: [0, -70, 50, 0],
      y: [0, -80, 60, 0],
      duration: 38,
    },
    {
      className: 'top-1/3 left-0 w-[400px] h-[400px] bg-amber-600/[0.04] blur-[120px]',
      x: [0, 50, -30, 0],
      y: [0, 100, -60, 0],
      scale: [1, 1.15, 0.95, 1],
      duration: 26,
    },
  ],
  4: [
    {
      className: 'top-0 -left-40 w-[500px] h-[500px] bg-accent/[0.06] blur-[130px]',
      x: [0, 70, -50, 0],
      y: [0, 90, -40, 0],
      duration: 29,
    },
    {
      className: 'bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/[0.05] blur-[140px]',
      x: [0, -80, 60, 0],
      y: [0, -60, 40, 0],
      duration: 33,
    },
  ],
  5: [
    {
      className: '-top-20 right-0 w-[550px] h-[550px] bg-amber-500/[0.05] blur-[130px]',
      x: [0, -60, 40, 0],
      y: [0, 80, -30, 0],
      duration: 31,
    },
    {
      className: 'bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/[0.06] blur-[130px]',
      x: [0, 70, -40, 0],
      y: [0, -90, 50, 0],
      duration: 35,
    },
  ],
  6: [
    {
      className: 'top-1/4 left-1/4 w-[700px] h-[700px] bg-accent/[0.06] blur-[150px]',
      x: [0, 80, -60, 0],
      y: [0, -70, 50, 0],
      scale: [1, 1.1, 0.95, 1],
      duration: 34,
    },
    {
      className: 'bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/[0.05] blur-[130px]',
      x: [0, -90, 60, 0],
      y: [0, 70, -40, 0],
      duration: 30,
    },
  ],
};

const fadeMask =
  'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)';

export default function AmbientBg({
  variant = 1,
  fadeEdges = true,
}: {
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
  fadeEdges?: boolean;
}) {
  const blobs = variants[variant];
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
      style={
        fadeEdges
          ? { maskImage: fadeMask, WebkitMaskImage: fadeMask }
          : undefined
      }
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${blob.className}`}
          animate={{
            x: blob.x,
            y: blob.y,
            ...(blob.scale ? { scale: blob.scale } : {}),
          }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
