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

  // Navegação entre slides. Princípios (Apple, Designing Fluid Interfaces):
  // resposta imediata, entrada nunca travada, transição agarrável e
  // reversível a qualquer instante, mola em vez de duração fixa, rubber band
  // na borda em vez de parada seca.
  const current = () => {
    let best = 0;
    geometry.forEach((g, i) => {
      if (Math.abs(g.top - window.scrollY) < Math.abs(geometry[best].top - window.scrollY)) best = i;
    });
    return best;
  };

  // Mola crítica (damping 1.0, response 0.4s): sem duração fixa, parte da
  // posição e velocidade atuais e aceita novo alvo no meio do caminho.
  const spring = { active: false, pos: 0, vel: 0, target: 0, last: 0, from: 0, to: 0, down: true };
  const OMEGA = (2 * Math.PI) / 0.4;
  const springStep = (now) => {
    if (!spring.active) return;
    const dt = Math.min(0.032, Math.max(0.001, (now - spring.last) / 1000));
    spring.last = now;
    const x = spring.pos - spring.target;
    const accel = -OMEGA * OMEGA * x - 2 * OMEGA * spring.vel;
    spring.vel += accel * dt;
    spring.pos += spring.vel * dt;
    if (Math.abs(spring.pos - spring.target) < 0.5 && Math.abs(spring.vel) < 8) {
      spring.pos = spring.target;
      spring.vel = 0;
      spring.active = false;
    }
    window.scrollTo(0, spring.pos);
    if (spring.active) requestAnimationFrame(springStep);
  };
  const springTo = (target, velocity = 0) => {
    if (!spring.active) {
      spring.pos = window.scrollY;
      spring.vel = velocity;
      spring.last = performance.now();
      spring.active = true;
      requestAnimationFrame(springStep);
    }
    spring.target = target;
  };
  const isAnimating = () => spring.active;
  const stopAnimation = () => {
    spring.active = false;
    animation++;
  };

  // Rolagem interna por teclado ainda usa animação curta com easing.
  const ease = (t) => 1 - (1 - t) ** 4;
  let animation = 0;
  const animateScroll = (target, to, duration = 400) => {
    const token = ++animation;
    const from = target.scrollTop;
    const start = performance.now();
    const step = (now) => {
      if (token !== animation) return;
      const p = Math.min(1, (now - start) / duration);
      target.scrollTop = from + (to - from) * ease(p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Ir pra baixo abre o slide no início; voltar abre no fim, pra leitura
  // continuar de onde parou. direction null preserva a rolagem (reversão).
  const goTo = (index, direction, velocity = 0) => {
    const clamped = Math.min(geometry.length - 1, Math.max(0, index));
    const target = geometry[clamped];
    if (!target) return;
    const slide = sections[clamped];
    if (direction === "up") slide.scrollTop = slide.scrollHeight;
    else if (direction === "down") slide.scrollTop = 0;
    spring.from = spring.active ? spring.to : current();
    spring.to = clamped;
    spring.down = target.top > window.scrollY;
    springTo(target.top, velocity);
  };
  const edges = (el, down, tolerance = 1) => {
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - tolerance;
    const atStart = el.scrollTop <= tolerance - 1;
    return down ? atEnd : atStart;
  };
  // Lista, bloco de código ou tabs com overflow próprio dentro do slide:
  // enquanto tiverem espaço pra rolar na direção do gesto, a roda é deles.
  const nestedScrollerCanScroll = (target, section, down) => {
    for (let el = target; el && el !== section; el = el.parentElement) {
      if (el.scrollHeight <= el.clientHeight + 2) continue;
      const { overflowY } = getComputedStyle(el);
      if (overflowY !== "auto" && overflowY !== "scroll") continue;
      if (!edges(el, down, 2)) return true;
    }
    return false;
  };
  // Apple: quanto mais além da borda, menos o conteúdo acompanha.
  const rubberband = (overshoot, dimension, constant = 0.55) =>
    (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  // Swipe (toque): o dedo só assume quando o conteúdo do slide já está na
  // borda; até lá a rolagem interna é nativa. Arrasto segue o dedo com
  // rubber band e, ao soltar, 90px ou 0,6px/ms trocam o slide.
  if (!finePointer) {
    const touch = { y: 0, t: 0, base: 0, index: 0, dragging: false, edgeDown: false, edgeUp: false, dy: 0 };
    sections.forEach((section, index) => {
      section.addEventListener(
        "touchstart",
        (event) => {
          if (event.touches.length !== 1) return;
          // agarrar no meio da mola: para onde está e segue o dedo dali
          if (spring.active) spring.active = false;
          touch.y = event.touches[0].clientY;
          touch.t = performance.now();
          touch.base = window.scrollY;
          touch.index = current();
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
          if (event.touches.length !== 1) return;
          const dy = touch.y - event.touches[0].clientY; // > 0: dedo sobe, vai pra baixo
          if (!touch.dragging) {
            const wantsDown = dy > 6 && touch.edgeDown && touch.index < sections.length - 1;
            const wantsUp = dy < -6 && touch.edgeUp && touch.index > 0;
            if (!wantsDown && !wantsUp) return;
            touch.dragging = true;
          }
          event.preventDefault();
          touch.dy = dy;
          const disp = rubberband(dy, window.innerHeight);
          window.scrollTo(0, Math.min(maxScroll(), Math.max(0, touch.base + disp)));
        },
        { passive: false }
      );
      const release = () => {
        if (!touch.dragging) return;
        touch.dragging = false;
        const dt = Math.max(1, performance.now() - touch.t);
        const velocity = touch.dy / dt; // px/ms
        const down = touch.dy > 0;
        if (Math.abs(touch.dy) > 90 || Math.abs(velocity) > 0.6) {
          goTo(touch.index + (down ? 1 : -1), down ? "down" : "up", velocity * 1000);
        } else {
          springTo(geometry[touch.index].top);
        }
      };
      section.addEventListener("touchend", release);
      section.addEventListener("touchcancel", release);
    });
  }

  // Roda e trackpad. Um gesto = uma rajada sem pausa de 200ms na mesma
  // direção. Fora da borda o conteúdo rola nativamente. Na borda o empurrão
  // vira rubber band (o próximo slide aparece) e troca quando o gesto começou
  // na borda (60px) ou é um empurrão sustentado (6 eventos sem decair, 120px);
  // inércia só decai e não troca. Soltar sem trocar volta na mola. Durante a
  // transição a mesma direção é absorvida (um slide por rajada); a direção
  // oposta agarra a mola e volta pro slide de onde saiu.
  const gesture = { at: 0, down: null, lastDelta: 0, startedAtEdge: false, push: 0, steady: 0, changed: false, reversed: false, velocity: 0 };
  let releaseTimer = 0;
  const releaseRubber = () => {
    if (spring.active || gesture.push === 0) return;
    gesture.push = 0;
    springTo(geometry[current()].top);
  };
  sections.forEach((section) => {
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
        // Jitter da inércia (deltas minúsculos, às vezes invertidos) não conta.
        if (d < 8 && gesture.down !== null && gesture.down !== down) return;
        const gap = now - gesture.at;
        const silent = gap > 200;
        // Dedo novo sem pausa: a cauda já tinha morrido (< 15px) e o delta volta forte.
        const restart = gesture.lastDelta < 15 && d >= 40;
        // Direção oposta é SEMPRE gesto novo: inverter é intenção clara.
        const fresh = silent || gesture.down !== down || (!gesture.changed && restart);
        const previous = gesture.lastDelta;
        gesture.velocity = gap > 0 && gap < 200 ? d / gap : 0; // px/ms
        gesture.at = now;
        gesture.lastDelta = d;
        if (fresh) {
          gesture.down = down;
          gesture.changed = false;
          gesture.reversed = false;
          gesture.push = 0;
          gesture.steady = 0;
          gesture.startedAtEdge = edges(section, down, 48);
        }

        // Transição em curso: mesma direção é absorvida; oposta agarra e volta.
        if (spring.active) {
          event.preventDefault();
          if (down !== spring.down && d >= 8 && !gesture.reversed) {
            gesture.reversed = true;
            gesture.changed = true;
            goTo(spring.from, null, down ? gesture.velocity * 1000 : -gesture.velocity * 1000);
          }
          return;
        }

        // Fora da borda: rolagem interna nativa.
        if (!edges(section, down)) {
          if (gesture.push) releaseRubber();
          gesture.push = 0;
          gesture.steady = 0;
          return;
        }

        // Na borda: segura o encadeamento pra janela.
        event.preventDefault();
        if (gesture.changed) return;
        const index = current();
        const canGo = down ? index < sections.length - 1 : index > 0;
        if (!canGo) return;
        gesture.push += d;
        gesture.steady = d >= 6 && d >= previous - 1 ? gesture.steady + 1 : 0;
        const commit =
          (gesture.startedAtEdge && gesture.push >= 60) || (gesture.steady >= 6 && gesture.push >= 120);
        if (commit) {
          gesture.changed = true;
          gesture.push = 0;
          clearTimeout(releaseTimer);
          goTo(index + (down ? 1 : -1), down ? "down" : "up", (down ? 1 : -1) * gesture.velocity * 1000);
          return;
        }
        // Rubber band: o próximo slide aparece proporcionalmente ao empurrão.
        const disp = rubberband(gesture.push, window.innerHeight);
        window.scrollTo(0, Math.min(maxScroll(), Math.max(0, geometry[index].top + (down ? disp : -disp))));
        clearTimeout(releaseTimer);
        releaseTimer = setTimeout(releaseRubber, 150);
      },
      { passive: false }
    );
  });

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
    if (isAnimating() || mouseDown || gesture.push || window.__kitNoSettle) return;
    const target = geometry[current()];
    if (!target || Math.abs(window.scrollY - target.top) < 1) return;
    springTo(target.top);
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
