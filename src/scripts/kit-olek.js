/* Motor de scroll extraído do olek.si e adaptado pra página longa.
   Fórmulas idênticas às do bundle original (renderSection, calculateBlur,
   compress, opacity); o que muda é como calculamos a distância h de cada
   seção, já que aqui as seções têm alturas variadas em vez de 100vh cada. */

// olek: compress() arredonda o blur em degraus pra não recompor filtro a cada px.
function compress(t) {
  if (t < 16) return t;
  const step = 2 ** (Math.floor(Math.log2(t)) - 3);
  return Math.round(t / step) * step;
}

// olek: calculateBlur(y, index). Borda (primeira/última) usa curva cúbica.
// No toque o teto cai pra 12: tela pequena e GPU de celular.
let blurCap = 32;
function blurFor(y, edge) {
  const l = edge ? y * y * y * 32 : Math.max(0, y - 0.15) ** 2;
  // teto 32 (olek usa 56): as seções aqui são bem maiores que as páginas dele
  // e blur acima disso derruba o frame rate no scroll
  const px = Math.min(blurCap, compress(l * 48));
  return px ? `blur(${px}px)` : "blur(0px)";
}

// olek: opacity = max(0, 1 - y / (mesmo tom ? 2 : 1.1))
const opacityFor = (y, sameTone) => Math.max(0, 1 - y / (sameTone ? 2 : 1.1));

export function startKit() {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  revealCubes(reduced);
  if (reduced) return;

  const sections = Array.from(document.querySelectorAll("main > section, body > footer"));
  if (sections.length === 0) return;

  // Deck nativo, como o olek no desktop: scroll-snap mandatory com
  // scroll-snap-stop: always (um slide por gesto) e ZERO interceptação de
  // roda, teclado ou toque. A física é do navegador; o JS só lê scrollY e
  // pinta rotação, blur, opacidade, tom e dobra. Seção mais alta que a tela
  // rola livre por dentro (área de snap maior que a janela) e encaixa só
  // nas costuras.
  root.dataset.engine = "snap";
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!finePointer) blurCap = 12;
  let frame = 0;

  // Geometria de layout (sem transform): getBoundingClientRect devolve o
  // retângulo já girado e realimenta a própria rotação. O olek usa scrollTop.
  const layoutTop = (el) => {
    let top = 0;
    for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };
  let geometry = [];
  const measure = () => {
    geometry = sections.map((el) => ({ top: layoutTop(el), height: el.offsetHeight }));
  };
  measure();

  const current = () => {
    let best = 0;
    geometry.forEach((g, i) => {
      if (Math.abs(g.top - window.scrollY) < Math.abs(geometry[best].top - window.scrollY)) best = i;
    });
    return best;
  };

  // Timeline: clique leva ao slide pelo scroll nativo (o snap encaixa).
  const rail = finePointer
    ? buildRail(sections, (index) => sections[index].scrollIntoView({ behavior: "smooth", block: "start" }))
    : { update() {} };

  const render = () => {
    frame = 0;
    const vh = window.innerHeight;
    let activeTone = null;
    // dobra (lid-plane): 0 em repouso, 1 no meio da transição
    let fold = 0;

    sections.forEach((section, index) => {
      const box = geometry[index];
      const rect = { top: box.top - window.scrollY, bottom: box.top + box.height - window.scrollY };

      // Mesma distância do olek (página r menos posição o, em viewports):
      // h > 0 enquanto o topo ainda não chegou ao topo da tela (entrando),
      // h < 0 quando o fim já subiu acima do rodapé (saindo), 0 em repouso.
      let h = 0;
      if (rect.top > 0) h = rect.top / vh;
      else if (rect.bottom < vh) h = (rect.bottom - vh) / vh;
      // tom troca quando a costura passa 30% da tela: a seção que sai já quase
      // sumiu, sem laje clara meio transparente em cima do fundo escuro
      if (rect.top <= vh * 0.3 && rect.bottom > vh * 0.3) activeTone = section.dataset.tone || "light";

      const y = Math.abs(h);
      const style = section.style;

      if (y > 1.5) {
        if (style.willChange !== "auto") {
          style.transformOrigin = "";
          style.transform = "";
          style.filter = "";
          style.opacity = "";
          style.willChange = "auto";
        }
        return;
      }

      const sameTone = (section.dataset.tone || "light") === (root.dataset.tone || "light");
      // lid-plane: a dobradiça é a costura entre os slides (borda superior de
      // quem entra, inferior de quem sai), projeção paralela, sem perspective.
      // Com a dobradiça na borda o alvo do snap nativo não se move.
      style.transformOrigin = h > 0 ? "50% 0" : "50% 100%";
      style.transform = `rotateX(${-14 * h}deg)`;
      style.filter = blurFor(y, false);
      if (y < 1) fold = Math.max(fold, 4 * y * (1 - y));
      style.opacity = String(opacityFor(y, sameTone));
      style.willChange = "transform, opacity, filter";
    });

    if (activeTone && root.dataset.tone !== activeTone) {
      root.dataset.tone = activeTone;
    }
    root.style.setProperty("--fold", fold.toFixed(3));
    rail.update(window.scrollY / vh, geometry);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    schedule();
  });
  // conteúdo carregado depois (imagens, fontes, React) muda a altura das seções
  window.addEventListener("load", () => {
    measure();
    schedule();
  });
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      measure();
      schedule();
    }).observe(document.body);
  }
  render();
}

