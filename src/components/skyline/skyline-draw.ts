// Desenho de um quadro do Skyline: posiciona cada caixa, pinta, rotula e move o tooltip.
import { quadPath, rgbString, rgbaString } from "./skyline-canvas";
import { type Cam, type RGB, camera, easeInOutCubic, lerp, mixRGB, riseAt, smoothstep } from "./skyline-math";
import { type Scene, boxSide, extent } from "./skyline-scene";

type View = {
  e: number;
  cam: Cam;
  scale: number;
  w: number;
  off: number;
  lift: number;
  radius: number;
  outline: number;
  px: (x: number, y: number) => number;
  py: (x: number, y: number, z: number) => number;
};

/** Escala e deslocamento que encaixam a cena projetada na área útil do cartão. */
const makeView = (s: Scene, cam: Cam, e: number, Hc: number): View => {
  const b = extent(s, cam, e, false);
  const pad = lerp(2, 20, e);
  const left = pad + s.gutter * (1 - e);
  const top = pad + 20 * (1 - e);
  const aw = s.W - left - pad;
  const ah = Hc - top - pad;
  const bw = Math.max(1e-6, b.maxx - b.minx);
  const bh = Math.max(1e-6, b.maxy - b.miny);
  const scale = Math.min(aw / bw, ah / bh);
  const ox = left + (aw - bw * scale) / 2 - b.minx * scale;
  const oy = top + (ah - bh * scale) / 2 - b.miny * scale;
  const { cs, sn, se, ce } = cam;
  const w = boxSide(e);
  return {
    e,
    cam,
    scale,
    w,
    off: (1 - w) / 2,
    lift: 0.7 * e,
    radius: lerp(0.17, 0.03, e) * scale,
    outline: (1 - e) * 0.07,
    px: (x, y) => ox + (x * cs - y * sn) * scale,
    py: (x, y, z) => oy + ((x * sn + y * cs) * se - z * ce) * scale
  };
};

/** Preenche os 24 floats da célula (topo, face +y, face +x) e marca quais faces aparecem. */
const placeCell = (s: Scene, v: View, i: number) => {
  const { px, py, w, off } = v;
  const x0 = s.wk[i] + off;
  const y0 = s.dy[i] + off;
  const x1 = x0 + w;
  const y1 = y0 + w;
  const z = s.zs[i] + s.hover[i] * v.lift;
  const o = i * 24;
  const p = s.polys;
  // topo
  p[o] = px(x0, y0); p[o + 1] = py(x0, y0, z);
  p[o + 2] = px(x1, y0); p[o + 3] = py(x1, y0, z);
  p[o + 4] = px(x1, y1); p[o + 5] = py(x1, y1, z);
  p[o + 6] = px(x0, y1); p[o + 7] = py(x0, y1, z);
  // face +y (esquerda na tela)
  p[o + 8] = px(x0, y1); p[o + 9] = py(x0, y1, 0);
  p[o + 10] = px(x1, y1); p[o + 11] = py(x1, y1, 0);
  p[o + 12] = p[o + 4]; p[o + 13] = p[o + 5];
  p[o + 14] = p[o + 6]; p[o + 15] = p[o + 7];
  // face +x (direita na tela)
  p[o + 16] = px(x1, y0); p[o + 17] = py(x1, y0, 0);
  p[o + 18] = p[o + 10]; p[o + 19] = p[o + 11];
  p[o + 20] = p[o + 4]; p[o + 21] = p[o + 5];
  p[o + 22] = p[o + 2]; p[o + 23] = p[o + 3];

  const tall = z * v.cam.ce * v.scale > 0.35;
  s.faces[i] = (tall && w * v.cam.cs * v.scale > 0.35 ? 1 : 0) | (tall && w * v.cam.sn * v.scale > 0.35 ? 2 : 0);
};

/** Cor do nível da célula, esmaecida pela legenda e clareada pelo hover. */
const cellColor = (s: Scene, i: number): RGB => {
  const L = s.lv[i] * 3;
  const c: RGB = [s.col[L], s.col[L + 1], s.col[L + 2]];
  const d = s.dim[i];
  const hv = s.hover[i];
  const out = d > 0.002 ? mixRGB(c, [s.col[0], s.col[1], s.col[2]], 0.72 * d) : c;
  return hv > 0.002 ? mixRGB(out, s.fg, 0.16 * hv) : out;
};

