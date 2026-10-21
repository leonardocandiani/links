import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { normalizeContributions, normalizeRepositories } from "./github-data.mjs";

const endpoint = "https://api.github.com/users/leonardocandiani/repos?per_page=100&sort=pushed";
// Página pública do calendário de contribuições. A API REST não tem esse dado e o GraphQL pede token;
// a página devolve o mesmo total do perfil, sem segredo nenhum no build.
const contributionsEndpoint = "https://github.com/users/leonardocandiani/contributions";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = resolve(projectRoot, "src/data/github-snapshot.json");

/**
 * @typedef {{ ok: boolean, status: number, json?: () => Promise<unknown>, text?: () => Promise<string> }} GitHubResponse
 * @typedef {{
 *   fetchImpl?: (url: string, init: { headers: Record<string, string> }) => Promise<GitHubResponse>,
 *   targetPath?: string,
 *   now?: () => Date,
 *   logger?: Pick<Console, "log" | "warn">
 * }} SyncGitHubOptions
 */

/**
 * @param {SyncGitHubOptions} [options]
 */
export async function syncGitHubSnapshot({
  fetchImpl = globalThis.fetch,
  targetPath = snapshotPath,
  now = () => new Date(),
  logger = console
} = {}) {
  try {
    if (typeof fetchImpl !== "function") {
      throw new Error("fetch indisponível.");
    }

    const response = await fetchImpl(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "leonardo-candiani-site"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API respondeu ${response.status}`);
    }

    const repositories = normalizeRepositories(await response.json());
    const contributions = await syncContributions({ fetchImpl, targetPath, logger });
    const snapshot = await writeSnapshot(targetPath, {
      syncedAt: now().toISOString(),
      repositories,
      ...(contributions ? { contributions } : {})
    });

    logger.log(`GitHub snapshot sincronizado: ${repositories.length} repositórios.`);

    return { snapshot, usedFallback: false };
  } catch (syncError) {
    try {
      const snapshot = await readSnapshot(targetPath);
      const reason = formatError(syncError);

      logger.warn(
        `Falha ao sincronizar GitHub (${reason}). Usando snapshot local com ${snapshot.repositories.length} repositórios.`
      );

      return { snapshot, usedFallback: true };
    } catch (fallbackError) {
      throw new Error(
        `Falha ao sincronizar GitHub (${formatError(syncError)}) e o snapshot local é inválido (${formatError(
          fallbackError
        )}).`
      );
    }
  }
}

// O calendário é enfeite da vitrine: se falhar, mantém o último válido em vez de derrubar o build.
async function syncContributions({ fetchImpl, targetPath, logger }) {
  try {
    const response = await fetchImpl(contributionsEndpoint, {
      headers: { Accept: "text/html", "User-Agent": "leonardo-candiani-site" }
    });

    if (!response.ok) {
      throw new Error(`GitHub respondeu ${response.status}`);
    }

    const contributions = normalizeContributions(await response.text());
    validateContributions(contributions);

    return contributions;
  } catch (contributionsError) {
    const previous = await readSnapshot(targetPath).then(
      (snapshot) => snapshot.contributions,
      () => undefined
    );

    logger.warn(
      `Falha ao sincronizar contribuições (${formatError(contributionsError)}). ${
        previous ? "Mantendo o calendário do snapshot anterior." : "Sem calendário no snapshot."
      }`
    );

    return previous;
  }
}

async function readSnapshot(targetPath) {
  const snapshot = JSON.parse(await readFile(targetPath, "utf8"));
  validateSnapshot(snapshot);
  return snapshot;
}

async function writeSnapshot(targetPath, snapshot) {
  validateSnapshot(snapshot);

  const targetDirectory = dirname(targetPath);
  const tempPath = resolve(targetDirectory, `.${basename(targetPath)}.${process.pid}.${randomUUID()}.tmp`);
  const payload = `${JSON.stringify(snapshot, null, 2)}\n`;

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(tempPath, payload);
  await rename(tempPath, targetPath);

  return snapshot;
}

function validateSnapshot(snapshot) {
  if (
    !snapshot ||
    typeof snapshot !== "object" ||
    !isParseableDate(snapshot.syncedAt) ||
    !Array.isArray(snapshot.repositories)
  ) {
    throw new Error("snapshot não tem o formato esperado.");
  }

  for (const repository of snapshot.repositories) {
    if (!isSnapshotRepository(repository)) {
      throw new Error("snapshot contém repositório inválido.");
    }
  }

  if (snapshot.contributions !== undefined) {
    validateContributions(snapshot.contributions);
  }
}

function validateContributions(contributions) {
  if (
    !contributions ||
    typeof contributions !== "object" ||
    !isCalendarDate(contributions.end) ||
    !Array.isArray(contributions.days) ||
    !contributions.days.every(
      (day) => day && isCalendarDate(day.date) && Number.isInteger(day.count) && day.count > 0 && day.date <= contributions.end
    )
  ) {
    throw new Error("snapshot tem calendário de contribuições inválido.");
  }
}

function isCalendarDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isSnapshotRepository(repository) {
  return (
    repository &&
    typeof repository === "object" &&
    isNonEmptyString(repository.name) &&
    isOwnedRepositoryUrl(repository.url, repository.name) &&
    typeof repository.description === "string" &&
    repository.description.trim().length > 0 &&
    !/[\u2013\u2014]/u.test(repository.description) &&
    (repository.language === null || typeof repository.language === "string") &&
    typeof repository.stars === "number" &&
    Number.isFinite(repository.stars) &&
    isParseableDate(repository.pushedAt)
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isParseableDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
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

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";

if (import.meta.url === invokedPath) {
  syncGitHubSnapshot().catch((error) => {
    console.error(formatError(error));
    process.exitCode = 1;
  });
}
