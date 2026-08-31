import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("GitHubProjects", () => {
  it("formats repository dates with the São Paulo timezone explicitly", async () => {
    const source = await readFile("src/components/GitHubProjects.astro", "utf8");

    expect(source).toContain('timeZone: "America/Sao_Paulo"');
  });
});
