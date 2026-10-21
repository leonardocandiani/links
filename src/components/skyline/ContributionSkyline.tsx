import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import "./contribution-skyline.css";
import { type EngineConfig, type SkylineEngine, type SkylineTheme, createSkylineEngine } from "./skyline-engine";
import { type SkylineLabels, defaultLabels, fill } from "./skyline-labels";
import { type ContributionDay, buildGrid, computeStats, dayMs, monthLabels } from "./skyline-math";
import { skylineAspect } from "./skyline-scene";

type View = "2d" | "3d";

export interface ContributionSkylineProps {
  /** Um item por dia, `AAAA-MM-DD`. Datas repetidas somam. */
  data: ContributionDay[];
  /** Último dia exibido. Padrão: a data mais recente de `data`. */
  endDate?: string | Date;
  /** Vista inicial. A 3D sobe da plana na primeira vez que o cartão aparece na tela. */
  defaultView?: View;
  /** Substantivo singular e plural da unidade de atividade. */
  unit?: string;
  unitPlural?: string;
  labels?: SkylineLabels;
  locale?: string;
  /** Duração da transição entre as vistas, em ms. */
  duration?: number;
  /** Arrastar gira a vista 3D. */
  orbit?: boolean;
  className?: string;
}

const GridIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
  </svg>
);

const CubeIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M8 1.2 14.2 4.6v6.8L8 14.8 1.8 11.4V4.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M1.8 4.6 8 8l6.2-3.4M8 8v6.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

type StatProps = { label: string; value: string; unit: string; sub: string; accent: string; size: number; align: "start" | "end" | "stack" };

