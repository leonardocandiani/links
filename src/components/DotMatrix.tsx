import { useEffect, useRef } from 'react';

export default function DotMatrix() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    const leave = () => {
      el.style.setProperty('--mx', '-500px');
      el.style.setProperty('--my', '-500px');
    };

    window.addEventListener('mousemove', handler, { passive: true });
    el.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', handler);
      el.removeEventListener('mouseleave', leave);
    };
  }, []);

  const fadeMask =
    'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)';

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
      style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
    >
      <div className="dot-matrix" />
      <div className="dot-matrix-hover" />
    </div>
  );
}