// Entrada cube-rotate: cada [data-cube] anima uma vez ao entrar no viewport.
function revealCubes(reduced) {
  const cubes = Array.from(document.querySelectorAll("[data-cube]"));
  if (cubes.length === 0) return;

  const show = (el) => el.setAttribute("data-rendered", "");

  if (reduced || !("IntersectionObserver" in window)) {
    cubes.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  requestAnimationFrame(() => cubes.forEach((el) => observer.observe(el)));
}

// Timeline lateral do olek: rótulo por slide, ativo cheio, os outros a 50%,
// blur crescendo com a distância (blur(min(2, max(0, q-0.5)*1.5))).
function buildRail(sections, onPick) {
  const lang = document.documentElement.lang || "pt-BR";
  const navLabels = new Map();
  document.querySelectorAll('nav a[href^="#"]').forEach((a) => {
    navLabels.set(a.getAttribute("href").slice(1), a.textContent.trim());
  });
  const labelFor = (section, index) => {
    if (section.dataset.rail) return section.dataset.rail;
    if (index === 0) return lang.startsWith("en") ? "Home" : "Início";
    if (navLabels.has(section.id)) return navLabels.get(section.id);
    const kicker = section.querySelector(".eyebrow, [class$='-kicker'], [class$='-index']");
    return kicker ? kicker.textContent.trim() : section.id;
  };

  const nav = document.createElement("nav");
  nav.className = "k-rail";
  nav.setAttribute("aria-label", lang.startsWith("en") ? "Slides" : "Seções");
  nav.setAttribute("data-cube", "rail");
  const tabs = sections.map((section, index) => {
    if (index > 0) {
      const sep = document.createElement("span");
      sep.className = "k-rail-sep";
      nav.appendChild(sep);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "k-rail-tab";
    button.textContent = labelFor(section, index);
    button.addEventListener("click", () => onPick(index));
    nav.appendChild(button);
    return button;
  });
  document.body.appendChild(nav);
  requestAnimationFrame(() => nav.setAttribute("data-rendered", ""));

  return {
    update(position, geometry) {
      // posição fracionária em slides, como o olek (scrollTop / vh)
      let active = 0;
      geometry.forEach((g, i) => {
        if (Math.abs(g.top - position * window.innerHeight) < Math.abs(geometry[active].top - position * window.innerHeight)) active = i;
      });
      tabs.forEach((tab, i) => {
        const q = Math.abs(i - active);
        const blur = Math.min(2, Math.max(0, q - 0.5) * 1.5);
        tab.style.filter = blur ? `blur(${blur.toFixed(2)}px)` : "";
        tab.style.opacity = q < 0.5 ? "1" : "0.5";
        tab.setAttribute("aria-current", q < 0.5 ? "true" : "false");
      });
    }
  };
}
