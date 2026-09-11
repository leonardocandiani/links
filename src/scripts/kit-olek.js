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

  // olek liga o snap só em ponteiro fino; no toque fica a rolagem nativa.
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const sections = Array.from(document.querySelectorAll("main > section, body > footer"));
  if (sections.length === 0) return;

  // Mesmo deck nos dois: slides de uma tela com conteúdo rolando por dentro.
  // No toque o olek não usa rolagem: uma classe SwipeState escuta touchstart,
  // touchmove e touchend, o dedo arrasta as páginas e ao soltar anima pro
  // slide mais próximo pela velocidade. Aqui é o mesmo, na borda do slide.
  root.dataset.engine = "snap";
  root.dataset.input = finePointer ? "pointer" : "touch";
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

  const rail = finePointer
    ? buildRail(sections, (index) => goTo(index, index > current() ? "down" : "up"))
    : { update() {} };

  const render = () => {
    frame = 0;
    const vh = window.innerHeight;
    const center = vh / 2;
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
          // olek usa hidden; aqui é auto pra Ctrl+F e âncora continuarem achando
          // o texto. Só no deck de altura fixa: com altura natural o auto
          // encolhe a seção fora da tela e desloca todas as posições.
          style.contentVisibility = "auto";
        }
        return;
      }
      if (style.contentVisibility === "auto") style.contentVisibility = "visible";

      // olek só usa a curva cúbica no overscroll além da primeira/última página;
      // em página longa não existe overscroll, então fica a curva padrão.
      const edge = false;
      const sameTone = (section.dataset.tone || "light") === (root.dataset.tone || "light");
      // lid-plane: a dobradiça é a costura entre os slides (borda superior de
      // quem entra, inferior de quem sai) e a projeção é paralela, sem
      // perspective, então o slide encurta em vez de fazer keystone.
      style.transformOrigin = h > 0 ? "50% 0" : "50% 100%";
      style.transform = `rotateX(${-14 * h}deg)`;
      style.filter = blurFor(y, edge);
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

  // Navegação entre slides conduzida aqui (o olek também conduz o scroll por
  // conta própria). Roda: dentro do slide rola o conteúdo; na borda pula pro
  // vizinho. Trava de 700ms + detecção de cauda de inércia do trackpad.
  // fim da animação em curso (performance.now()); trava a roda até lá
  let lockedUntil = -Infinity;
  const current = () => {
    let best = 0;
    geometry.forEach((g, i) => {
      if (Math.abs(g.top - window.scrollY) < Math.abs(geometry[best].top - window.scrollY)) best = i;
    });
    return best;
  };
  const isAnimating = () => performance.now() < lockedUntil;
  // Animação própria (rAF), como o olek: não depende de behavior: smooth,
  // que alguns Chromes (flag ou extensão de scroll suave) simplesmente ignoram.
  const ease = (t) => 1 - (1 - t) ** 4;
  // lid-plane AutoAnchor: smoothstep p²(3-2p)
  const smoothstep = (t) => t * t * (3 - 2 * t);
  let animation = 0;
  const stopAnimation = () => {
    animation++;
    lockedUntil = -Infinity;
  };
  const animateScroll = (target, to, duration = 600, curve = ease) => {
    const token = ++animation;
    if (target === window) lockedUntil = performance.now() + duration + 60;
    const isWindow = target === window;
    const from = isWindow ? window.scrollY : target.scrollTop;
    const start = performance.now();
    const step = (now) => {
      if (token !== animation) return;
      const p = Math.min(1, (now - start) / duration);
      const y = from + (to - from) * curve(p);
      if (isWindow) window.scrollTo(0, y);
      else target.scrollTop = y;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // Ir pra baixo abre o slide no início; voltar abre no fim, pra leitura
  // continuar de onde parou (o slide alvo está fora da tela, ninguém vê o ajuste).
  const goTo = (index, direction) => {
    const clamped = Math.min(geometry.length - 1, Math.max(0, index));
    const target = geometry[clamped];
    if (!target) return;
    const slide = sections[clamped];
    if (direction === "up") slide.scrollTop = slide.scrollHeight;
    else if (direction === "down") slide.scrollTop = 0;
    animateScroll(window, target.top);
  };
  const edges = (el, down) => {
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    const atStart = el.scrollTop <= 0;
    return down ? atEnd : atStart;
  };
  // Lista, bloco de código ou tabs com overflow próprio dentro do slide:
  // enquanto tiverem espaço pra rolar na direção do gesto, a roda é deles.
  const nestedScrollerCanScroll = (target, section, down) => {
    for (let el = target; el && el !== section; el = el.parentElement) {
      if (el.scrollHeight <= el.clientHeight + 1) continue;
      const { overflowY } = getComputedStyle(el);
      if (overflowY !== "auto" && overflowY !== "scroll") continue;
      if (!edges(el, down)) return true;
    }
    return false;
  };

  // Modelo por gesto. Gesto novo = pausa de 200ms, troca de direção ou delta
  // subindo (dedo novo acelera; inércia só decai). Troca de slide quando:
  // o gesto começou na borda e empurrou 24px, ou insistiu 140px na borda
  // dentro do mesmo gesto. Um gesto troca no máximo um slide.
  const gesture = { at: 0, down: null, lastDelta: 0, startedAtEdge: false, edgePush: 0, changed: false };
  // Swipe (toque): o dedo só assume quando o conteúdo do slide já está na
  // borda; até lá a rolagem interna é nativa. Arrasto segue o dedo com
  // resistência 0.5 e, ao soltar, 90px ou 0,6px/ms trocam o slide.
  if (!finePointer) {
    const touch = { y: 0, t: 0, base: 0, index: 0, dragging: false, edgeDown: false, edgeUp: false, dy: 0 };
    const max = () => document.documentElement.scrollHeight - window.innerHeight;
    sections.forEach((section, index) => {
      section.addEventListener(
        "touchstart",
        (event) => {
          if (event.touches.length !== 1 || isAnimating()) return;
          touch.y = event.touches[0].clientY;
          touch.t = performance.now();
          touch.base = window.scrollY;
          touch.index = index;
          touch.dragging = false;
          touch.dy = 0;
          touch.edgeDown = edges(section, true) && !nestedScrollerCanScroll(event.target, section, true);
          touch.edgeUp = edges(section, false) && !nestedScrollerCanScroll(event.target, section, false);
        },
        { passive: true }
      );
      section.addEventListener(
        "touchmove",
        (event) => {
          if (event.touches.length !== 1 || isAnimating()) return;
          const dy = touch.y - event.touches[0].clientY; // > 0: dedo sobe, vai pra baixo
          if (!touch.dragging) {
            const wantsDown = dy > 6 && touch.edgeDown && index < sections.length - 1;
            const wantsUp = dy < -6 && touch.edgeUp && index > 0;
            if (!wantsDown && !wantsUp) return;
            touch.dragging = true;
          }
          event.preventDefault();
          touch.dy = dy;
          window.scrollTo(0, Math.min(max(), Math.max(0, touch.base + dy * 0.5)));
        },
        { passive: false }
      );
      section.addEventListener("touchend", () => {
        if (!touch.dragging) return;
        touch.dragging = false;
        const dt = Math.max(1, performance.now() - touch.t);
        const velocity = touch.dy / dt;
        const down = touch.dy > 0;
        if (Math.abs(touch.dy) > 90 || Math.abs(velocity) > 0.6) {
          goTo(touch.index + (down ? 1 : -1), down ? "down" : "up");
        } else {
          animateScroll(window, geometry[touch.index].top, 300);
        }
      });
      section.addEventListener("touchcancel", () => {
        if (!touch.dragging) return;
        touch.dragging = false;
        animateScroll(window, geometry[touch.index].top, 300);
      });
    });
  }

  sections.forEach((section, index) => {
    section.addEventListener(
      "wheel",
      (event) => {
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        const d = Math.abs(event.deltaY) * unit;
        if (d < 1) return;
        const now = performance.now();
        const down = event.deltaY > 0;
        if (nestedScrollerCanScroll(event.target, section, down)) {
          gesture.at = 0;
          return;
        }
        const fresh =
          now - gesture.at > 200 || gesture.down !== down || d > gesture.lastDelta * 1.6 + 2;
        gesture.at = now;
        gesture.lastDelta = d;
        if (fresh) {
          gesture.down = down;
          gesture.changed = false;
          gesture.edgePush = 0;
          gesture.startedAtEdge = edges(section, down);
        }
        if (now < lockedUntil || gesture.changed) {
          event.preventDefault();
          return;
        }
        if (!edges(section, down)) {
          gesture.edgePush = 0;
          return;
        }
        event.preventDefault();
        gesture.edgePush += d;
        const threshold = gesture.startedAtEdge ? 24 : 140;
        if (gesture.edgePush >= threshold) {
          gesture.changed = true;
          goTo(index + (down ? 1 : -1), down ? "down" : "up");
        }
      },
      { passive: false }
    );
  });

  const interactive = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY", "VIDEO", "AUDIO"]);
  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const active = document.activeElement;
    if (active && (interactive.has(active.tagName) || active.isContentEditable)) return;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goTo(event.key === "Home" ? 0 : sections.length - 1, event.key === "Home" ? "down" : "up");
      return;
    }
    const downKeys = ["ArrowDown", "PageDown", " "];
    const upKeys = ["ArrowUp", "PageUp"];
    if (!downKeys.includes(event.key) && !upKeys.includes(event.key)) return;
    event.preventDefault();
    if (isAnimating()) return;
    const down = downKeys.includes(event.key);
    const index = current();
    const slide = sections[index];
    if (edges(slide, down)) {
      goTo(index + (down ? 1 : -1), down ? "down" : "up");
    } else {
      const step = event.key.startsWith("Arrow") ? 120 : slide.clientHeight * 0.85;
      animateScroll(slide, slide.scrollTop + (down ? step : -step), 400);
    }
  });

  // Tab pra um elemento de outro slide: o navegador daria um salto seco;
  // aqui o slide alvo entra pela mesma animação.
  document.addEventListener("focusin", (event) => {
    const index = sections.findIndex((el) => el.contains(event.target));
    if (index < 0 || index === current()) return;
    goTo(index, index > current() ? "down" : "up");
  });

  // Links do menu (#sobre etc.) usam a mesma animação em vez do salto nativo.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    const id = link.getAttribute("href").slice(1);
    const index = sections.findIndex((el) => el.id === id);
    if (index < 0) return;
    event.preventDefault();
    history.replaceState(null, "", `#${id}`);
    goTo(index, "down");
  });

  // Scroll nativo (barra, autoscroll, hash, back/forward) pode parar entre
  // slides; 160ms depois de parar, encaixa no mais próximo.
  let settleTimer = 0;
  let mouseDown = false;
  window.addEventListener("mousedown", () => {
    mouseDown = true;
  });
  window.addEventListener("mouseup", () => {
    mouseDown = false;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 150);
  });
  const settle = () => {
    if (isAnimating() || mouseDown || window.__kitNoSettle) return;
    const target = geometry[current()];
    if (!target || Math.abs(window.scrollY - target.top) < 1) return;
    animateScroll(window, target.top, 200, smoothstep);
  };
  window.addEventListener(
    "scroll",
    () => {
      schedule();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 150);
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    stopAnimation();
    measure();
    // slides mudaram de altura: re-encaixa no slide atual sem animar
    window.scrollTo(0, geometry[current()].top);
    schedule();
  });
  // conteúdo carregado depois (imagens, fontes) muda a altura das seções
  window.addEventListener("load", () => {
    measure();
    schedule();
  });
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(document.body);
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
