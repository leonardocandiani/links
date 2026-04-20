export default function RadialPulse() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden
    >
      <div className="relative">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 radial-pulse"
            style={{ animationDelay: `${i * 1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
