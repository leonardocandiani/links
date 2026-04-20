type Props = {
  text: string;
  reverse?: boolean;
  top?: string;
};

export default function MarqueeText({ text, reverse = false, top = '50%' }: Props) {
  const repeated = Array.from({ length: 6 }).map(() => text).join(' \u00B7 ');
  return (
    <div
      className="absolute left-0 right-0 overflow-hidden pointer-events-none whitespace-nowrap"
      style={{ top }}
      aria-hidden
    >
      <div
        className={reverse ? 'marquee-track-reverse flex' : 'marquee-track flex'}
        style={{ width: 'max-content' }}
      >
        <span className="text-[120px] md:text-[180px] font-serif font-bold text-white/[0.025] tracking-tighter leading-none pr-16">
          {repeated}
        </span>
        <span className="text-[120px] md:text-[180px] font-serif font-bold text-white/[0.025] tracking-tighter leading-none pr-16">
          {repeated}
        </span>
      </div>
    </div>
  );
}
