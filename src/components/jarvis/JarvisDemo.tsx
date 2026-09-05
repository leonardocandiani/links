import { useEffect, useReducer, useRef, useState, type SyntheticEvent } from "react";

import { jarvisInitialStep, jarvisReducer, type JarvisEvent } from "./jarvis-machine";
import {
  jarvisScenariosByLocale,
  jarvisUiByLocale,
  routeJarvisQuestion,
  type JarvisLocale
} from "./jarvis-i18n";
import type { JarvisScenario } from "./jarvis-scenarios";

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function answerLines(answer: string) {
  return answer.match(/[^.!?]+[.!?]+/g)?.map((line) => line.trim()) ?? [answer];
}

type Props = {
  locale?: JarvisLocale;
};

export default function JarvisDemo({ locale = "pt-BR" }: Props) {
  const [step, dispatch] = useReducer(jarvisReducer, jarvisInitialStep);
  const [activeScenario, setActiveScenario] = useState<JarvisScenario | null>(null);
  const [question, setQuestion] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [runId, setRunId] = useState(0);
  const controlRef = useRef<HTMLElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const ui = jarvisUiByLocale[locale];
  const scenarioList = Object.values(jarvisScenariosByLocale[locale]);

  useEffect(() => {
    let nextEvent: JarvisEvent | null = null;
    let delay = 0;

    if (step === "question") {
      nextEvent = { type: "CONSULT" };
      delay = 360;
    } else if (step === "consulting") {
      nextEvent = { type: "ANSWER" };
      delay = 1_450;
    } else if (step === "answering") {
      nextEvent = { type: "REQUEST_APPROVAL" };
      delay = 1_700;
    } else if (step === "executing") {
      nextEvent = { type: "COMPLETE" };
      delay = 1_250;
    }

    if (!nextEvent) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch(nextEvent);
    }, reducedMotion ? 30 : delay);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, runId, step]);

  function moveToConversation() {
    if (window.innerWidth > 928 || !conversationRef.current) {
      return;
    }

    conversationRef.current.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function startScenario(scenario: JarvisScenario, submittedQuestion = scenario.question) {
    setRunId((currentRun) => currentRun + 1);
    setActiveScenario(scenario);
    setQuestion(submittedQuestion);
    dispatch({ type: "START" });
    window.requestAnimationFrame(moveToConversation);
  }

  function submitQuestion(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const normalizedQuestion = customQuestion.trim();

    if (!normalizedQuestion) {
      return;
    }

    const scenario = routeJarvisQuestion(normalizedQuestion, locale);
    setQuestion(normalizedQuestion);

    if (!scenario) {
      setRunId((currentRun) => currentRun + 1);
      setActiveScenario(null);
      dispatch({ type: "UNSUPPORTED" });
      window.requestAnimationFrame(moveToConversation);
      return;
    }

    startScenario(scenario, normalizedQuestion);
  }

  function resetDemo() {
    setRunId((currentRun) => currentRun + 1);
    setActiveScenario(null);
    setQuestion("");
    setCustomQuestion("");
    dispatch({ type: "RESET" });
    window.requestAnimationFrame(() => {
      controlRef.current?.querySelector<HTMLButtonElement>(".jarvis-scenario")?.focus({ preventScroll: true });
      if (window.innerWidth <= 928) {
        controlRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  }

  function focusQuestionInput() {
    questionInputRef.current?.focus({ preventScroll: true });
    questionInputRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }

  const hasQuestion = step !== "idle";
  const showsTools = activeScenario && ["consulting", "answering", "approval", "executing", "success"].includes(step);
  const showsAnswer = activeScenario && ["answering", "approval", "executing", "success"].includes(step);

  return (
    <>
      <div className="jarvis-demo" data-step={step}>
        <div className="jarvis-demo-toolbar">
          <span>{ui.toolbar.title}</span>
          <span className="jarvis-live">{ui.toolbar.live}</span>
        </div>

        <div className="jarvis-status" role="status" aria-live="polite" aria-atomic="true">
          {ui.statusTextByStep[step]}
        </div>

        <div className="jarvis-demo-grid">
          <section className="jarvis-control" ref={controlRef} aria-labelledby="jarvis-control-title">
            <div>
              <p className="jarvis-kicker">{ui.control.kicker}</p>
              <h3 id="jarvis-control-title">{ui.control.title}</h3>
            </div>
            <p className="jarvis-control-copy">
              {ui.control.copy}
            </p>

            <div className="jarvis-scenarios" aria-label={ui.control.scenariosAriaLabel}>
              {scenarioList.map((scenario, index) => (
                <button
                  key={scenario.id}
                  className="jarvis-scenario"
                  type="button"
                  aria-pressed={activeScenario?.id === scenario.id}
                  onClick={() => startScenario(scenario)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{scenario.shortQuestion}</strong>
                  <small>{scenario.domain}</small>
                </button>
              ))}
            </div>

            <form className="jarvis-compose" onSubmit={submitQuestion}>
              <label className="jarvis-visually-hidden" htmlFor="jarvis-question">
                {ui.control.questionLabel}
              </label>
              <input
                id="jarvis-question"
                ref={questionInputRef}
                type="text"
                maxLength={96}
                value={customQuestion}
                placeholder={ui.control.questionPlaceholder}
                onChange={(event) => setCustomQuestion(event.target.value)}
              />
              <button type="submit">{ui.control.submitButton}</button>
            </form>
            <p className="jarvis-demo-note">{ui.control.demoNote}</p>
          </section>

          <section
            className="jarvis-experience"
            ref={conversationRef}
            aria-label={ui.phone.ariaLabel}
          >
            <div className="jarvis-phone">
              <div className="jarvis-phone-header">
                <span className="jarvis-avatar" aria-hidden="true">{ui.phone.avatar}</span>
                <span><strong>{ui.phone.name}</strong><small>{ui.phone.availability}</small></span>
                <span className="jarvis-secure">{ui.phone.secure}</span>
              </div>

              <div
                className="jarvis-thread"
                aria-busy={["consulting", "answering", "executing"].includes(step)}
              >
                {step === "idle" ? (
                  <div className="jarvis-idle">
                    <strong>{ui.idle.title}</strong>
                    <p>{ui.idle.copy}</p>
                  </div>
                ) : null}

                {hasQuestion ? (
                  <div className="jarvis-message-director jarvis-enter">
                    <p>{question}</p>
                  </div>
                ) : null}

                {step === "consulting" && activeScenario ? (
                  <div className="jarvis-thinking jarvis-enter">
                    <span className="jarvis-pixels" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
                    <span>{ui.thinking.title}</span>
                    <small>{ui.thinking.live}</small>
                  </div>
                ) : null}

                {showsTools ? (
                  <ul className="jarvis-tools" aria-label={ui.tools.ariaLabel}>
                    {activeScenario.tools.map((tool, index) => (
                      <li key={tool} style={{ animationDelay: `${index * 120}ms` }}>{tool}</li>
                    ))}
                  </ul>
                ) : null}

                {showsAnswer ? (
                  <article className="jarvis-answer jarvis-enter">
                    <strong>{activeScenario.answerTitle}</strong>
                    <div className="jarvis-answer-copy">
                      {answerLines(activeScenario.answer).map((line, index) => (
                        <p key={line} style={{ animationDelay: `${index * 180}ms` }}>{line}</p>
                      ))}
                    </div>
                    <ul className="jarvis-sources" aria-label={ui.sources.ariaLabel}>
                      {activeScenario.sources.map((source) => <li key={source}>{source}</li>)}
                    </ul>
                  </article>
                ) : null}

                {step === "approval" && activeScenario ? (
                  <article className="jarvis-approval jarvis-enter">
                    <strong>{activeScenario.actionTitle}</strong>
                    <p>{activeScenario.action}</p>
                    <div className="jarvis-approval-footer">
                      <span>{ui.approval.confidence}</span>
                      <button type="button" onClick={() => dispatch({ type: "AUTHORIZE" })}>{ui.approval.authorizeButton}</button>
                    </div>
                    <button className="jarvis-ask-again" type="button" onClick={resetDemo}>{ui.approval.askAgainButton}</button>
                  </article>
                ) : null}

                {step === "executing" && activeScenario ? (
                  <ol className="jarvis-tasks jarvis-enter" aria-label={ui.executing.ariaLabel}>
                    {activeScenario.tasks.map((task, index) => (
                      <li key={task} style={{ animationDelay: `${index * 160}ms` }}>
                        <span>{task}</span><small>{ui.executing.taskStatus}</small>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {step === "success" && activeScenario ? (
                  <div className="jarvis-success jarvis-enter">
                    <strong>{ui.success.title}</strong>
                    <p>{activeScenario.success}</p>
                    <button className="jarvis-ask-again" type="button" onClick={resetDemo}>{ui.success.askAgainButton}</button>
                  </div>
                ) : null}

                {step === "unsupported" ? (
                  <div className="jarvis-unsupported jarvis-enter">
                    <strong>{ui.unsupported.title}</strong>
                    <p>{ui.unsupported.copy}</p>
                    <button className="jarvis-ask-again" type="button" onClick={resetDemo}>{ui.unsupported.button}</button>
                  </div>
                ) : null}
              </div>

              <button className="jarvis-input-bar" type="button" aria-controls="jarvis-question" onClick={focusQuestionInput}>
                <span>{ui.phone.inputPlaceholder}</span><b aria-hidden="true">{ui.phone.sendSymbol}</b>
              </button>
            </div>

            {step === "consulting" && activeScenario ? (
              <aside className="jarvis-backstage jarvis-enter" aria-label={ui.backstage.ariaLabel}>
                <div className="jarvis-backstage-head"><span>{ui.backstage.title}</span><span>{ui.backstage.runStatus}</span></div>
                <ul>
                  {activeScenario.traces.map((trace, index) => (
                    <li key={trace} style={{ animationDelay: `${index * 140}ms` }}>
                      <i aria-hidden="true" /><span>{trace}</span><small>{34 + index * 27}ms</small>
                    </li>
                  ))}
                </ul>
                <code><b>{ui.backstage.code.declaration}</b> {ui.backstage.code.variable} {ui.backstage.code.assignment} <b>await</b> {ui.backstage.code.awaitedNamespace}.<em>{ui.backstage.code.awaitedMethod}</em>({ui.backstage.code.awaitedArgument})<br /><b>{ui.backstage.code.returnKeyword}</b> {ui.backstage.code.returnVariable}.<em>{ui.backstage.code.approvalMethod}</em>()</code>
              </aside>
            ) : null}
          </section>
        </div>
      </div>
      <style>{styles}</style>
    </>
  );
}

const styles = `
  .jarvis-demo {
    overflow: hidden;
    border-radius: 1.1rem;
    background: #171513;
    color: #f4f0e9;
  }

  .jarvis-status,
  .jarvis-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    border: 0;
    white-space: nowrap;
  }

  .jarvis-demo-toolbar,
  .jarvis-kicker,
  .jarvis-live,
  .jarvis-secure,
  .jarvis-tools,
  .jarvis-sources,
  .jarvis-backstage,
  .jarvis-demo-note,
  .jarvis-approval-footer span {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .jarvis-demo-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 3.5rem;
    padding: 0 1.1rem;
    border-bottom: 1px solid rgb(244 240 233 / 12%);
    font-size: .66rem;
    letter-spacing: .04em;
  }

  .jarvis-live {
    display: inline-flex;
    align-items: center;
    gap: .45rem;
    color: #dfe9ee;
  }

  .jarvis-live::before {
    width: .4rem;
    height: .4rem;
    border-radius: 999px;
    background: #90adbf;
    box-shadow: 0 0 0 .25rem rgb(144 173 191 / 10%);
    content: "";
  }

  .jarvis-demo-grid {
    display: grid;
    grid-template-columns: minmax(17rem, .84fr) minmax(23rem, 1.16fr);
    min-height: 43rem;
  }

  .jarvis-control {
    display: grid;
    align-content: start;
    gap: 1.3rem;
    padding: clamp(1.35rem, 3vw, 2.4rem);
    border-right: 1px solid rgb(244 240 233 / 12%);
    background: #201e1b;
    scroll-margin-top: 5.5rem;
  }

  .jarvis-kicker {
    margin: 0 0 .6rem;
    color: #90adbf;
    font-size: .68rem;
    text-transform: uppercase;
    letter-spacing: .1em;
  }

  .jarvis-control h3 {
    max-width: 12ch;
    margin: 0;
    color: #f4f0e9;
    font-size: clamp(1.85rem, 2.9vw, 3.25rem);
    font-weight: 620;
    line-height: 1.02;
    letter-spacing: -.045em;
  }

  .jarvis-control-copy {
    max-width: 34rem;
    margin: 0;
    color: rgb(244 240 233 / 64%);
    font-size: .92rem;
    line-height: 1.55;
  }

  .jarvis-scenarios {
    display: grid;
    gap: .45rem;
  }

  .jarvis-scenario {
    display: grid;
    grid-template-columns: 2rem 1fr auto;
    gap: .7rem;
    align-items: center;
    width: 100%;
    min-height: 3.25rem;
    padding: .55rem;
    border: 1px solid rgb(244 240 233 / 12%);
    border-radius: .7rem;
    background: rgb(244 240 233 / 3%);
    color: #f4f0e9;
    text-align: left;
    cursor: pointer;
    transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
  }

  .jarvis-scenario:hover,
  .jarvis-scenario:focus-visible,
  .jarvis-scenario[aria-pressed="true"] {
    border-color: rgb(144 173 191 / 58%);
    background: rgb(144 173 191 / 10%);
    outline: none;
    transform: translateX(.2rem);
  }

  .jarvis-scenario > span {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border-radius: .5rem;
    background: rgb(244 240 233 / 7%);
    color: #90adbf;
    font: .62rem ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .jarvis-scenario strong {
    font-size: .84rem;
    font-weight: 650;
  }

  .jarvis-scenario small {
    color: #bcb6ae;
    font-size: .7rem;
  }

  .jarvis-compose {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .45rem;
  }

  .jarvis-compose input {
    min-width: 0;
    min-height: 2.9rem;
    padding: .7rem .8rem;
    border: 1px solid rgb(244 240 233 / 12%);
    border-radius: .65rem;
    background: #171513;
    color: #f4f0e9;
    font: inherit;
    font-size: .8rem;
    outline: none;
  }

  .jarvis-compose input:focus {
    border-color: rgb(144 173 191 / 62%);
  }

  .jarvis-compose button,
  .jarvis-approval-footer button,
  .jarvis-ask-again {
    min-width: 44px;
    min-height: 44px;
    border: 0;
    border-radius: .65rem;
    background: #f4f0e9;
    color: #171513;
    font: inherit;
    font-size: .78rem;
    font-weight: 720;
    cursor: pointer;
  }

  .jarvis-compose button {
    padding: 0 .9rem;
  }

  .jarvis-demo-note {
    margin: -.65rem 0 0;
    color: #bcb6ae;
    font-size: .78rem;
    line-height: 1.5;
  }

  .jarvis-experience {
    position: relative;
    display: grid;
    place-items: center;
    min-width: 0;
    padding: clamp(1rem, 2.5vw, 2rem);
    background: #292621;
    scroll-margin-top: 5.5rem;
  }

  .jarvis-phone {
    display: grid;
    grid-template-rows: auto 1fr auto;
    width: min(100%, 30rem);
    min-height: 38rem;
    overflow: hidden;
    border: 1px solid rgb(244 240 233 / 16%);
    border-radius: 1.35rem;
    background: #11110f;
    box-shadow: 0 1.75rem 5rem rgb(0 0 0 / 30%);
  }

  .jarvis-phone-header {
    display: grid;
    grid-template-columns: 2.1rem 1fr auto;
    gap: .65rem;
    align-items: center;
    padding: .75rem .85rem;
    border-bottom: 1px solid rgb(244 240 233 / 12%);
    background: #1d1b18;
  }

  .jarvis-avatar {
    display: grid;
    width: 2.1rem;
    height: 2.1rem;
    place-items: center;
    border-radius: 999px;
    background: #dfe9ee;
    color: #171513;
    font: 700 .65rem ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .jarvis-phone-header strong,
  .jarvis-phone-header small {
    display: block;
  }

  .jarvis-phone-header strong {
    color: #f4f0e9;
    font-size: .76rem;
  }

  .jarvis-phone-header small {
    margin-top: .12rem;
    color: rgb(244 240 233 / 64%);
    font-size: .62rem;
  }

  .jarvis-secure {
    color: #90adbf;
    font-size: .54rem;
  }

  .jarvis-thread {
    display: grid;
    align-content: start;
    gap: .62rem;
    padding: .9rem;
    overflow: hidden;
  }

  .jarvis-idle {
    align-self: center;
    margin: 7rem auto 0;
    color: rgb(244 240 233 / 66%);
    text-align: center;
  }

  .jarvis-idle strong {
    display: block;
    margin-bottom: .25rem;
    color: rgb(244 240 233 / 72%);
    font-size: .88rem;
  }

  .jarvis-idle p,
  .jarvis-message-director p,
  .jarvis-answer p,
  .jarvis-approval p,
  .jarvis-success p,
  .jarvis-unsupported p {
    margin: 0;
    letter-spacing: 0;
    line-height: 1.48;
  }

  .jarvis-idle p {
    font-size: .7rem;
  }

  .jarvis-message-director {
    justify-self: end;
    max-width: 84%;
    padding: .7rem .78rem;
    border-radius: .8rem .8rem .25rem .8rem;
    background: #dfe9ee;
    color: #171513;
    font-size: .75rem;
  }

  .jarvis-thinking {
    display: grid;
    grid-template-columns: 1.2rem 1fr auto;
    gap: .5rem;
    align-items: center;
    padding: .6rem;
    border: 1px solid rgb(244 240 233 / 12%);
    border-radius: .6rem;
    background: rgb(244 240 233 / 3%);
    color: #dfe9ee;
    font-size: .68rem;
  }

  .jarvis-thinking small {
    color: rgb(244 240 233 / 38%);
    font: .55rem ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .jarvis-pixels {
    display: grid;
    grid-template-columns: repeat(3, .2rem);
    gap: .13rem;
  }

  .jarvis-pixels i {
    width: .2rem;
    height: .2rem;
    background: #90adbf;
    animation: jarvis-pulse 620ms ease-in-out infinite alternate;
  }

  .jarvis-pixels i:nth-child(2),
  .jarvis-pixels i:nth-child(4) { animation-delay: 120ms; }
  .jarvis-pixels i:nth-child(3),
  .jarvis-pixels i:nth-child(5) { animation-delay: 240ms; }

  .jarvis-tools,
  .jarvis-sources,
  .jarvis-backstage ul,
  .jarvis-tasks {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .jarvis-tools,
  .jarvis-sources {
    display: flex;
    flex-wrap: wrap;
    gap: .35rem;
  }

  .jarvis-tools li {
    padding: .42rem .48rem;
    border: 1px solid rgb(244 240 233 / 12%);
    border-radius: 999px;
    color: #dfe9ee;
    font-size: .55rem;
    opacity: 0;
    transform: translateY(.3rem);
    animation: jarvis-item-in 280ms ease forwards;
  }

  .jarvis-tools li::before {
    display: inline-block;
    width: .3rem;
    height: .3rem;
    margin-right: .35rem;
    border-radius: 999px;
    background: #90adbf;
    content: "";
  }

  .jarvis-answer,
  .jarvis-approval,
  .jarvis-success,
  .jarvis-unsupported,
  .jarvis-tasks {
    padding: .75rem;
    border: 1px solid rgb(244 240 233 / 12%);
    border-radius: .72rem;
    background: rgb(244 240 233 / 5%);
  }

  .jarvis-answer > strong,
  .jarvis-approval > strong,
  .jarvis-success > strong,
  .jarvis-unsupported > strong {
    display: block;
    margin-bottom: .35rem;
    color: #f4f0e9;
    font-size: .78rem;
  }

  .jarvis-answer-copy {
    min-height: 3.2rem;
  }

  .jarvis-answer-copy p {
    color: rgb(244 240 233 / 76%);
    font-size: .68rem;
    opacity: 0;
    transform: translateY(.25rem);
    animation: jarvis-item-in 320ms ease forwards;
  }

  .jarvis-answer-copy p + p {
    margin-top: .1rem;
  }

  .jarvis-sources {
    margin-top: .55rem;
  }

  .jarvis-sources li {
    padding: .3rem .4rem;
    border-radius: 999px;
    background: rgb(144 173 191 / 10%);
    color: #90adbf;
    font-size: .5rem;
  }

  .jarvis-approval p,
  .jarvis-success p,
  .jarvis-unsupported p {
    color: rgb(244 240 233 / 64%);
    font-size: .66rem;
  }

  .jarvis-approval-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .6rem;
    margin-top: .65rem;
  }

  .jarvis-approval-footer span {
    color: #90adbf;
    font-size: .5rem;
  }

  .jarvis-approval-footer button {
    padding: .55rem .7rem;
  }

  .jarvis-ask-again {
    display: block;
    min-height: 2.75rem;
    margin-top: .45rem;
    padding: .45rem .2rem;
    background: transparent;
    color: #dfe9ee;
    text-decoration: underline;
    text-underline-offset: .18rem;
  }

  .jarvis-tasks {
    display: grid;
    gap: .35rem;
  }

  .jarvis-tasks li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    min-height: 2.2rem;
    padding: .45rem .55rem;
    border-radius: .5rem;
    background: rgb(144 173 191 / 8%);
    color: #f4f0e9;
    font-size: .66rem;
    opacity: 0;
    transform: translateY(.3rem);
    animation: jarvis-item-in 280ms ease forwards;
  }

  .jarvis-tasks small {
    color: #90adbf;
    font: .5rem ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .jarvis-success {
    border-color: rgb(144 173 191 / 38%);
    background: rgb(144 173 191 / 9%);
  }

  .jarvis-unsupported {
    border-color: rgb(217 180 151 / 34%);
  }

  .jarvis-input-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    width: 100%;
    min-height: 44px;
    gap: .45rem;
    padding: .65rem;
    border: 0;
    border-top: 1px solid rgb(244 240 233 / 12%);
    background: #1d1b18;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .jarvis-input-bar:hover {
    background: #292621;
  }

  .jarvis-input-bar:focus-visible {
    outline: 2px solid #90adbf;
    outline-offset: -3px;
  }

  .jarvis-input-bar span {
    padding: .6rem .7rem;
    border-radius: 999px;
    background: rgb(244 240 233 / 6%);
    color: rgb(244 240 233 / 64%);
    font-size: .85rem;
  }

  .jarvis-input-bar b {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border-radius: 999px;
    background: #dfe9ee;
    color: #171513;
    font-size: .72rem;
  }

  .jarvis-backstage {
    position: absolute;
    right: .75rem;
    bottom: .75rem;
    width: min(15rem, 54%);
    overflow: hidden;
    border: 1px solid rgb(244 240 233 / 14%);
    border-radius: .75rem;
    background: rgb(17 17 15 / 96%);
    box-shadow: 0 1rem 3rem rgb(0 0 0 / 28%);
    color: rgb(244 240 233 / 66%);
  }

  .jarvis-backstage-head {
    display: flex;
    justify-content: space-between;
    padding: .55rem .6rem;
    border-bottom: 1px solid rgb(244 240 233 / 12%);
    color: #dfe9ee;
    font-size: .52rem;
  }

  .jarvis-backstage ul {
    display: grid;
    gap: .28rem;
    padding: .55rem;
  }

  .jarvis-backstage li {
    display: grid;
    grid-template-columns: .5rem 1fr auto;
    gap: .4rem;
    padding: .4rem;
    border-radius: .42rem;
    background: rgb(244 240 233 / 4%);
    font-size: .5rem;
    opacity: 0;
    transform: translateY(.25rem);
    animation: jarvis-item-in 240ms ease forwards;
  }

  .jarvis-backstage li i {
    width: .32rem;
    height: .32rem;
    margin-top: .08rem;
    border-radius: 999px;
    background: #90adbf;
  }

  .jarvis-backstage code {
    display: block;
    padding: 0 .65rem .65rem;
    color: rgb(244 240 233 / 48%);
    font-size: .5rem;
    line-height: 1.6;
  }

  .jarvis-backstage code b {
    color: #90adbf;
    font-weight: 500;
  }

  .jarvis-backstage code em {
    color: #d9b497;
    font-style: normal;
  }

  .jarvis-enter {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 260ms ease, transform 360ms cubic-bezier(.2, .8, .2, 1);
  }

  @starting-style {
    .jarvis-enter {
      opacity: 0;
      transform: translateY(.5rem);
    }
  }

  @keyframes jarvis-pulse {
    from { opacity: .2; transform: scale(.7); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes jarvis-item-in {
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 62rem) {
    .jarvis-demo-grid {
      grid-template-columns: 1fr;
    }

    .jarvis-control {
      border-right: 0;
      border-bottom: 1px solid rgb(244 240 233 / 12%);
    }

    .jarvis-experience {
      padding: 1rem .65rem 1.2rem;
    }

    .jarvis-phone {
      min-height: 39rem;
      border-radius: 1.1rem;
    }

    .jarvis-backstage {
      right: .35rem;
      bottom: .35rem;
      width: 58%;
    }
  }

  @media (max-width: 34rem) {
    .jarvis-demo-toolbar {
      align-items: flex-start;
      flex-direction: column;
      justify-content: center;
      gap: .25rem;
      min-height: 4rem;
    }

    .jarvis-control {
      padding: 1.35rem 1rem;
    }

    .jarvis-control h3 {
      font-size: clamp(1.85rem, 9vw, 2.45rem);
    }

    .jarvis-scenario {
      grid-template-columns: 2rem 1fr;
    }

    .jarvis-scenario small {
      grid-column: 2;
    }

    .jarvis-compose {
      grid-template-columns: 1fr;
    }

    .jarvis-compose button {
      width: 100%;
    }

    .jarvis-phone-header {
      grid-template-columns: 2.1rem 1fr;
    }

    .jarvis-secure {
      display: none;
    }

    .jarvis-approval-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .jarvis-approval-footer button {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jarvis-demo *,
    .jarvis-demo *::before,
    .jarvis-demo *::after {
      animation: none !important;
      scroll-behavior: auto !important;
      transition: none !important;
    }

    .jarvis-tools li,
    .jarvis-answer-copy p,
    .jarvis-tasks li,
    .jarvis-backstage li {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .jarvis-phone,
    .jarvis-backstage {
      box-shadow: none;
    }

    .jarvis-backstage {
      background: #11110f;
    }
  }
`;
