import type { GitHubRepository } from "../types/site";

export type JourneyRepository = { name: string; url: string; language: string | null };

export type JourneyStop = {
  /** Mês no formato AAAA-MM. */
  key: string;
  label: string;
  count: number;
  repositories: JourneyRepository[];
};

export type RepositoryJourney = {
  total: number;
  /** Meses corridos entre o primeiro e o último lançamento, contando os dois. */
  months: number;
  stops: JourneyStop[];
};

type Options = {
  locale: string;
  /** Só entram meses até esta distância do repositório mais novo: um projeto antigo e isolado não puxa um vão para a linha. */
  windowMonths?: number;
  maxStops?: number;
};

const monthIndex = (key: string) => Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;

const monthKey = (createdAt: string) => new Date(createdAt).toISOString().slice(0, 7);

/**
 * Agrupa os repositórios por mês de criação, do mais antigo para o mais novo, e fica só
 * com os últimos `maxStops` meses que têm lançamento dentro da janela.
 */
export function buildRepositoryJourney(repositories: GitHubRepository[], { locale, windowMonths = 12, maxStops = 7 }: Options): RepositoryJourney {
  const byMonth = new Map<string, JourneyRepository[]>();

  for (const repository of [...repositories].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))) {
    const key = monthKey(repository.createdAt);

    byMonth.set(key, [...(byMonth.get(key) ?? []), { name: repository.name, url: repository.url, language: repository.language }]);
  }

  const keys = [...byMonth.keys()].sort();
  const newest = keys.at(-1);

  if (!newest) {
    return { total: 0, months: 0, stops: [] };
  }

  const formatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const inWindow = keys.filter((key) => monthIndex(newest) - monthIndex(key) < windowMonths).slice(-maxStops);
  const stops = inWindow.map((key) => {
    const repos = byMonth.get(key)!;

    return { key, label: formatter.format(new Date(`${key}-01T00:00:00Z`)), count: repos.length, repositories: repos };
  });

  return {
    total: stops.reduce((sum, stop) => sum + stop.count, 0),
    months: monthIndex(stops.at(-1)!.key) - monthIndex(stops[0].key) + 1,
    stops
  };
}
