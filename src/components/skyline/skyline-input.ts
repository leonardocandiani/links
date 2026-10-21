// Entrada do Skyline: mouse, toque e teclado sobre o canvas.
import { pointInQuad } from "./skyline-canvas";
import { ELEV_3D, ELEV_RANGE, YAW_3D, YAW_RANGE } from "./skyline-math";
import type { Scene } from "./skyline-scene";
import type { ConfigRef } from "./skyline-types";

type InputContext = {
  s: Scene;
  cfg: ConfigRef;
  canvas: HTMLCanvasElement;
  /** Recalcula qual dia está ativo (sob o mouse, senão o fixado) e avisa o React. */
  refreshActive: () => void;
  kick: () => void;
};

type Drag = { id: number; x: number; y: number; yaw: number; elev: number; moved: boolean; orbit: boolean; mouse: boolean };

const KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"];
// deslocamento em células por tecla: uma semana são 7 índices, um dia é 1
const STEP: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };

/** Índice da célula sob o ponto (topo ou faces visíveis), da mais próxima para a mais distante; -1 se nenhuma. */
export const hitTest = (s: Scene, x: number, y: number): number => {
  for (let k = s.n - 1; k >= 0; k--) {
    const i = s.order[k];
    const o = i * 24;
    if (pointInQuad(s.polys, o, x, y)) return i;
    if (s.faces[i] & 1 && pointInQuad(s.polys, o + 8, x, y)) return i;
    if (s.faces[i] & 2 && pointInQuad(s.polys, o + 16, x, y)) return i;
  }
  return -1;
};

export function attachInput({ s, cfg, canvas, refreshActive, kick }: InputContext): () => void {
  let drag: Drag | null = null;

  const local = (ev: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top] as const;
  };
  const idleCursor = () => (cfg.current.orbit && s.target === 1 ? "grab" : "default");

  const onDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    const orbit = cfg.current.orbit && s.target === 1;
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, yaw: s.yawGoal, elev: s.elevGoal, moved: false, orbit, mouse: ev.pointerType === "mouse" };
    if (orbit) {
      try {
        canvas.setPointerCapture(ev.pointerId);
      } catch {
        /* a captura é só um refinamento */
      }
    }
  };

  // Devolve true quando o movimento virou orbit e não deve mais contar como hover.
  const orbitMove = (ev: PointerEvent): boolean => {
    if (!drag || !drag.orbit || ev.pointerId !== drag.id) return false;
    const dx = ev.clientX - drag.x;
    const dy = ev.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) <= 4) return false;
    drag.moved = true;
    s.yawGoal = Math.min(YAW_RANGE[1] - YAW_3D, Math.max(YAW_RANGE[0] - YAW_3D, drag.yaw + dx * 0.006));
    if (drag.mouse) s.elevGoal = Math.min(ELEV_RANGE[1] - ELEV_3D, Math.max(ELEV_RANGE[0] - ELEV_3D, drag.elev + dy * 0.004));
    canvas.style.cursor = "grabbing";
    s.hovered = -1;
    refreshActive();
    kick();
    return true;
  };

  const onMove = (ev: PointerEvent) => {
    if (orbitMove(ev) || ev.pointerType !== "mouse") return;
    const [x, y] = local(ev);
    const i = hitTest(s, x, y);
    if (i !== s.hovered) {
      s.hovered = i;
      refreshActive();
    }
    canvas.style.cursor = cfg.current.orbit && s.target === 1 ? "grab" : i >= 0 ? "pointer" : "default";
  };

  const onUp = (ev: PointerEvent) => {
    if (!drag || ev.pointerId !== drag.id) return;
    const wasMoved = drag.moved;
    drag = null;
    if (canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId);
    canvas.style.cursor = idleCursor();
    if (wasMoved) return;
    const [x, y] = local(ev);
    const i = hitTest(s, x, y);
    s.pinned = i === s.pinned ? -1 : i;
    if (ev.pointerType !== "mouse") s.hovered = -1;
    refreshActive();
  };

  const onCancel = () => {
    drag = null;
  };

  const onLeave = () => {
    if (drag) return;
    s.hovered = -1;
    refreshActive();
  };

  const onDbl = () => {
    s.yawGoal = 0;
    s.elevGoal = 0;
    kick();
  };

  const nextIndex = (key: string, from: number): number => {
    if (key === "Home") return 0;
    if (key === "End") return s.n - 1;
    return from + (STEP[key] ?? 0);
  };

  const onKey = (ev: KeyboardEvent) => {
    if (!KEYS.includes(ev.key) || !s.n) return;
    ev.preventDefault();
    if (ev.key === "Escape") {
      s.pinned = -1;
      s.hovered = -1;
      refreshActive();
      return;
    }
    const from = s.pinned >= 0 ? s.pinned : s.activeIdx >= 0 ? s.activeIdx : s.n - 1;
    const moved = s.pinned >= 0 || s.activeIdx >= 0;
    const i = Math.max(0, Math.min(s.n - 1, moved ? nextIndex(ev.key, from) : from));
    s.pinned = i;
    s.hovered = -1;
    refreshActive();
    cfg.current.setAnnounce(cfg.current.describe(i));
  };

  const onBlur = () => {
    s.pinned = -1;
    refreshActive();
  };

  const listeners: [string, EventListener][] = [
    ["pointerdown", onDown as EventListener],
    ["pointermove", onMove as EventListener],
    ["pointerup", onUp as EventListener],
    ["pointercancel", onCancel],
    ["pointerleave", onLeave],
    ["dblclick", onDbl],
    ["keydown", onKey as EventListener],
    ["blur", onBlur]
  ];
  for (const [name, fn] of listeners) canvas.addEventListener(name, fn);
  return () => {
    for (const [name, fn] of listeners) canvas.removeEventListener(name, fn);
  };
}
