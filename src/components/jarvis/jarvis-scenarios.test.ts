import { describe, expect, it } from "vitest";

import { jarvisScenarios, routeJarvisQuestion } from "./jarvis-scenarios";
import { routeJarvisQuestion as routeLocalizedJarvisQuestion } from "./jarvis-i18n";

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

  it("roteia uma pergunta comercial", () => {
    expect(routeJarvisQuestion("Como estão nossas vendas?")?.id).toBe("sales");
  });

  it("roteia uma pergunta sobre equipe", () => {
    expect(routeJarvisQuestion("Qual equipe está sobrecarregada?")?.id).toBe("team");
  });

  it("roteia uma pergunta sobre operação", () => {
    expect(routeJarvisQuestion("Onde devo agir na operação hoje?")?.id).toBe("operation");
  });

  it("não inventa resposta para pergunta fora do escopo", () => {
    expect(routeJarvisQuestion("Qual será o clima amanhã?")).toBeNull();
  });

  it("routes natural English questions", () => {
    expect(routeLocalizedJarvisQuestion("How are sales this week?", "en")?.id).toBe("sales");
    expect(routeLocalizedJarvisQuestion("Which team is overloaded?", "en")?.id).toBe("team");
    expect(routeLocalizedJarvisQuestion("Where should I act in operations today?", "en")?.id).toBe("operation");
    expect(routeLocalizedJarvisQuestion("What will the weather be tomorrow?", "en")).toBeNull();
  });
});
