import { describe, expect, it } from "vitest";

import type { GitHubRepository } from "../types/site";
import { buildRepositoryJourney } from "./github-journey";

const repo = (name: string, createdAt: string, language: string | null = "TypeScript"): GitHubRepository => ({
  name,
  url: `https://github.com/leonardocandiani/${name}`,
  description: `${name} descrição`,
  language,
  stars: 0,
  pushedAt: createdAt,
  createdAt
});

describe("buildRepositoryJourney", () => {
  const repositories = [
    repo("leis", "2026-10-19T17:53:10Z"),
    repo("talk-to-reel", "2026-10-09T21:00:23Z", "Python"),
    repo("keyfence", "2026-09-22T10:00:00Z"),
    repo("krit", "2026-05-30T10:00:00Z", "Swift"),
    repo("links", "2024-12-31T10:00:00Z")
  ];

  it("agrupa por mês em ordem cronológica e conta tudo", () => {
    const journey = buildRepositoryJourney(repositories, { locale: "pt-BR" });

    expect(journey.stops.map((stop) => stop.key)).toEqual(["2026-05", "2026-09", "2026-10"]);
    expect(journey.stops.map((stop) => stop.count)).toEqual([1, 1, 2]);
    expect(journey.stops[2].repositories.map((item) => item.name)).toEqual(["talk-to-reel", "leis"]);
    expect(journey.total).toBe(4);
  });

  it("deixa de fora o projeto antigo e isolado fora da janela", () => {
    const journey = buildRepositoryJourney(repositories, { locale: "pt-BR" });

    expect(journey.stops.some((stop) => stop.key === "2024-12")).toBe(false);
  });

  it("conta os meses corridos, inclusive os vazios no meio", () => {
    expect(buildRepositoryJourney(repositories, { locale: "pt-BR" }).months).toBe(6);
  });

  it("formata o mês no idioma pedido", () => {
    expect(buildRepositoryJourney(repositories, { locale: "pt-BR" }).stops[0].label).toBe("maio de 2026");
    expect(buildRepositoryJourney(repositories, { locale: "en-US" }).stops[0].label).toBe("May 2026");
  });

  it("limita a quantidade de paradas aos meses mais recentes", () => {
    const journey = buildRepositoryJourney(repositories, { locale: "pt-BR", maxStops: 2 });

    expect(journey.stops.map((stop) => stop.key)).toEqual(["2026-09", "2026-10"]);
    expect(journey.months).toBe(2);
  });

  it("não quebra sem repositórios", () => {
    expect(buildRepositoryJourney([], { locale: "pt-BR" })).toEqual({ total: 0, months: 0, stops: [] });
  });

  it("guarda link e linguagem de cada repositório", () => {
    const stop = buildRepositoryJourney(repositories, { locale: "pt-BR" }).stops[0];

    expect(stop.repositories[0]).toEqual({ name: "krit", url: "https://github.com/leonardocandiani/krit", language: "Swift" });
  });
});
