/* Kit visual do olek.si adaptado pra página contínua.

   O deck paginado saiu: a rolagem é a nativa do navegador e o JS nunca
   intercepta roda, teclado ou toque. O que ele faz é ler scrollY e pintar
   três coisas: a névoa das bordas (que cresce com a velocidade), o deslize
   dos títulos e a troca de tom, além de montar a timeline lateral. */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function startKit() {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced) splitHeadlines();
  revealCubes(reduced);

  root.dataset.engine = "flow";
  if (reduced) return;

  const sections = Array.from(document.querySelectorAll("main > section, body > footer"));
  if (sections.length === 0) return;

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  // deslize dos títulos: amplitude menor no toque, onde a tela é curta
  const drift = finePointer ? 22 : 12;
  let frame = 0;

  // Geometria de layout, nunca getBoundingClientRect: o rect já vem com o
  // transform aplicado e realimentaria o próprio deslize.
  const layoutTop = (el) => {
    let top = 0;
    for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };

  const kinetic = Array.from(document.querySelectorAll("[data-kinetic]"));
  let geometry = [];
  let anchors = [];
  const measure = () => {
    geometry = sections.map((el) => ({ top: layoutTop(el), height: el.offsetHeight }));
    anchors = kinetic.map((el) => ({ top: layoutTop(el), height: el.offsetHeight }));
  };
  measure();

  const rail = finePointer
    ? buildRail(sections, (index) => sections[index].scrollIntoView({ behavior: "smooth", block: "start" }))
    : { update() {} };

  // A névoa base fica sempre; --fold estende as camadas enquanto a página se
  // move e decai sozinho quando ela para.
  let lastY = window.scrollY;
  let fold = 0;

  const render = () => {
    frame = 0;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    const speed = Math.abs(scrollY - lastY);
    lastY = scrollY;
    fold = Math.max(fold * 0.82, clamp(speed / 90, 0, 1));
    if (fold < 0.005) fold = 0;
    root.style.setProperty("--fold", fold.toFixed(3));

    // tom troca quando a costura passa 30% da tela
    let activeTone = null;
    geometry.forEach((box, index) => {
      const top = box.top - scrollY;
      if (top <= vh * 0.3 && top + box.height > vh * 0.3) {
        activeTone = sections[index].dataset.tone || "light";
      }
    });
    if (activeTone && root.dataset.tone !== activeTone) root.dataset.tone = activeTone;

    // título desliza de baixo pra cima conforme atravessa a tela: q vale 1
    // quando ele ainda está lá embaixo e -1 quando já saiu por cima
    anchors.forEach((box, index) => {
      const middle = box.top + box.height / 2 - scrollY;
      const q = (middle - vh / 2) / vh;
      const el = kinetic[index];
      if (Math.abs(q) > 0.9) {
        if (el.style.transform) el.style.transform = "";
        return;
      }
      el.style.transform = `translate3d(0, ${(q * drift).toFixed(2)}px, 0)`;
    });

    rail.update(scrollY, geometry);
    // enquanto a névoa decai, continua pintando mesmo sem evento de scroll
    if (fold) schedule();
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    schedule();
  });
  // conteúdo que carrega depois (imagens, fontes, React) muda as alturas
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

/* Fatia os títulos de seção em palavras, como o título da hero, pra cada uma
   entrar com o mesmo cube-rotate escalonado. Só toca em nó de texto: markup
   interno (destaques, links) vira uma peça inteira em vez de ser desmontado. */
function splitHeadlines() {
  const selector = [
    "main > section h2",
    "main > section .eyebrow",
    "body > footer h2",
    "body > footer .eyebrow"
  ].join(", ");

  document.querySelectorAll(selector).forEach((el) => {
    if (el.hasAttribute("data-split") || el.querySelector("[data-cube]")) return;

    const pieces = [];
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add("k-word");
        node.setAttribute("data-cube", "");
        pieces.push(node);
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE) {
        pieces.push(node);
        return;
      }
      node.textContent.split(/(\s+)/).forEach((chunk) => {
        if (!chunk) return;
        if (!chunk.trim()) {
          pieces.push(document.createTextNode(chunk));
          return;
        }
        const word = document.createElement("span");
        word.className = "k-word";
        word.setAttribute("data-cube", "");
        word.textContent = chunk;
        pieces.push(word);
      });
    });

    let index = 0;
    pieces.forEach((piece) => {
      if (piece.nodeType === Node.ELEMENT_NODE) piece.style.setProperty("--i", String(index++));
    });

    el.replaceChildren(...pieces);
    el.setAttribute("data-split", "");
    el.classList.add("k-split");
    if (el.tagName === "H2") el.setAttribute("data-kinetic", "");
  });
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

// Timeline lateral do olek: rótulo por seção, ativa cheia, as outras a 50%,
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
  nav.setAttribute("aria-label", lang.startsWith("en") ? "Sections" : "Seções");
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
    // ativa é a seção que ocupa o meio da tela
    update(scrollY, geometry) {
      const middle = scrollY + window.innerHeight / 2;
      let active = 0;
      geometry.forEach((box, index) => {
        if (middle >= box.top) active = index;
      });
      tabs.forEach((tab, index) => {
        const q = Math.abs(index - active);
        const blur = Math.min(2, Math.max(0, q - 0.5) * 1.5);
        tab.style.filter = blur ? `blur(${blur.toFixed(2)}px)` : "";
        tab.style.opacity = q < 0.5 ? "1" : "0.5";
        tab.setAttribute("aria-current", q < 0.5 ? "true" : "false");
      });
    }
  };
}