const paintCell = (ctx: CanvasRenderingContext2D, s: Scene, v: View, i: number) => {
  const [r, g, b] = cellColor(s, i);
  const o = i * 24;
  const f = s.faces[i];
  if (f & 1) {
    ctx.beginPath();
    quadPath(ctx, s.polys, o + 8, 0);
    ctx.fillStyle = rgbString(r * 0.84, g * 0.84, b * 0.84);
    ctx.fill();
  }
  if (f & 2) {
    ctx.beginPath();
    quadPath(ctx, s.polys, o + 16, 0);
    ctx.fillStyle = rgbString(r * 0.68, g * 0.68, b * 0.68);
    ctx.fill();
  }
  ctx.beginPath();
  quadPath(ctx, s.polys, o, v.radius);
  ctx.fillStyle = rgbString(r, g, b);
  ctx.fill();
  if (v.outline > 0.004) {
    ctx.strokeStyle = rgbaString(s.fg, v.outline);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (s.hover[i] > 0.02) {
    ctx.strokeStyle = rgbaString(s.fg, 0.85 * s.hover[i]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
};

/** Meses em cima e dias da semana à esquerda: a vista plana. */
const flatLabels = (ctx: CanvasRenderingContext2D, s: Scene, v: View, alpha: number) => {
  ctx.fillStyle = rgbaString(mixRGB(s.bg, s.fg, 0.55), alpha);
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  let edge = -Infinity;
  for (const m of s.months) {
    const x = v.px(m.week + v.off, -0.3);
    const tw = ctx.measureText(m.label).width;
    if (x < edge || x + tw > s.W) continue;
    ctx.fillText(m.label, x, v.py(m.week + v.off, -0.3, 0) - 3);
    edge = x + tw + 6;
  }
  if (s.gutter <= 0) return;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const r of s.weekdayRows) ctx.fillText(r.label, v.px(0, r.day + 0.5) - 6, v.py(0, r.day + 0.5, 0));
};

/** Meses correndo pela borda da frente: a vista 3D. */
const skylineLabels = (ctx: CanvasRenderingContext2D, s: Scene, v: View, alpha: number) => {
  ctx.fillStyle = rgbaString(mixRGB(s.bg, s.fg, 0.55), alpha);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  let edge = -Infinity;
  for (const m of s.months) {
    const x = v.px(m.week + 0.5, 7.3);
    const tw = ctx.measureText(m.label).width;
    if (x < edge || x + tw > s.W) continue;
    ctx.fillText(m.label, x, v.py(m.week + 0.5, 7.3, 0) + 2);
    edge = x + tw + 10;
  }
};

/** O tooltip acompanha a célula ativa nas transições e no orbit. */
const placeTip = (s: Scene, v: View, tip: HTMLElement) => {
  const i = s.activeIdx;
  const { px, py, off, w } = v;
  const z = s.zs[i] + s.hover[i] * v.lift;
  const tx = px(s.wk[i] + 0.5, s.dy[i] + 0.5);
  const ty = Math.min(
    py(s.wk[i] + off, s.dy[i] + off, z),
    py(s.wk[i] + off + w, s.dy[i] + off, z),
    py(s.wk[i] + off, s.dy[i] + off + w, z)
  );
  const half = s.tipW / 2;
  const cx = Math.min(s.W - half - 2, Math.max(half + 2, tx));
  tip.style.transform = "translate(" + (cx - half).toFixed(1) + "px," + (ty - 8).toFixed(1) + "px) translateY(-100%)";
  tip.style.setProperty("--arrow", (tx - cx + half).toFixed(1) + "px");
};

/** Um quadro completo. A ordem de pintura é de trás para a frente (painter's algorithm). */
export const drawScene = (s: Scene, ctx: CanvasRenderingContext2D, stage: HTMLElement, tip: HTMLElement) => {
  if (!s.W || !s.n) return;
  const e = easeInOutCubic(s.t);
  const cam = camera(e, s.yaw, s.elev);
  const Hc = lerp(s.H2, s.H3, e);
  if (Math.abs(Hc - s.lastH) > 0.2) {
    stage.style.height = Hc.toFixed(1) + "px";
    s.lastH = Hc;
  }
  for (let i = 0; i < s.n; i++) s.zs[i] = riseAt(s.t, s.wk[i], s.weeks, s.dy[i]) * s.hgt[i];
  const v = makeView(s, cam, e, Hc);

  ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
  ctx.clearRect(0, 0, s.W, s.Hmax);

  const depth = (i: number) => (s.wk[i] + 0.5) * cam.sn + (s.dy[i] + 0.5) * cam.cs;
  s.order.sort((a, b) => depth(a) - depth(b));
  for (const i of s.order) {
    placeCell(s, v, i);
    paintCell(ctx, s, v, i);
  }

  // Os rótulos fazem fade entre as duas vistas, nunca aparecem de supetão.
  ctx.font = s.font;
  const flat = 1 - smoothstep(0, 0.4, e);
  const skyline = smoothstep(0.62, 1, e);
  if (flat > 0.004) flatLabels(ctx, s, v, flat);
  if (skyline > 0.004) skylineLabels(ctx, s, v, skyline);

  if (s.activeIdx >= 0 && s.activeIdx < s.n) placeTip(s, v, tip);
};
