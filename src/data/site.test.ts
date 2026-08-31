import { describe, expect, it } from "vitest";

import { siteContent } from "./site";
import { siteContentEn } from "./site.en";

describe("siteContent", () => {
  it("keeps Leonardo as the portfolio center and Jarvis as the featured case", () => {
    expect(siteContent.hero.name).toBe("Leonardo Candiani");
    expect(siteContent.hero.title).not.toContain("Minino Jarvis");
    expect(siteContent.hero.title).toBe("Construo a inteligência que faz empresas agirem.");
    expect(siteContent.jarvis.title).toBe("Pergunte à sua empresa. Ela responde no WhatsApp.");
  });

  it("uses creativity as the narrative thread of the portfolio", () => {
    expect(siteContent.culture.title).toBe("O que nos limita é a nossa criatividade.");
    expect(siteContent.culture.description).toContain("repertório aplicado");
    expect(siteContent.culture.echoes.map((echo) => echo.label)).toEqual([
      "Repertório",
      "Minino Jarvis",
      "Educação"
    ]);
    expect(siteContent.culture.echoes.map((echo) => echo.title)).toEqual([
      "Mais referências, mais caminhos possíveis.",
      "Informação vira capacidade empresarial.",
      "O repertório deixa de ficar concentrado."
    ]);
  });

  it("publishes the in-company education section", () => {
    expect(siteContent.navigation.slice(2, 5)).toEqual([
      { label: "Jarvis", href: "#jarvis" },
      { label: "Educação", href: "#educacao" },
      { label: "Open source", href: "#github" }
    ]);
    expect(siteContent.education).toEqual({
      eyebrow: "Educação aplicada para empresas",
      title: "Elevar o nível das pessoas muda o limite da empresa.",
      description:
        "Desenho e conduzo treinamentos in-company para transformar IA em capacidade prática: mais repertório, autonomia e velocidade para resolver problemas reais da operação.",
      leverage: [
        {
          metric: "7×",
          title: "Aprender mais rápido",
          description: "Ciclos curtos de prática, feedback e IA comprimem o caminho entre não saber e conseguir aplicar."
        },
        {
          metric: "1 → 7",
          title: "Capacidade de 7 pessoas",
          description:
            "Agentes, automações e sistemas ajudam cada colaborador a operar com a alavancagem de uma pequena equipe, sem multiplicar horas."
        }
      ],
      method: [
        {
          number: "01",
          title: "Diagnóstico da operação",
          description: "O treinamento começa nos gargalos, ferramentas e decisões que a equipe já enfrenta."
        },
        {
          number: "02",
          title: "Prática aplicada",
          description: "Cada conceito vira exercício, workflow e uso real de IA dentro do contexto da empresa."
        },
        {
          number: "03",
          title: "Capacidade que permanece",
          description: "Playbooks e padrões deixam o conhecimento utilizável depois do encontro."
        }
      ],
      note:
        "7× é uma referência de desenho e alavancagem do programa. O resultado depende do contexto, da adesão e da execução de cada equipe.",
      ctaLabel: "Levar o treinamento para minha empresa"
    });
  });

  it("publishes a broad repertoire without turning it into a card dump", () => {
    expect(siteContent.repertoire.areas).toHaveLength(5);
    expect(siteContent.repertoire.areas.map((area) => area.id)).toEqual([
      "operacao",
      "agentes",
      "produto",
      "infra",
      "educacao"
    ]);
    expect(siteContent.repertoire.areas.every((area) => area.items.length === 4)).toBe(true);
  });

  it("uses secure external links", () => {
    const publicLinks = siteContent.links.map((link) => link.href);

    expect(siteContent.links).toHaveLength(4);

    for (const href of publicLinks) {
      expect(href).toMatch(/^https:\/\//);
    }
  });

  it("keeps both locales structurally aligned", () => {
    expect(siteContentEn.navigation.map((item) => item.href)).toEqual(siteContent.navigation.map((item) => item.href));
    expect(siteContentEn.repertoire.areas.map((area) => area.id)).toEqual(siteContent.repertoire.areas.map((area) => area.id));
    expect(siteContentEn.jarvis.steps.map((step) => step.id)).toEqual(siteContent.jarvis.steps.map((step) => step.id));
    expect(siteContentEn.hero.limitWord).toBe("act.");
    expect(siteContentEn.culture.limitWord).toBe("creativity.");
  });
});
