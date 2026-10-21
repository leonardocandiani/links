// Estado mutável da cena do Skyline. Os módulos de desenho, entrada e o motor compartilham este
// objeto; ele vive fora do React porque muda a cada frame.
import { BG_FALLBACK, FG_FALLBACK } from "./skyline-canvas";
import { type Cam, type RGB, barHeight, camera, dayMs, lerp, project } from "./skyline-math";
import type { EngineModel } from "./skyline-types";

export type Scene = {
  // t é o tempo linear da transição, 0 (2D) a 1 (3D): a câmera suaviza, as barras fazem onda
  t: number;
  target: number;
  entered: boolean;
  // deslocamentos do orbit, suavizados até a meta
  yaw: number;
  elev: number;
  yawGoal: number;
  elevGoal: number;
  // layout
  W: number;
  H2: number;
  H3: number;
  Hmax: number;
  lastH: number;
  dpr: number;
  gutter: number;
  labelW: number;
  font: string;
  // cores: [vazio, n1, n2, n3, n4] x rgb, suavizadas até a meta
  col: Float32Array;
  colGoal: Float32Array;
  colReady: boolean;
  fg: RGB;
  bg: RGB;
  // células
  n: number;
  weeks: number;
  wk: Float32Array;
  dy: Float32Array;
  lv: Uint8Array;
  hgt: Float32Array;
  zs: Float32Array;
  hover: Float32Array;
  dim: Float32Array;
  polys: Float32Array;
  faces: Uint8Array;
  order: number[];
  months: { week: number; label: string }[];
  weekdayRows: { day: number; label: string }[];
  // interação
  hovered: number;
  pinned: number;
  activeIdx: number;
  tipW: number;
};

export const createScene = (): Scene => ({
  t: 0,
  target: 0,
  entered: false,
  yaw: 0,
  elev: 0,
  yawGoal: 0,
  elevGoal: 0,
  W: 0,
  H2: 0,
  H3: 0,
  Hmax: 0,
  lastH: -1,
  dpr: 1,
  gutter: 30,
  labelW: 30,
  font: "11px sans-serif",
  col: new Float32Array(15),
  colGoal: new Float32Array(15),
  colReady: false,
  fg: FG_FALLBACK,
  bg: BG_FALLBACK,
  n: 0,
  weeks: 0,
  wk: new Float32Array(0),
  dy: new Float32Array(0),
  lv: new Uint8Array(0),
  hgt: new Float32Array(0),
  zs: new Float32Array(0),
  hover: new Float32Array(0),
  dim: new Float32Array(0),
  polys: new Float32Array(0),
  faces: new Uint8Array(0),
  order: [],
  months: [],
  weekdayRows: [],
  hovered: -1,
  pinned: -1,
  activeIdx: -1,
  tipW: 0
});

const allocate = (s: Scene, n: number) => {
  s.wk = new Float32Array(n);
  s.dy = new Float32Array(n);
  s.lv = new Uint8Array(n);
  s.hgt = new Float32Array(n);
  s.zs = new Float32Array(n);
  s.hover = new Float32Array(n);
  s.dim = new Float32Array(n);
  s.polys = new Float32Array(n * 24);
  s.faces = new Uint8Array(n);
  s.order = Array.from({ length: n }, (_, i) => i);
};

/** Copia o modelo do React para os arrays tipados e recalcula os rótulos de dia da semana. */
export const loadScene = (s: Scene, model: EngineModel, locale: string) => {
  s.n = model.cells.length;
  s.weeks = model.weeks;
  if (s.wk.length !== s.n) allocate(s, s.n);
  for (let i = 0; i < s.n; i++) {
    const c = model.cells[i];
    s.wk[i] = c.week;
    s.dy[i] = c.day;
    s.lv[i] = c.level;
    s.hgt[i] = barHeight(c.count, model.max);
  }
  s.months = model.months;
  const wf = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  s.weekdayRows = [];
  for (let d = 0; d < 7 && d < s.n; d++) {
    const ms = dayMs(model.cells[d].date);
    const dow = new Date(ms).getUTCDay();
    if (dow === 1 || dow === 3 || dow === 5) s.weekdayRows.push({ day: d, label: wf.format(ms) });
  }
  if (s.hovered >= s.n) s.hovered = -1;
  if (s.pinned >= s.n) s.pinned = -1;
};

/** Lado da caixa em unidades da grade: engorda de 0,78 (plano) a 0,9 (3D). */
export const boxSide = (e: number) => lerp(0.78, 0.9, e);

/** Extensão projetada da cena para a câmera `cam`, com cada barra em zs[i] ou, se `full`, na altura cheia. */
export const extent = (s: Scene, cam: Cam, e: number, full: boolean) => {
  const w = boxSide(e);
  const off = (1 - w) / 2;
  let minx = Infinity;
  let maxx = -Infinity;
  let miny = Infinity;
  let maxy = -Infinity;
  const add = (x: number, y: number, z: number) => {
    const p = project(cam, x, y, z);
    minx = Math.min(minx, p[0]);
    maxx = Math.max(maxx, p[0]);
    miny = Math.min(miny, p[1]);
    maxy = Math.max(maxy, p[1]);
  };
  for (let i = 0; i < s.n; i++) {
    const x0 = s.wk[i] + off;
    const y0 = s.dy[i] + off;
    const z = full ? s.hgt[i] * e : s.zs[i];
    add(x0, y0, z);
    add(x0 + w, y0, z);
    add(x0, y0 + w, z);
    add(x0 + w, y0 + w, 0);
    add(x0, y0 + w, 0);
    add(x0 + w, y0, 0);
  }
  // espaço para os rótulos de mês que correm pela borda da frente em 3D
  add(0, 7 + 1.5 * e, 0);
  add(s.weeks, 7 + 1.5 * e, 0);
  return { minx, maxx, miny, maxy };
};

/**
 * Altura sobre largura da cena 3D inteira (todas as barras no topo). O cartão usa isso para
 * reservar o espaço antes de o canvas existir, então a página não pula quando a vista sobe.
 */
export const skylineAspect = (model: EngineModel): number => {
  const s = createScene();
  loadScene(s, model, "en-US");
  const b = extent(s, camera(1), 1, true);
  return (b.maxy - b.miny) / (b.maxx - b.minx);
};
