import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { GitHubRepository } from "../src/types/site";
import { normalizeRepositories } from "./github-data.mjs";
import { syncGitHubSnapshot } from "./sync-github.mjs";

const kritRepository = {
  name: "krit",
  html_url: "https://github.com/leonardocandiani/krit",
  description: "Screenshot nativo para macOS",
  language: "Swift",
  stargazers_count: 12,
  fork: false,
  archived: false,
  disabled: false,
  pushed_at: "2026-08-06T13:21:07Z"
};

const fallbackSnapshot = {
  syncedAt: "2026-08-01T10:00:00.000Z",
  repositories: [
    {
      name: "fallback",
      url: "https://github.com/leonardocandiani/fallback",
      description: "Snapshot anterior válido",
      language: null,
      stars: 0,
      pushedAt: "2026-08-01T09:00:00Z"
    }
  ]
};

const logger = {
  log: vi.fn(),
  warn: vi.fn()
};

let tempDirectories: string[] = [];

afterEach(async () => {
  vi.clearAllMocks();

  await Promise.all(tempDirectories.map((directory) => rm(directory, { recursive: true, force: true })));
  tempDirectories = [];
});

describe("normalizeRepositories", () => {
  it("removes non-public-project repositories and keeps recent project data", () => {
    const repositories = [
      { ...kritRepository },
      { ...kritRepository, name: "forked-project", fork: true },
      { ...kritRepository, name: "archived-project", archived: true },
      { ...kritRepository, name: "disabled-project", disabled: true },
      { ...kritRepository, name: "leonardocandiani" },
      { ...kritRepository, name: "empty-description", description: "" }
    ];

    expect(normalizeRepositories(repositories)).toEqual([
      {
        name: "krit",
        url: "https://github.com/leonardocandiani/krit",
        description: "Screenshot nativo para macOS",
        language: "Swift",
        stars: 12,
        pushedAt: "2026-08-06T13:21:07Z"
      }
    ]);
  });

  it("removes partial or malformed repository items", () => {
    const repositories = [
      { ...kritRepository },
      { ...kritRepository, name: "" },
      { ...kritRepository, html_url: "http://github.com/leonardocandiani/insecure" },
      { ...kritRepository, html_url: "https://github.com" },
      { ...kritRepository, html_url: "https://example.com/leonardocandiani/not-github" },
      { ...kritRepository, name: "other-owner", html_url: "https://github.com/other/other-owner" },
      { ...kritRepository, name: "with-subpath", html_url: "https://github.com/leonardocandiani/with-subpath/issues" },
      { ...kritRepository, name: "name-mismatch", html_url: "https://github.com/leonardocandiani/other-name" },
      { ...kritRepository, description: "   " },
      { ...kritRepository, language: 42 },
      { ...kritRepository, pushed_at: "not-a-date" },
      { ...kritRepository, stargazers_count: "12" },
      null,
      {}
    ];

    expect(normalizeRepositories(repositories)).toEqual([
      {
        name: "krit",
        url: "https://github.com/leonardocandiani/krit",
        description: "Screenshot nativo para macOS",
        language: "Swift",
        stars: 12,
        pushedAt: "2026-08-06T13:21:07Z"
      }
    ]);
  });

  it("throws when the GitHub payload is not an array", () => {
    expect(() => normalizeRepositories({ repositories: [kritRepository] })).toThrow(
      "GitHub payload precisa ser um array"
    );
  });

  it("orders repositories by most recent activity", () => {
    const repositories = [
      {
        ...kritRepository,
        name: "older",
        html_url: "https://github.com/leonardocandiani/older",
        pushed_at: "2026-08-01T09:00:00Z"
      },
      {
        ...kritRepository,
        name: "newer",
        html_url: "https://github.com/leonardocandiani/newer",
        pushed_at: "2026-08-08T09:00:00Z"
      },
      {
        ...kritRepository,
        name: "middle",
        html_url: "https://github.com/leonardocandiani/middle",
        pushed_at: "2026-08-06T09:00:00Z"
      }
    ];

    const normalized = normalizeRepositories(repositories) as GitHubRepository[];

    expect(normalized.map((repository) => repository.name)).toEqual([
      "newer",
      "middle",
      "older"
    ]);
  });

  it("keeps repository URLs coherent with simple repository names", () => {
    expect(
      normalizeRepositories([
        {
          ...kritRepository,
          name: "repo.with-dash_and_underscore",
          html_url: "https://github.com/leonardocandiani/repo.with-dash_and_underscore"
        }
      ])
    ).toEqual([
      {
        name: "repo.with-dash_and_underscore",
        url: "https://github.com/leonardocandiani/repo.with-dash_and_underscore",
        description: "Screenshot nativo para macOS",
        language: "Swift",
        stars: 12,
        pushedAt: "2026-08-06T13:21:07Z"
      }
    ]);
  });

  it("normaliza pontuação editorial nas descrições públicas", () => {
    expect(
      normalizeRepositories([
        {
          ...kritRepository,
          description: "Ferramentas conectadas \u2014 decisões rápidas"
        }
      ])
    ).toEqual([
      {
        name: "krit",
        url: "https://github.com/leonardocandiani/krit",
        description: "Ferramentas conectadas: decisões rápidas",
        language: "Swift",
        stars: 12,
        pushedAt: "2026-08-06T13:21:07Z"
      }
    ]);
  });
});

