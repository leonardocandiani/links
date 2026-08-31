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
      pushedAt: repository.pushed_at
    }))
    .sort((left, right) => Date.parse(right.pushedAt) - Date.parse(left.pushedAt));
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
