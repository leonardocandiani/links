// Textos do Skyline. O padrão é inglês; a página passa a tradução por `labels`.
export type SkylineLabels = {
  /** Aceita {count} e {unit}. */
  title: string;
  viewGroup: string;
  viewFlat: string;
  viewSkyline: string;
  statTotal: string;
  statBusiest: string;
  statLongest: string;
  statCurrent: string;
  day: string;
  days: string;
  /** Intervalo sem datas, por exemplo uma sequência atual de zero dias. */
  none: string;
  /** Entre as duas datas de um intervalo: "Oct 3 to Oct 9". */
  to: string;
  /** Antes da data no tooltip: "4 contributions on Oct 3, 2026". */
  on: string;
  less: string;
  more: string;
  /** Do dia vazio ao mais cheio: cinco nomes. O primeiro também vale como "sem atividade" no tooltip. */
  levels: readonly string[];
  /** Aceita {level}. */
  highlight: string;
  hintFlat: string;
  hintSkyline: string;
  /** Aceita {count}, {unit}, {range} e {view}. */
  canvas: string;
  canvasFlat: string;
  canvasSkyline: string;
};

export const defaultLabels: SkylineLabels = {
  title: "{count} {unit} in the last year",
  viewGroup: "Chart view",
  viewFlat: "Flat heat map",
  viewSkyline: "3D skyline",
  statTotal: "1 year total",
  statBusiest: "Busiest day",
  statLongest: "Longest streak",
  statCurrent: "Current streak",
  day: "day",
  days: "days",
  none: "none",
  to: "to",
  on: "on",
  less: "Less",
  more: "More",
  levels: ["No contributions", "Light", "Moderate", "Heavy", "Heaviest"],
  highlight: "Highlight: {level}",
  hintFlat: "Hover a day for details · arrow keys to explore",
  hintSkyline: "Drag to orbit · double-click to reset",
  canvas: "{count} {unit} between {range}, shown as a {view}. Use the arrow keys to read individual days.",
  canvasFlat: "heat map",
  canvasSkyline: "3D skyline"
};

export const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
