export function normalizeRepositories(repositories) {
  if (!Array.isArray(repositories)) {
    throw new Error("GitHub payload precisa ser um array de repositórios.");
  }

  return repositories
    .filter(isRepositoryCandidate)
    .map((repository) => ({
      name: repository.name,
      url: repository.html_url,
      description: normalizeDescription(repository.description),
      language: repository.language,
      stars: repository.stargazers_count,
      pushedAt: repository.pushed_at,
      createdAt: repository.created_at
    }))
    // mais novo primeiro: a vitrine mostra o que foi publicado por último
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

// Uma página inteira de HTML do GitHub vira { end, days }. Se qualquer conferência falhar o
// resultado é descartado: HTML que mudou de formato não pode virar um gráfico errado no ar.
const MIN_CALENDAR_DAYS = 300;

export function normalizeContributions(html) {
  if (typeof html !== "string" || html.length === 0) {
    throw new Error("Página de contribuições vazia.");
  }

  const tips = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const target = /\bfor="([^"]+)"/.exec(match[1])?.[1];
    if (target) tips.set(target, match[2].trim());
  }

  const days = [];
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)) {
    const id = /\bid="([^"]+)"/.exec(match[0])?.[1];
    days.push({ date: match[1], count: parseTipCount(id ? tips.get(id) : undefined) });
  }

  if (days.length < MIN_CALENDAR_DAYS) {
    throw new Error(`Calendário de contribuições com ${days.length} dias; o mínimo esperado é ${MIN_CALENDAR_DAYS}.`);
  }

  days.sort((left, right) => left.date.localeCompare(right.date));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const declared = /([\d,.]+)\s+contributions?\s+in\s+the\s+last\s+year/i.exec(html)?.[1];

  if (declared !== undefined && Number(declared.replace(/[,.]/g, "")) !== total) {
    throw new Error(`Total declarado (${declared}) não bate com a soma dos dias (${total}).`);
  }

  return { end: days[days.length - 1].date, days: days.filter((day) => day.count > 0) };
}

// "309 contributions on October 9th." | "1 contribution on ..." | "No contributions on ..."
function parseTipCount(text) {
  if (typeof text !== "string") {
    throw new Error("Dia do calendário sem tooltip.");
  }

  if (/^No contributions\b/i.test(text)) {
    return 0;
  }

  const count = /^(\d[\d,]*)\s+contributions?\b/i.exec(text)?.[1];

  if (count === undefined) {
    throw new Error(`Tooltip do calendário em formato desconhecido: ${text.slice(0, 60)}`);
  }

  return Number(count.replace(/,/g, ""));
}

function isRepositoryCandidate(repository) {
  if (!repository || typeof repository !== "object") {
    return false;
  }

  if (repository.fork || repository.archived || repository.disabled) {
    return false;
  }

  if (repository.name === "leonardocandiani") {
    return false;
  }

  if (
    !isNonEmptyString(repository.name) ||
    !isOwnedRepositoryUrl(repository.html_url, repository.name) ||
    !isNonEmptyString(repository.pushed_at) ||
    Number.isNaN(Date.parse(repository.pushed_at)) ||
    !isNonEmptyString(repository.created_at) ||
    Number.isNaN(Date.parse(repository.created_at)) ||
    typeof repository.description !== "string" ||
    repository.description.trim().length === 0 ||
    typeof repository.stargazers_count !== "number" ||
    !Number.isFinite(repository.stargazers_count) ||
    (repository.language !== null && typeof repository.language !== "string")
  ) {
    return false;
  }

  return true;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isOwnedRepositoryUrl(value, repositoryName) {
  if (!isNonEmptyString(value) || !isSimpleRepositoryName(repositoryName)) {
    return false;
  }

  try {
    const url = new URL(value);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      pathSegments.length === 2 &&
      pathSegments[0] === "leonardocandiani" &&
      pathSegments[1] === repositoryName
    );
  } catch {
    return false;
  }
}

function isSimpleRepositoryName(value) {
  return isNonEmptyString(value) && /^[A-Za-z0-9._-]+$/.test(value);
}

function normalizeDescription(value) {
  return value.trim().replace(/\s*[\u2013\u2014]+\s*/gu, ": ");
}
