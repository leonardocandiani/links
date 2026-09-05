import { useEffect, useId, useState, type KeyboardEvent } from "react";

import type { RepertoireArea } from "../types/site";

type Props = {
  areas: RepertoireArea[];
  tabsLabel: string;
  toolsLabel: string;
};

export default function RepertoireExplorer({ areas, tabsLabel, toolsLabel }: Props) {
  const [activeId, setActiveId] = useState(areas[0]?.id ?? "");
  const [isHydrated, setIsHydrated] = useState(false);
  const panelPrefix = useId();
  const activeArea = areas.find((area) => area.id === activeId) ?? areas[0];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!activeArea) {
    return null;
  }

  function selectByOffset(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? areas.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + areas.length) % areas.length;
    const nextArea = areas[nextIndex];

    if (!nextArea) {
      return;
    }

    setActiveId(nextArea.id);
    document.getElementById(`${panelPrefix}-tab-${nextArea.id}`)?.focus();
  }

  return (
    <div className="repertoire-explorer" data-enhanced={isHydrated ? "true" : "false"}>
      <div className="repertoire-tabs" role={isHydrated ? "tablist" : "navigation"} aria-label={tabsLabel}>
        {areas.map((area, index) => (
          isHydrated ? <button
            className="repertoire-tab pressable"
            id={`${panelPrefix}-tab-${area.id}`}
            key={area.id}
            type="button"
            role="tab"
            aria-controls={`${panelPrefix}-panel-${area.id}`}
            aria-selected={activeArea.id === area.id}
            tabIndex={activeArea.id === area.id ? 0 : -1}
            onClick={() => setActiveId(area.id)}
            onKeyDown={(event) => selectByOffset(event, index)}
          >
            {area.label}
          </button> : <a
            key={area.id}
            className="repertoire-tab pressable"
            href={`#${panelPrefix}-panel-${area.id}`}
          >
            {area.label}
          </a>
        ))}
      </div>

      {areas.map((area, areaIndex) => <div
        className="repertoire-panel"
        id={`${panelPrefix}-panel-${area.id}`}
        role={isHydrated && activeArea.id === area.id ? "tabpanel" : undefined}
        aria-labelledby={isHydrated ? `${panelPrefix}-tab-${area.id}` : undefined}
        hidden={isHydrated && activeArea.id !== area.id}
        tabIndex={isHydrated && activeArea.id === area.id ? 0 : undefined}
        key={area.id}
      >
        <div className="repertoire-summary">
          <p className="repertoire-count">{String(areaIndex + 1).padStart(2, "0")}</p>
          <h3>{area.title}</h3>
          <p>{area.description}</p>
          <ul className="repertoire-tools" aria-label={toolsLabel}>
            {area.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </div>

        <ol className="repertoire-items">
          {area.items.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>)}
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .repertoire-explorer {
    display: grid;
    gap: 0;
    border-block: 1px solid var(--color-line);
  }

  .repertoire-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: .25rem .75rem;
    padding-block: .5rem;
    border-bottom: 1px solid var(--color-line);
  }

  .repertoire-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    flex: 1 1 auto;
    padding: .65rem .5rem;
    border: 0;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: transparent;
    color: var(--color-muted);
    cursor: pointer;
    font: inherit;
    font-size: .93rem;
    font-weight: 580;
    line-height: 1.3;
    text-align: center;
    text-decoration: none;
    text-wrap: balance;
  }

  .repertoire-tab[aria-selected="true"] {
    border-bottom-color: var(--color-ink);
    color: var(--color-ink);
    font-weight: 680;
  }

  .repertoire-tab:hover {
    color: var(--color-ink);
  }

  .repertoire-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
    gap: clamp(2.5rem, 6vw, 6rem);
    padding-block: clamp(2rem, 4vw, 3.5rem);
    scroll-margin-top: 6rem;
  }

  .repertoire-panel[hidden] {
    display: none;
  }

  .repertoire-explorer[data-enhanced="true"] .repertoire-panel:not([hidden]) {
    animation: repertoire-in 320ms var(--ease-out) both;
  }

  .repertoire-explorer[data-enhanced="false"] .repertoire-panel + .repertoire-panel {
    border-top: 1px solid var(--color-line);
  }

  .repertoire-summary {
    display: grid;
    align-content: start;
    gap: 1.2rem;
  }

  .repertoire-count {
    margin: 0 0 .5rem;
    color: var(--color-graphite);
    font-size: .9rem;
    font-weight: 620;
  }

  .repertoire-summary h3,
  .repertoire-items h4,
  .repertoire-summary p,
  .repertoire-items p {
    margin: 0;
  }

  .repertoire-summary h3 {
    max-width: 19ch;
    color: var(--color-ink);
    font-size: clamp(2rem, 1.6rem + 1.8vw, 3.65rem);
    font-weight: 560;
    letter-spacing: -.035em;
    line-height: 1.02;
  }

  .repertoire-summary > p:not(.repertoire-count) {
    max-width: 42rem;
    color: var(--color-muted);
    font-size: 1.08rem;
    line-height: 1.58;
  }

  .repertoire-tools {
    display: flex;
    flex-wrap: wrap;
    gap: .4rem 1rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .repertoire-tools li {
    padding: .35rem 0;
    color: var(--color-graphite);
    font-size: .82rem;
    font-weight: 570;
  }

  .repertoire-items {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .repertoire-items li {
    display: grid;
    grid-template-columns: 2rem 1fr;
    gap: 1rem;
    padding-block: 1.4rem;
    border-top: 1px solid var(--color-line);
  }

  .repertoire-items li:last-child {
    border-bottom: 1px solid var(--color-line);
  }

  .repertoire-items li > span {
    color: var(--color-muted);
    font-size: .8rem;
    font-weight: 600;
  }

  .repertoire-items h4 {
    color: var(--color-ink);
    font-size: 1.08rem;
    font-weight: 620;
    line-height: 1.25;
  }

  .repertoire-items p {
    margin-top: .45rem;
    color: var(--color-muted);
    font-size: .96rem;
    line-height: 1.5;
  }

  @keyframes repertoire-in {
    from { transform: translateY(.6rem); }
    to { transform: translateY(0); }
  }

  @media (max-width: 52rem) {
    .repertoire-tabs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .25rem .5rem;
    }

    .repertoire-tab {
      font-size: .875rem;
    }

    .repertoire-tab:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }

    .repertoire-panel {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .repertoire-explorer[data-enhanced="true"] .repertoire-panel:not([hidden]) {
      animation: none;
    }
  }
`;
