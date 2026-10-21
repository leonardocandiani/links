// Progresso do scroll da linha do tempo do GitHub. Uma variável CSS (--p) move a faixa; o resto
// (revelar cada mês, preencher a linha) sai de duas contas simples por quadro.
const PIN = "(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function setup(root: HTMLElement) {
  const view = root.querySelector<HTMLElement>(".journey-view");
  const track = root.querySelector<HTMLElement>(".journey-track");
  const stops = Array.from(root.querySelectorAll<HTMLElement>(".journey-stop"));
  if (!view || !track || stops.length === 0) return;

  const pinned = matchMedia(PIN);
  let travel = 0;
  let trackWidth = 0;
  let offsets: number[] = [];
  // onde o último mês para na tela ao fim do percurso: é daí que a revelação conta, para ele chegar a 100%
  let settle = 0;
  let visible = false;
  let frame = 0;

  const reset = () => {
    for (const name of ["--p", "--fill", "--travel"]) root.style.removeProperty(name);
    for (const stop of stops) stop.style.removeProperty("--r");
  };

  // offsetLeft ignora a transformação: dá a posição de cada mês na faixa parada, base da conta de revelação.
  const measure = () => {
    if (!pinned.matches) return;
    trackWidth = track.scrollWidth;
    travel = Math.max(0, trackWidth - innerWidth);
    root.style.setProperty("--travel", travel + "px");
    offsets = stops.map((stop) => stop.offsetLeft);
    settle = offsets[offsets.length - 1] - travel;
  };

  const update = () => {
    frame = 0;
    if (!pinned.matches || !visible) return;
    const rect = root.getBoundingClientRect();
    const range = rect.height - innerHeight;
    const progress = range > 0 ? clamp01(-rect.top / range) : 0;
    const shift = progress * travel;

    root.style.setProperty("--p", progress.toFixed(4));
    // a linha acompanha a rolagem e fecha em 100% no último mês; cada mês aparece ao entrar pela direita
    const lead = innerWidth * 0.55;
    const span = innerWidth * 0.2;
    root.style.setProperty("--fill", clamp01((shift + lead) / (travel + lead)).toFixed(4));
    stops.forEach((stop, i) => stop.style.setProperty("--r", clamp01((settle + span - (offsets[i] - shift)) / span).toFixed(3)));
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const sync = () => {
    if (pinned.matches) {
      view.removeAttribute("tabindex");
      measure();
      schedule();
    } else {
      view.setAttribute("tabindex", "0");
      reset();
    }
  };

  // Foco por teclado numa parada fora da tela leva a página até o ponto em que ela aparece.
  root.addEventListener("focusin", (event) => {
    const stop = (event.target as HTMLElement).closest<HTMLElement>(".journey-stop");
    if (!pinned.matches || !stop || travel === 0) return;
    const center = offsets[stops.indexOf(stop)] + stop.offsetWidth / 2;
    const progress = clamp01((center - innerWidth / 2) / travel);
    const top = root.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + progress * (root.offsetHeight - innerHeight), behavior: "instant" });
  });

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    },
    { rootMargin: "100% 0px" }
  ).observe(root);
  new ResizeObserver(() => {
    measure();
    schedule();
  }).observe(track);
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", () => {
    measure();
    schedule();
  });
  pinned.addEventListener("change", sync);

  root.setAttribute("data-live", "");
  sync();
}

document.querySelectorAll<HTMLElement>("[data-journey]").forEach(setup);
