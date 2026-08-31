# Minino Jarvis Interactive Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a demonstração manual do Minino Jarvis por uma experiência iniciada pelo visitante, com três cenários, pergunta livre roteada localmente, consulta animada, fontes, aprovação humana e confirmação de execução.

**Architecture:** Os textos e o roteamento determinístico ficam em um módulo puro e testável. A máquina de estados controla a sequência sem loop global, enquanto `JarvisDemo.tsx` coordena timers canceláveis, reduced motion e renderização. O case Astro continua responsável pela narrativa e passa a oferecer largura suficiente para a experiência aprovada.

**Tech Stack:** Astro 7, React 19, TypeScript 6, CSS local, Vitest, Testing Library, Playwright e axe-core.

---

## Regra de execução

Os checkpoints abaixo indicam cortes seguros. Nenhum commit será executado sem autorização explícita de Leonardo.

## Mapa de arquivos

- **Create: `src/components/jarvis/jarvis-scenarios.ts`**: tipos, três cenários e roteamento de pergunta livre.
- **Create: `src/components/jarvis/jarvis-scenarios.test.ts`**: coerência dos cenários e cobertura do roteador.
- **Modify: `src/components/jarvis/jarvis-machine.ts`**: estados e eventos da nova sequência.
- **Modify: `src/components/jarvis/jarvis-machine.test.ts`**: transições, reinício e estado fora de escopo.
- **Modify: `src/components/jarvis/JarvisDemo.tsx`**: controles, WhatsApp, consulta, streaming, approval, execução e estilos.
- **Modify: `src/components/jarvis/JarvisCaseStudy.astro`**: composição larga no desktop e fluxo linear no mobile.
- **Modify: `tests/portfolio.spec.ts`**: fluxo dos três cenários, pergunta livre, interrupção, autorização e mobile.
- **Modify: `tests/accessibility.spec.ts`**: reduced motion e análise Axe com a demonstração em estado interativo.

### Task 1: Modelar cenários e roteamento transparente

**Files:**
- Create: `src/components/jarvis/jarvis-scenarios.ts`
- Test: `src/components/jarvis/jarvis-scenarios.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Criar testes que exigem três cenários, fontes não vazias e roteamento semântico:

```ts
import { describe, expect, it } from "vitest";

import { jarvisScenarios, routeJarvisQuestion } from "./jarvis-scenarios";

