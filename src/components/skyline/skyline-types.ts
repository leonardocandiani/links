import type { Cell } from "./skyline-math";

export type SkylineTheme = { swatches: string[]; accent: string };

export type EngineModel = { cells: Cell[]; weeks: number; max: number; months: { week: number; label: string }[] };

/** Tudo que o motor lê do React, atualizado a cada render por uma ref. */
export type EngineConfig = {
  model: EngineModel;
  duration: number;
  orbit: boolean;
  legendLevel: number;
  target: number;
  setActive: (index: number) => void;
  setWidth: (width: number) => void;
  setTheme: (update: (previous: SkylineTheme) => SkylineTheme) => void;
  setAnnounce: (text: string) => void;
  describe: (index: number) => string;
};

export type ConfigRef = { current: EngineConfig };

export type SkylineEngine = {
  kick: () => void;
  load: () => void;
  retheme: () => void;
  tipWidth: (width: number) => void;
  destroy: () => void;
};
