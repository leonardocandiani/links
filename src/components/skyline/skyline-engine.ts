// Motor de canvas do Contribution Skyline. Imperativo de propósito: o loop roda fora do React e só
// conversa com ele pelos setters de EngineConfig. O desenho está em skyline-draw, a entrada em
// skyline-input e o estado compartilhado em skyline-scene.
import { BG_FALLBACK, FG_FALLBACK, rgbString, toRGB } from "./skyline-canvas";
import { drawScene } from "./skyline-draw";
import { attachInput } from "./skyline-input";
import { type RGB, camera } from "./skyline-math";
import { createScene, extent, loadScene } from "./skyline-scene";
import type { ConfigRef, SkylineEngine } from "./skyline-types";

export type { EngineConfig, EngineModel, SkylineEngine, SkylineTheme } from "./skyline-types";

type Options = {
  els: { root: HTMLElement; stage: HTMLElement; canvas: HTMLCanvasElement; tip: HTMLElement };
  cfg: ConfigRef;
  locale: string;
};

export function createSkylineEngine({ els, cfg, locale }: Options): SkylineEngine | null {
  const { root, stage, canvas, tip } = els;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const s = createScene();
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceMq.matches;
  let raf = 0;
  let last = 0;

  const draw = () => drawScene(s, ctx, stage, tip);

  const kick = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const readColors = () => {
    const cs = getComputedStyle(root);
    s.fg = toRGB(cs.color, FG_FALLBACK) ?? FG_FALLBACK;
    s.bg = toRGB(cs.backgroundColor, BG_FALLBACK) ?? BG_FALLBACK;
    s.font = "400 11px " + (cs.fontFamily || "sans-serif");
  };

  // Os cinco níveis (vazio e quatro de atividade) vêm das variáveis --sk-level-N do CSS.
  const levelColors = (): RGB[] => {
    const cs = getComputedStyle(root);
    return [0, 1, 2, 3, 4].map((n) => toRGB(cs.getPropertyValue("--sk-level-" + n).trim(), FG_FALLBACK) ?? FG_FALLBACK);
  };

  const retheme = () => {
    readColors();
    const all = levelColors();
    for (let k = 0; k < 5; k++) for (let ch = 0; ch < 3; ch++) s.colGoal[k * 3 + ch] = all[k][ch];
    if (!s.colReady || reduced) {
      s.col.set(s.colGoal);
      s.colReady = true;
    }
    ctx.font = s.font;
    s.labelW = Math.ceil(Math.max(20, ...s.weekdayRows.map((r) => ctx.measureText(r.label).width))) + 8;
    const sw = all.map((c) => rgbString(c[0], c[1], c[2]));
    cfg.current.setTheme((prev) => (prev.swatches.join() === sw.join() ? prev : { swatches: sw, accent: sw[4] }));
    kick();
  };

  const relayout = () => {
    const w = Math.round(stage.clientWidth);
    if (!w || !s.n) return;
    s.W = w;
    // Em cartão estreito a coluna dos dias da semana vira área da grade; as linhas ficam apertadas demais para rótulo.
    s.gutter = w < 520 ? 0 : s.labelW;
    s.dpr = Math.min(2, window.devicePixelRatio || 1);
    const b2 = extent(s, camera(0), 0, true);
    s.H2 = 20 + 4 + ((b2.maxy - b2.miny) / (b2.maxx - b2.minx)) * (w - s.gutter - 4);
    const b3 = extent(s, camera(1), 1, true);
    const natural = ((b3.maxy - b3.miny) / (b3.maxx - b3.minx)) * (w - 40) + 40;
    s.H3 = Math.max(Math.min(natural, w * 0.72, 620), Math.min(natural, 240));
    s.Hmax = Math.ceil(Math.max(s.H2, s.H3));
    canvas.width = Math.round(w * s.dpr);
    canvas.height = Math.round(s.Hmax * s.dpr);
    canvas.style.width = w + "px";
    canvas.style.height = s.Hmax + "px";
    s.lastH = -1;
    cfg.current.setWidth(w);
    draw();
  };

  // Os quatro passos devolvem true enquanto ainda há movimento a animar.
  const stepTime = (dt: number): boolean => {
    if (s.t === s.target) return false;
    const step = reduced ? 1 : (dt * 1000) / Math.max(1, cfg.current.duration);
    s.t = s.target > s.t ? Math.min(s.target, s.t + step) : Math.max(s.target, s.t - step);
    return true;
  };

  const stepOrbit = (dt: number): boolean => {
    const k = reduced ? 1 : 1 - Math.exp(-dt * 12);
    s.yaw += (s.yawGoal - s.yaw) * k;
    s.elev += (s.elevGoal - s.elev) * k;
    if (Math.abs(s.yawGoal - s.yaw) > 1e-4 || Math.abs(s.elevGoal - s.elev) > 1e-4) return true;
    s.yaw = s.yawGoal;
    s.elev = s.elevGoal;
    return false;
  };

  const stepColors = (dt: number): boolean => {
    const k = reduced ? 1 : 1 - Math.exp(-dt * 7);
    let moving = false;
    for (let i = 0; i < 15; i++) {
      const d = s.colGoal[i] - s.col[i];
      if (Math.abs(d) > 0.4) {
        s.col[i] += d * k;
        moving = true;
      } else s.col[i] = s.colGoal[i];
    }
    return moving;
  };

  // Aproxima `values[i]` da meta; devolve true se ainda não chegou.
  const ease = (values: Float32Array, i: number, goal: number, k: number): boolean => {
    const v = values[i];
    if (v === goal) return false;
    values[i] = Math.abs(goal - v) < 0.003 ? goal : v + (goal - v) * k;
    return true;
  };

  const stepCells = (dt: number): boolean => {
    const kh = reduced ? 1 : 1 - Math.exp(-dt * 16);
    const kd = reduced ? 1 : 1 - Math.exp(-dt * 10);
    const leg = cfg.current.legendLevel;
    let moving = false;
    for (let i = 0; i < s.n; i++) {
      const hoverMoving = ease(s.hover, i, i === s.activeIdx ? 1 : 0, kh);
      const dimMoving = ease(s.dim, i, leg >= 0 && s.lv[i] !== leg ? 1 : 0, kd);
      moving = moving || hoverMoving || dimMoving;
    }
    return moving;
  };

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    // sem curto-circuito: todos os passos avançam a cada quadro
    const moving = [stepTime(dt), stepOrbit(dt), stepColors(dt), stepCells(dt)].some(Boolean);
    draw();
    if (moving) raf = requestAnimationFrame(tick);
  }

  // O dia ativo é o que está sob o mouse, senão o fixado (toque, clique ou teclado).
  const refreshActive = () => {
    const next = s.hovered >= 0 ? s.hovered : s.pinned;
    if (next === s.activeIdx) return;
    s.activeIdx = next;
    cfg.current.setActive(next);
    kick();
  };

  const setTarget = () => {
    const goal = cfg.current.target;
    if (!s.entered || goal === s.target) return;
    s.target = goal;
    if (goal === 0) {
      s.yawGoal = 0;
      s.elevGoal = 0;
    }
    canvas.style.cursor = cfg.current.orbit && goal === 1 ? "grab" : "default";
    kick();
  };

  loadScene(s, cfg.current.model, locale);
  retheme();
  relayout();

  // A vista 3D sobe da plana na primeira vez que aparece na tela.
  const enter = () => {
    if (s.entered) return;
    s.entered = true;
    if (reduced) s.t = cfg.current.target;
    setTarget();
  };
  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        enter();
        io?.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
  } else enter();

  const ro = new ResizeObserver(() => {
    if (Math.round(stage.clientWidth) !== s.W) relayout();
  });
  ro.observe(stage);

  const onReduce = () => {
    reduced = reduceMq.matches;
    kick();
  };
  reduceMq.addEventListener("change", onReduce);

  const detachInput = attachInput({ s, cfg, canvas, refreshActive, kick });

  return {
    kick: () => {
      setTarget();
      kick();
    },
    load: () => {
      loadScene(s, cfg.current.model, locale);
      retheme();
      relayout();
    },
    retheme,
    tipWidth: (width: number) => {
      s.tipW = width;
      draw();
    },
    destroy: () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      reduceMq.removeEventListener("change", onReduce);
      detachInput();
    }
  };
}
