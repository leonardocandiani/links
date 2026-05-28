// Gera src/data/github.json em build-time.
// Resiliente por design: se a rede ou a API falhar, preserva o snapshot ja commitado
// e o build nunca quebra. Com GITHUB_TOKEN no ambiente, puxa tambem o calendario de
// contribuicoes (GraphQL). Sem token, atualiza so os repos publicos (REST publica).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'leonardocandiani';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/github.json');

const headers = {
  'User-Agent': 'leonardocandiani-site',
  Accept: 'application/vnd.github+json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

function loadSnapshot() {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
}

async function fetchPublicRepos() {
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`,
    { headers }
  );
  if (!res.ok) throw new Error(`repos ${res.status}`);
  const repos = await res.json();
  return repos
    .filter((r) => !r.fork && !r.private)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
      pushedAt: r.pushed_at,
    }));
}

async function fetchContributions() {
  if (!TOKEN) return null;
  const query = `{
    user(login: "${USER}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { contributionCount date weekday } }
        }
        totalCommitContributions
        totalPullRequestContributions
        totalRepositoriesWithContributedCommits
      }
    }
  }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`graphql ${res.status}`);
  const json = await res.json();
  const c = json?.data?.user?.contributionsCollection;
  if (!c) throw new Error('graphql sem dados');
  const cal = c.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  return {
    totalContributions: cal.totalContributions,
    totalCommits: c.totalCommitContributions,
    totalPRs: c.totalPullRequestContributions,
    reposContributed: c.totalRepositoriesWithContributedCommits,
    activeDays: days.filter((d) => d.contributionCount > 0).length,
    busiestDay: Math.max(...days.map((d) => d.contributionCount)),
    weeks: cal.weeks.map((w) => w.contributionDays.map((d) => d.contributionCount)),
  };
}

async function main() {
  const snapshot = loadSnapshot();
  let repos = snapshot?.repos ?? [];
  let contributions = snapshot?.contributions ?? null;

  try {
    repos = await fetchPublicRepos();
    console.log(`[github] ${repos.length} repos publicos atualizados`);
  } catch (err) {
    console.warn(`[github] repos: usando snapshot (${err.message})`);
  }

  try {
    const fresh = await fetchContributions();
    if (fresh) {
      contributions = fresh;
      console.log(`[github] contribuicoes: ${fresh.totalContributions} no ano`);
    } else {
      console.log('[github] sem token: mantendo contribuicoes do snapshot');
    }
  } catch (err) {
    console.warn(`[github] contribuicoes: usando snapshot (${err.message})`);
  }

  const data = {
    user: USER,
    generatedAt: new Date().toISOString(),
    contributions,
    repos,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`[github] snapshot escrito em ${OUT}`);
}

main().catch((err) => {
  console.error('[github] erro fatal, build continua com snapshot existente:', err.message);
  process.exit(0);
});
