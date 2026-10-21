import { describe, expect, it } from "vitest";

import {
  DAY_MS,
  type Cell,
  buildGrid,
  camera,
  computeStats,
  dayMs,
  levelOf,
  monthLabels,
  project,
  riseAt
} from "./skyline-math";
import { loadScene, createScene, skylineAspect } from "./skyline-scene";

const END = Date.UTC(2026, 9, 21); // quarta-feira, 21/10/2026

const cell = (date: string, count: number): Cell => ({ date, count, level: 0, week: 0, day: 0 });
const run = (counts: number[]): Cell[] => counts.map((count, i) => cell(new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), count));

describe("dayMs", () => {
  it("lê AAAA-MM-DD de forma literal, sem deriva de fuso", () => {
    expect(dayMs("2026-10-21")).toBe(END);
    expect(dayMs("2026-10-21T23:59:59-03:00")).toBe(END);
  });

  it("arredonda timestamp para o dia UTC e lê Date pelo dia local", () => {
    expect(dayMs(END + 5 * 3600 * 1000)).toBe(END);
    expect(dayMs(new Date(2026, 9, 21, 23, 30))).toBe(END);
  });
});

describe("levelOf", () => {
  it("separa dia vazio, quartos de um dia cheio e o teto", () => {
    expect(levelOf(0, 40)).toBe(0);
    expect(levelOf(9, 40)).toBe(1);
    expect(levelOf(10, 40)).toBe(2);
    expect(levelOf(30, 40)).toBe(4);
    expect(levelOf(400, 40)).toBe(4);
  });

  it("trata o caso sem referência de dia cheio como nível máximo", () => {
    expect(levelOf(3, 0)).toBe(4);
  });
});

describe("buildGrid", () => {
  it("termina no último dia, começa na semana de um ano antes e alinha no dia da semana", () => {
    const sunday = buildGrid([], END, 0);
    const monday = buildGrid([], END, 1);

    expect(sunday.cells.at(-1)?.date).toBe("2026-10-21");
    expect(new Date(dayMs(sunday.cells[0].date)).getUTCDay()).toBe(0);
    expect(new Date(dayMs(monday.cells[0].date)).getUTCDay()).toBe(1);
    expect(sunday.cells.length).toBeGreaterThanOrEqual(365);
    expect(sunday.cells.length).toBeLessThanOrEqual(371);
    expect(sunday.cells.every((c, i) => c.week === Math.floor(i / 7) && c.day === i % 7)).toBe(true);
  });

  it("soma datas repetidas e ignora entradas inválidas", () => {
    const grid = buildGrid(
      [
        { date: "2026-10-20", count: 2 },
        { date: "2026-10-20", count: 3 },
        { date: "2026-10-19", count: -4 },
        { date: "2026-10-18", count: Number.NaN },
        { date: "não é data", count: 9 },
        { date: "2026-10-17", count: 0 }
      ],
      END
    );
    const byDate = new Map(grid.cells.map((c) => [c.date, c.count]));

    expect(byDate.get("2026-10-20")).toBe(5);
    expect(byDate.get("2026-10-19")).toBe(0);
    expect(byDate.get("2026-10-18")).toBe(0);
    expect(grid.max).toBe(5);
  });

  it("usa o percentil 95 como dia cheio: um dia absurdo não achata os outros", () => {
    const data = Array.from({ length: 20 }, (_, i) => ({ date: new Date(END - (i + 1) * DAY_MS).toISOString().slice(0, 10), count: i + 1 }));
    data.push({ date: "2026-10-21", count: 5000 });
    const grid = buildGrid(data, END);
    const level = (count: number) => grid.cells.find((c) => c.count === count)?.level;

    expect(level(5000)).toBe(4);
    expect(level(10)).toBeGreaterThanOrEqual(3);
  });
});