function Stat({ label, value, unit, sub, accent, size, align }: StatProps) {
  const valueStyle = { color: accent, fontSize: size };
  if (align === "stack") {
    return (
      <div className="skyline-stat">
        <div className="skyline-stat-label">{label}</div>
        <div className="skyline-stat-row">
          <span className="skyline-stat-value" style={valueStyle}>
            {value}
          </span>
          <span className="skyline-stat-unit">{unit}</span>
        </div>
        <div className="skyline-stat-sub">{sub}</div>
      </div>
    );
  }
  return (
    <div className="skyline-corner-stat" data-align={align}>
      <div className="skyline-stat-label" data-align={align}>
        {label}
      </div>
      {align === "end" && <div />}
      <div className="skyline-corner-value" style={valueStyle}>
        {value}
      </div>
      <div className="skyline-corner-meta">
        <div className="skyline-corner-unit">{unit}</div>
        <div className="skyline-corner-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function ContributionSkyline({
  data,
  endDate,
  defaultView = "3d",
  unit = "contribution",
  unitPlural,
  labels = defaultLabels,
  locale = "en-US",
  duration = 1300,
  orbit = true,
  className = ""
}: ContributionSkylineProps) {
  const endKey = endDate == null ? null : dayMs(endDate);
  const model = useMemo(() => {
    const dates = data.map((d) => dayMs(d.date)).filter(Number.isFinite);
    const end = endKey ?? (dates.length ? Math.max(...dates) : dayMs(new Date()));
    const grid = buildGrid(data, end);
    return { ...grid, stats: computeStats(grid.cells), months: monthLabels(grid.cells, grid.weeks, locale), aspect: skylineAspect({ ...grid, months: [] }) };
  }, [data, endKey, locale]);

  const [view, setView] = useState<View>(defaultView);
  // A altura da vista 3D fica reservada até o leitor mexer no seletor: assim o cartão não empurra a
  // página enquanto sobe. Só liga depois de hidratar, para quem está sem JS não ver um vão.
  const [reserve, setReserve] = useState(false);
  const [toggled, setToggled] = useState(false);
  // Antes do motor medir as cores, a legenda usa as próprias variáveis do CSS.
  const [theme, setTheme] = useState<SkylineTheme>(() => ({
    swatches: [0, 1, 2, 3, 4].map((n) => `var(--sk-level-${n})`),
    accent: "var(--sk-level-4)"
  }));
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(-1);
  // A legenda tem dois estados: o nível sob o cursor ou o foco (prévia) e o fixado por clique.
  const [hoverLevel, setHoverLevel] = useState(-1);
  const [pinLevel, setPinLevel] = useState(-1);
  const legendLevel = hoverLevel >= 0 ? hoverLevel : pinLevel;
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const engine = useRef<SkylineEngine | null>(null);

  const plural = unitPlural ?? unit + "s";
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const df = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }), [locale]);
  const dfy = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }), [locale]);
  const dfl = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }), [locale]);
  const noun = (n: number) => (n === 1 ? unit : plural);
  const amount = (n: number) => (n > 0 ? nf.format(n) + " " + noun(n) : labels.levels[0]);
  const describe = (i: number) => {
    const c = model.cells[i];
    return c ? amount(c.count) + " " + labels.on + " " + dfl.format(dayMs(c.date)) : "";
  };

  // Tudo que o loop lê, renovado a cada render para ele nunca fechar sobre props velhas.
  const cfg = useRef<EngineConfig>({} as EngineConfig);
  cfg.current = { model, duration, orbit, legendLevel, target: view === "3d" ? 1 : 0, setActive, setWidth, setTheme, setAnnounce, describe };

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    if (!root || !stage || !canvas || !tip) return;
    engine.current = createSkylineEngine({ els: { root, stage, canvas, tip }, cfg, locale });
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
    // O motor lê o resto por `cfg`; é montado uma vez por idioma.
  }, [locale]);

  useEffect(() => engine.current?.kick(), [view, legendLevel]);
  useLayoutEffect(() => setReserve(true), []);
  useEffect(() => engine.current?.load(), [model]);

  // O tooltip precisa da própria largura para não sair do cartão: mede quando o texto muda.
  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (tip && active >= 0) engine.current?.tipWidth(tip.offsetWidth);
  }, [active, model]);

  const { stats } = model;
  const range = (a: string | null, b: string | null, withYear = false) => {
    if (!a || !b) return labels.none;
    const f = withYear ? dfy : df;
    return f.format(dayMs(a)) + " " + labels.to + " " + f.format(dayMs(b));
  };
  const dayNoun = (n: number) => (n === 1 ? labels.day : labels.days);
  const is3d = view === "3d";
  const corners = width >= 560;
  const bigSize = Math.round(Math.max(30, Math.min(56, width * 0.058)));
  const statBlocks = [
    { label: labels.statTotal, value: nf.format(stats.total), unit: noun(stats.total), sub: range(stats.first, stats.last, true) },
    { label: labels.statBusiest, value: nf.format(stats.busiest.count), unit: noun(stats.busiest.count), sub: stats.busiest.date ? df.format(dayMs(stats.busiest.date)) : labels.none },
    { label: labels.statLongest, value: nf.format(stats.longest.days), unit: dayNoun(stats.longest.days), sub: range(stats.longest.start, stats.longest.end) },
    { label: labels.statCurrent, value: nf.format(stats.current.days), unit: dayNoun(stats.current.days), sub: range(stats.current.start, stats.current.end) }
  ];
  const showRow = !(is3d && corners);
  const hint = is3d && orbit ? labels.hintSkyline : labels.hintFlat;
  const [titleBefore, titleAfter = ""] = labels.title.split("{count}");
  const titleVars = { unit: noun(stats.total) };

  const cornerStyle = (shown: boolean, hidden: string, delay: number) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : hidden,
    transitionDuration: shown ? "600ms" : "300ms",
    transitionDelay: shown ? Math.round(duration * delay) + "ms" : "0ms"
  });

  return (
    <section ref={rootRef} className={"skyline " + className}>
      <header className="skyline-header">
        <h3 className="skyline-title">
          {fill(titleBefore, titleVars)}
          <span className="skyline-title-count">{nf.format(stats.total)}</span>
          {fill(titleAfter, titleVars)}
        </h3>
        <div role="group" aria-label={labels.viewGroup} className="skyline-toggle" data-view={view}>
          <span aria-hidden="true" className="skyline-toggle-thumb" />
          {(["2d", "3d"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={v === "2d" ? labels.viewFlat : labels.viewSkyline}
              title={v === "2d" ? labels.viewFlat : labels.viewSkyline}
              onClick={() => {
                setToggled(true);
                setReserve(false);
                setView(v);
              }}
              className="skyline-toggle-button"
            >
              {v === "2d" ? <GridIcon /> : <CubeIcon />}
            </button>
          ))}
        </div>
      </header>

      <div className="skyline-frame">
        <div className="skyline-body">
          <div ref={stageRef} className="skyline-stage" data-reserve={reserve} style={{ "--sk-aspect": model.aspect.toFixed(4) } as CSSProperties}>
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="img"
              aria-label={fill(labels.canvas, {
                count: nf.format(stats.total),
                unit: noun(stats.total),
                range: range(stats.first, stats.last, true),
                view: is3d ? labels.canvasSkyline : labels.canvasFlat
              })}
              className="skyline-canvas"
              style={{ touchAction: is3d && orbit ? "pan-y" : "auto" }}
            />

            {corners && (
              <>
                <div aria-hidden={!is3d} className="skyline-corner skyline-corner-top" style={cornerStyle(is3d, "translateY(-10px)", 0.55)}>
                  <Stat {...statBlocks[0]} accent={theme.accent} size={bigSize} align="end" />
                  <Stat {...statBlocks[1]} accent={theme.accent} size={bigSize} align="end" />
                </div>
                <div aria-hidden={!is3d} className="skyline-corner skyline-corner-bottom" style={cornerStyle(is3d, "translateY(10px)", 0.65)}>
                  <Stat {...statBlocks[2]} accent={theme.accent} size={bigSize} align="start" />
                  <Stat {...statBlocks[3]} accent={theme.accent} size={bigSize} align="start" />
                </div>
              </>
            )}
          </div>

          <div ref={tipRef} role="tooltip" aria-hidden={active < 0} className="skyline-tip" style={{ opacity: active >= 0 ? 1 : 0 }}>
            {active >= 0 && model.cells[active] ? (
              <>
                <strong>{amount(model.cells[active].count)}</strong>
                <span className="skyline-tip-date"> {labels.on} {dfy.format(dayMs(model.cells[active].date))}</span>
              </>
            ) : (
              " "
            )}
            <span aria-hidden="true" className="skyline-tip-arrow" />
          </div>
        </div>

        <div
          aria-hidden={!showRow}
          className="skyline-stats"
          style={{ gridTemplateRows: showRow ? "1fr" : "0fr", opacity: showRow ? 1 : 0, transitionDuration: toggled ? duration + "ms" : "0ms" }}
        >
          <div className="skyline-stats-clip">
            <div className="skyline-stats-grid">
              {statBlocks.map((b) => (
                <Stat key={b.label} {...b} accent={theme.accent} size={28} align="stack" />
              ))}
            </div>
          </div>
        </div>

        <div className="skyline-footer">
          <span className="skyline-hints">
            {[labels.hintFlat, labels.hintSkyline].map((h) => (
              <span key={h} aria-hidden={h !== hint} className="skyline-hint" style={{ opacity: h === hint ? 1 : 0 }}>
                {h}
              </span>
            ))}
          </span>
          <div className="skyline-legend" onMouseLeave={() => setHoverLevel(-1)}>
            <span>{labels.less}</span>
            {/* Com mouse a legenda são botões que isolam um nível; no toque é só a chave de cores (alvos de 44px não cabem aqui). */}
            <span aria-hidden="true" className="skyline-key">
              {theme.swatches.map((c, i) => (
                <span key={i} className="skyline-key-cell" style={{ "--sk-swatch": c } as CSSProperties} />
              ))}
            </span>
            {theme.swatches.map((c, i) => (
              <button
                key={i}
                type="button"
                aria-label={fill(labels.highlight, { level: labels.levels[i] })}
                aria-pressed={pinLevel === i}
                title={labels.levels[i]}
                onMouseEnter={() => setHoverLevel(i)}
                onFocus={() => setHoverLevel(i)}
                onBlur={() => setHoverLevel(-1)}
                onClick={() => setPinLevel((l) => (l === i ? -1 : i))}
                className="skyline-swatch"
                style={{ "--sk-swatch": c } as CSSProperties}
              />
            ))}
            <span>{labels.more}</span>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="skyline-sr">
        {announce}
      </p>
    </section>
  );
}