describe("jarvisScenarios", () => {
  it("mantém três demonstrações empresariais completas", () => {
    expect(Object.keys(jarvisScenarios)).toEqual(["operation", "sales", "team"]);

    for (const scenario of Object.values(jarvisScenarios)) {
      expect(scenario.tools).toHaveLength(3);
      expect(scenario.sources).toHaveLength(3);
      expect(scenario.answer.length).toBeGreaterThan(80);
      expect(scenario.action.length).toBeGreaterThan(40);
    }
  });

  it.each([
    ["Como estão nossas vendas?", "sales"],
    ["Qual equipe está sobrecarregada?", "team"],
    ["Onde devo agir na operação hoje?", "operation"]
  ])("roteia %s para %s", (question, expected) => {
    expect(routeJarvisQuestion(question)?.id).toBe(expected);
  });

  it("não inventa resposta para pergunta fora do escopo", () => {
    expect(routeJarvisQuestion("Qual será o clima amanhã?")).toBeNull();
  });
});
```

- [ ] **Step 2: Provar a falha**

Run: `npm test -- src/components/jarvis/jarvis-scenarios.test.ts`

Expected: FAIL porque `jarvis-scenarios.ts` ainda não existe.

- [ ] **Step 3: Implementar o módulo puro**

Definir `JarvisScenarioId`, `JarvisScenario`, `jarvisScenarios`, `getJarvisScenario()` e `routeJarvisQuestion()`. Normalizar acentos com `normalize("NFD")`, remover marcas Unicode e procurar palavras completas de operação, comercial e equipe. Retornar `null` quando nenhum domínio for reconhecido.

- [ ] **Step 4: Provar o módulo**

Run: `npm test -- src/components/jarvis/jarvis-scenarios.test.ts`

Expected: 4 testes passando.

- [ ] **Step 5: Checkpoint sem commit**

Revisar `git diff -- src/components/jarvis/jarvis-scenarios.ts src/components/jarvis/jarvis-scenarios.test.ts`. Não executar `git commit`.

### Task 2: Trocar a máquina manual por uma sequência interruptível

**Files:**
- Modify: `src/components/jarvis/jarvis-machine.ts`
- Test: `src/components/jarvis/jarvis-machine.test.ts`

- [ ] **Step 1: Reescrever o teste de transição**

Cobrir a ordem aprovada e eventos explícitos:

```ts
expect(jarvisStepOrder).toEqual([
  "idle",
  "question",
  "consulting",
  "answering",
  "approval",
  "executing",
  "success"
]);
expect(jarvisReducer("idle", { type: "START" })).toBe("question");
expect(jarvisReducer("question", { type: "CONSULT" })).toBe("consulting");
expect(jarvisReducer("consulting", { type: "ANSWER" })).toBe("answering");
expect(jarvisReducer("answering", { type: "REQUEST_APPROVAL" })).toBe("approval");
expect(jarvisReducer("approval", { type: "AUTHORIZE" })).toBe("executing");
expect(jarvisReducer("executing", { type: "COMPLETE" })).toBe("success");
expect(jarvisReducer("consulting", { type: "UNSUPPORTED" })).toBe("unsupported");
expect(jarvisReducer("success", { type: "RESET" })).toBe("idle");
```

- [ ] **Step 2: Provar a falha**

Run: `npm test -- src/components/jarvis/jarvis-machine.test.ts`

Expected: FAIL porque os novos estados e eventos ainda não existem.

- [ ] **Step 3: Implementar o reducer explícito**

Definir `JarvisStep` com `unsupported` e `JarvisEvent` como união dos oito eventos. Usar um `switch` por evento, retornando o estado atual quando o evento não é válido para a etapa corrente. `RESET` sempre retorna `idle`.

- [ ] **Step 4: Provar as transições**

Run: `npm test -- src/components/jarvis/jarvis-machine.test.ts`

Expected: todos os testes da máquina passando.

- [ ] **Step 5: Checkpoint sem commit**

Revisar os dois arquivos da máquina. Não executar `git commit`.

### Task 3: Construir a experiência React aprovada

**Files:**
- Modify: `src/components/jarvis/JarvisDemo.tsx`

- [ ] **Step 1: Criar o shell dos controles**

Substituir botões de etapa por:

```tsx
<div className="jarvis-scenarios" aria-label="Perguntas demonstrativas">
  {Object.values(jarvisScenarios).map((scenario, index) => (
    <button
      key={scenario.id}
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
```

Adicionar formulário com label visualmente oculto, input limitado a 96 caracteres e botão Enviar. A submissão usa `routeJarvisQuestion()`. Resultado `null` dispara `UNSUPPORTED` e mostra o limite da demonstração.

- [ ] **Step 2: Coordenar a sequência cancelável**

Usar um `runIdRef` incrementado em cada pergunta e em reset. Cada `setTimeout` captura o identificador e confirma que ainda é o atual antes de disparar o próximo evento. O cleanup de `useEffect` cancela o timer. Não usar `setInterval` nem loop automático.

- [ ] **Step 3: Renderizar os estados Beautiful UI**

Renderizar na ordem semântica:

```tsx
{hasQuestion && <div className="jarvis-message-director">...</div>}
{isConsulting && <div className="jarvis-thinking" role="status">...</div>}
{showsTools && <ul className="jarvis-tools">...</ul>}
{showsAnswer && <article className="jarvis-answer">...</article>}
{step === "approval" && <article className="jarvis-approval">...</article>}
{step === "executing" && <ol className="jarvis-tasks">...</ol>}
{step === "success" && <div className="jarvis-success">...</div>}
```

O painel `.jarvis-backstage` existe apenas em `consulting` e contém três traces e duas linhas de código editorial. Fontes aparecem junto da resposta. O botão Autorizar ação dispara `AUTHORIZE`.

- [ ] **Step 4: Implementar movimento e reduced motion**

Animar somente `opacity` e `transform`. Tool chips entram com atraso por `animation-delay`. A resposta usa uma máscara CSS com cursor visual, mantendo o texto completo no DOM. Em reduced motion, remover máscara, cursor, deslocamento e atrasos. Os timers de progressão usam durações mínimas.

- [ ] **Step 5: Implementar comportamento mobile**

Depois de uma interação iniciada pelo usuário e apenas até 58rem, chamar `scrollIntoView({ block: "start", behavior })` no container da conversa. Não repetir o scroll nas etapas automáticas. Adicionar botão `Fazer outra pergunta` após `approval`, `unsupported` e `success`.

- [ ] **Step 6: Provar tipagem e testes unitários**

Run: `npm test && npm run check`

Expected: Vitest e Astro check sem falhas.

### Task 4: Ajustar a composição do case

**Files:**
- Modify: `src/components/jarvis/JarvisCaseStudy.astro`

- [ ] **Step 1: Dar largura editorial à experiência**

Manter hero visual e narrativa existentes. Alterar `.jarvis-story` para fluxo vertical: demo em largura integral, seguida de narrativa em duas colunas no desktop. Remover sticky, pois a nova demo é mais alta e interativa.

- [ ] **Step 2: Preservar leitura mobile**

Em até 58rem, manter narrativa em uma coluna e o carrossel horizontal de etapas já existente. Garantir que `.jarvis-demo-shell` não adicione padding duplo no iPhone.

- [ ] **Step 3: Provar build**

Run: `npm run build`

Expected: Astro check e build concluídos sem erros.

### Task 5: Reescrever os testes funcionais

**Files:**
- Modify: `tests/portfolio.spec.ts`
- Modify: `tests/accessibility.spec.ts`

- [ ] **Step 1: Cobrir cenário e aprovação**

No teste do case, escolher `Onde preciso agir hoje?`, aguardar `data-step="approval"`, verificar resposta e fontes, clicar `Autorizar ação`, aguardar `data-step="success"` e verificar confirmação.

- [ ] **Step 2: Cobrir roteamento e limite**

Enviar `Como estão nossas vendas?` e verificar conteúdo comercial. Reiniciar, enviar `Qual será o clima amanhã?` e verificar `data-step="unsupported"` e o texto de limite sem resposta empresarial simulada.

- [ ] **Step 3: Cobrir interrupção**

Iniciar operação e selecionar equipe antes do fim da consulta. Verificar que somente a pergunta e a resposta de equipe chegam à aprovação.

- [ ] **Step 4: Cobrir mobile e reduced motion**

No projeto iPhone, escolher um cenário e verificar que a conversa cruza o viewport sem prender o scroll. Com reduced motion, confirmar resposta visível, `animation-duration` igual a `0s` ou `0.001s` e aprovação acessível por teclado.

- [ ] **Step 5: Rodar a verificação focal**

Run: `npx playwright test tests/portfolio.spec.ts tests/accessibility.spec.ts --grep "Jarvis|Axe|reduced motion"`

Expected: todos os testes focais passando em desktop e iPhone.

### Task 6: Fechar os gates de entrega

**Files:**
- Modify: `docs/animation-opportunities.md` somente se a auditoria produzir uma decisão nova.

- [ ] **Step 1: Rodar suíte e build**

Run: `npm test && npm run build && npm run test:e2e`

Expected: zero falhas.

- [ ] **Step 2: Rodar auditoria visual e de slop**

Executar as skills `find-animation-opportunities` e `kill-ai-slop` sobre a implementação final. Corrigir apenas achados que violarem a especificação aprovada.

- [ ] **Step 3: Validar navegador real**

Subir `npm run preview -- --host 0.0.0.0`, validar desktop e iPhone, console, teclado, toque e reduced motion. Confirmar HTTP 200 a partir do Mac Mini pelo Tailscale.

- [ ] **Step 4: Checkpoint final sem commit**

Registrar arquivos alterados, comandos executados e resultados. Não executar commit, deploy ou mudança de domínio.