describe("computeStats", () => {
  it("acha total, dia mais cheio e maior sequência", () => {
    const stats = computeStats(run([0, 2, 3, 1, 0, 0, 5, 0]));

    expect(stats.total).toBe(11);
    expect(stats.busiest).toEqual({ count: 5, date: "2026-01-07" });
    expect(stats.longest).toEqual({ days: 3, start: "2026-01-02", end: "2026-01-04" });
  });

  it("conta a sequência atual até hoje, ou até ontem se hoje ainda está vazio", () => {
    expect(computeStats(run([0, 1, 1, 1])).current).toEqual({ days: 3, start: "2026-01-02", end: "2026-01-04" });
    expect(computeStats(run([0, 1, 1, 0])).current).toEqual({ days: 2, start: "2026-01-02", end: "2026-01-03" });
  });

  it("zera a sequência atual quando hoje e ontem estão vazios", () => {
    expect(computeStats(run([4, 4, 0, 0])).current).toEqual({ days: 0, start: null, end: null });
  });

  it("não quebra sem células", () => {
    const stats = computeStats([]);

    expect(stats.total).toBe(0);
    expect(stats.first).toBeNull();
    expect(stats.current.days).toBe(0);
  });
});

describe("monthLabels", () => {
  it("põe um rótulo em cada semana que abre mês novo e descarta o primeiro se estiver apertado", () => {
    const { cells, weeks } = buildGrid([], END);
    const labels = monthLabels(cells, weeks, "en-US");
    const months = new Set(labels.map((l) => l.label));

    expect(labels.length).toBeGreaterThanOrEqual(11);
    expect(months.size).toBe(labels.length);
    expect(labels.every((l, i) => i === 0 || l.week - labels[i - 1].week >= 3)).toBe(true);
  });
});

describe("câmera", () => {
  it("em e=0 olha reto de cima: a altura some e x,y passam direto", () => {
    const flat = project(camera(0), 10, 4, 7);

    expect(flat[0]).toBeCloseTo(10, 6);
    expect(flat[1]).toBeCloseTo(4, 6);
  });

  it("em e=1 a altura sobe na tela e a vista deixa de ser ortogonal", () => {
    const cam = camera(1);
    const low = project(cam, 10, 4, 0);
    const high = project(cam, 10, 4, 5);

    expect(high[1]).toBeLessThan(low[1]);
    expect(high[0]).toBeCloseTo(low[0], 9);
    expect(cam.sn).toBeGreaterThan(0);
  });

  it("limita o orbit ao intervalo permitido", () => {
    const wild = camera(1, 99, 99);
    const tame = camera(1, 0, 0);

    expect(wild.cs).toBeLessThan(tame.cs);
    expect(Number.isFinite(wild.se)).toBe(true);
    expect(wild.se).toBeLessThanOrEqual(Math.sin((62 * Math.PI) / 180) + 1e-9);
  });
});

describe("riseAt", () => {
  it("começa com todas as barras achatadas e termina com todas no topo", () => {
    for (const [week, day] of [[0, 0], [26, 3], [52, 6]]) {
      expect(riseAt(0, week, 53, day)).toBe(0);
      expect(riseAt(1, week, 53, day)).toBe(1);
    }
  });

  it("sobe as semanas antigas antes das novas", () => {
    expect(riseAt(0.4, 0, 53, 0)).toBeGreaterThan(riseAt(0.4, 52, 53, 0));
  });
});

describe("skylineAspect", () => {
  it("devolve a proporção da cena 3D, finita e maior que zero", () => {
    const grid = buildGrid([{ date: "2026-10-09", count: 309 }, { date: "2026-10-10", count: 4 }], END);
    const aspect = skylineAspect({ ...grid, months: [] });

    expect(Number.isFinite(aspect)).toBe(true);
    expect(aspect).toBeGreaterThan(0.1);
    expect(aspect).toBeLessThan(1);
  });

  it("não muda com a escala dos dados, só com a posição da barra mais alta", () => {
    const small = buildGrid([{ date: "2026-10-09", count: 3 }], END);
    const big = buildGrid([{ date: "2026-10-09", count: 3000 }], END);

    expect(skylineAspect({ ...small, months: [] })).toBeCloseTo(skylineAspect({ ...big, months: [] }), 9);
  });
});

describe("loadScene", () => {
  it("copia células e níveis para os arrays e escolhe segunda, quarta e sexta como rótulos", () => {
    const grid = buildGrid([{ date: "2026-10-20", count: 7 }], END);
    const scene = createScene();

    loadScene(scene, { ...grid, months: [] }, "en-US");

    expect(scene.n).toBe(grid.cells.length);
    expect(scene.weeks).toBe(grid.weeks);
    expect(scene.weekdayRows.map((r) => r.label)).toEqual(["Mon", "Wed", "Fri"]);
    expect(scene.lv[grid.cells.findIndex((c) => c.count === 7)]).toBe(4);
  });
});
