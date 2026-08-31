import { useId, useState, type KeyboardEvent } from "react";

import type { RepertoireArea } from "../types/site";

type Props = {
  areas: RepertoireArea[];
  tabsLabel: string;
  toolsLabel: string;
};

export default function RepertoireExplorer({ areas, tabsLabel, toolsLabel }: Props) {
  const [activeId, setActiveId] = useState(areas[0]?.id ?? "");
  const panelPrefix = useId();
  const activeArea = areas.find((area) => area.id === activeId) ?? areas[0];

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
    <div className="repertoire-explorer">
      <div className="repertoire-tabs" role="tablist" aria-label={tabsLabel}>
        {areas.map((area, index) => (
          <button
            className="repertoire-tab pressable"
            id={`${panelPrefix}-tab-${area.id}`}
            key={area.id}
            type="button"
            role="tab"
            aria-controls={`${panelPrefix}-panel`}
            aria-selected={activeArea.id === area.id}
            tabIndex={activeArea.id === area.id ? 0 : -1}
            onClick={() => setActiveId(area.id)}
            onKeyDown={(event) => selectByOffset(event, index)}
          >
            {area.label}
          </button>
        ))}
      </div>

      <div
        className="repertoire-panel"
        id={`${panelPrefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${panelPrefix}-tab-${activeArea.id}`}
        key={activeArea.id}
      >
        <div className="repertoire-summary">
          <p className="repertoire-count">{String(areas.findIndex((area) => area.id === activeArea.id) + 1).padStart(2, "0")}</p>
          <h3>{activeArea.title}</h3>
          <p>{activeArea.description}</p>
          <ul className="repertoire-tools" aria-label={toolsLabel}>
            {activeArea.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </div>

        <ol className="repertoire-items">
          {activeArea.items.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
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
    gap: .35rem;
    padding-block: .75rem;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .repertoire-tabs::-webkit-scrollbar {
    display: none;
  }

  .repertoire-tab {
    min-height: 44px;
    flex: 0 0 auto;
    padding: .65rem 1rem;
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-muted);
    cursor: pointer;
    font: inherit;
    font-size: .93rem;
    font-weight: 580;
  }

  .repertoire-tab[aria-selected="true"] {
    background: var(--color-ink);
    color: var(--color-paper);
  }

  .repertoire-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(24rem, .82fr);
    gap: clamp(2.5rem, 7vw, 7rem);
    padding-block: clamp(2rem, 5vw, 4.5rem);
    animation: repertoire-in 320ms var(--ease-out) both;
  }

  .repertoire-summary {
    display: grid;
    align-content: start;
    gap: 1.2rem;
  }

  .repertoire-count {
    margin: 0 0 clamp(1rem, 4vw, 3rem);
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
    gap: .5rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .repertoire-tools li {
    padding: .55rem .75rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background: rgb(251 250 247 / 52%);
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
      width: calc(100% + var(--space-page));
      padding-right: var(--space-page);
    }

    .repertoire-panel {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .repertoire-panel {
      animation: none;
    }
  }
`;