describe("syncGitHubSnapshot", () => {
  it("uses an existing snapshot on 403 without overwriting it", async () => {
    const snapshotPath = await createSnapshot(fallbackSnapshot);
    const beforeSync = await readFile(snapshotPath, "utf8");

    const result = await syncGitHubSnapshot({
      fetchImpl: async () => ({ ok: false, status: 403 }),
      targetPath: snapshotPath,
      logger
    });

    expect(result).toEqual({ snapshot: fallbackSnapshot, usedFallback: true });
    expect(await readFile(snapshotPath, "utf8")).toBe(beforeSync);
    expect(logger.warn).toHaveBeenCalledWith(
      "Falha ao sincronizar GitHub (GitHub API respondeu 403). Usando snapshot local com 1 repositórios."
    );
  });

  it("writes a valid snapshot on success", async () => {
    const snapshotPath = await createSnapshot(fallbackSnapshot);

    const result = await syncGitHubSnapshot({
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => [kritRepository]
      }),
      targetPath: snapshotPath,
      now: () => new Date("2026-08-11T12:00:00.000Z"),
      logger
    });

    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));

    expect(result.usedFallback).toBe(false);
    expect(snapshot).toEqual({
      syncedAt: "2026-08-11T12:00:00.000Z",
      repositories: [
        {
          name: "krit",
          url: "https://github.com/leonardocandiani/krit",
          description: "Screenshot nativo para macOS",
          language: "Swift",
          stars: 12,
          pushedAt: "2026-08-06T13:21:07Z"
        }
      ]
    });
  });

  it("preserves the fallback snapshot when the API payload is unexpected", async () => {
    const snapshotPath = await createSnapshot(fallbackSnapshot);
    const beforeSync = await readFile(snapshotPath, "utf8");

    const result = await syncGitHubSnapshot({
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ repositories: [kritRepository] })
      }),
      targetPath: snapshotPath,
      logger
    });

    expect(result).toEqual({ snapshot: fallbackSnapshot, usedFallback: true });
    expect(await readFile(snapshotPath, "utf8")).toBe(beforeSync);
  });

  it("throws both sync and fallback reasons when the fallback snapshot is unreadable", async () => {
    const directory = await mkdtemp(join(tmpdir(), "github-snapshot-test-"));
    const snapshotPath = join(directory, "github-snapshot.json");

    tempDirectories.push(directory);
    await writeFile(snapshotPath, "not-json\n");

    await expect(
      syncGitHubSnapshot({
        fetchImpl: async () => ({ ok: false, status: 403 }),
        targetPath: snapshotPath,
        logger
      })
    ).rejects.toThrow(/GitHub API respondeu 403.*snapshot local é inválido.*Unexpected token/s);
  });

  it("rejects fallback snapshots with repositories outside the canonical GitHub path", async () => {
    const snapshots = [
      {
        ...fallbackSnapshot,
        repositories: [{ ...fallbackSnapshot.repositories[0], url: "https://github.com/other/fallback" }]
      },
      {
        ...fallbackSnapshot,
        repositories: [{ ...fallbackSnapshot.repositories[0], url: "https://github.com/leonardocandiani/fallback/issues" }]
      },
      {
        ...fallbackSnapshot,
        repositories: [{ ...fallbackSnapshot.repositories[0], url: "https://github.com/leonardocandiani/other-name" }]
      }
    ];

    for (const snapshot of snapshots) {
      const snapshotPath = await createSnapshot(snapshot);

      await expect(
        syncGitHubSnapshot({
          fetchImpl: async () => ({ ok: false, status: 403 }),
          targetPath: snapshotPath,
          logger
        })
      ).rejects.toThrow(/GitHub API respondeu 403.*snapshot local é inválido.*snapshot contém repositório inválido/s);
    }
  });
});

async function createSnapshot(snapshot: typeof fallbackSnapshot) {
  const directory = await mkdtemp(join(tmpdir(), "github-snapshot-test-"));
  const snapshotPath = join(directory, "github-snapshot.json");

  tempDirectories.push(directory);
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  return snapshotPath;
}
