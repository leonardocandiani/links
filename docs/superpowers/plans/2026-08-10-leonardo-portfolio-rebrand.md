# Leonardo Candiani Portfolio Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Construir localmente um portfólio editorial de Leonardo Candiani, com o Minino Jarvis como case principal, GitHub open source atualizado no build e acesso móvel real pelo Tailscale.

**Architecture:** Astro gera HTML estático e usa React apenas na demonstração interativa do Minino Jarvis e na navegação mobile. Conteúdo e snapshot do GitHub ficam locais e tipados; um script de build atualiza dados públicos com fallback para o último snapshot válido. CSS próprio implementa o sistema visual extraído da fotografia, sem biblioteca de componentes.

**Tech Stack:** Astro 7.2.0, React 19.2.8, TypeScript 6.0.3, Vitest 4.1.10, Testing Library 16.3.2, Playwright 1.62.1, axe-core 4.12.1.

---

## Regra de execução

Os checkpoints de commit estão documentados porque representam cortes seguros de trabalho. Nenhum comando de commit pode ser executado sem autorização explícita de Leonardo. Durante a execução, marcar o passo como aguardando autorização e continuar com os arquivos não commitados.

## Mapa de arquivos

### Configuração

- **package.json**: scripts, dependências e requisito de Node.
- **astro.config.mjs**: integração React, site canonical e configuração de build.
- **tsconfig.json**: TypeScript estrito.
- **vitest.config.ts**: testes unitários em jsdom.
- **playwright.config.ts**: smoke tests desktop e iPhone.
- **.gitignore**: dependências, builds, relatórios e arquivos temporários.
- **public/robots.txt**: orientação de indexação e sitemap.

### Conteúdo e dados

- **src/types/site.ts**: contratos de conteúdo, projeto e GitHub.
- **src/data/site.ts**: textos, navegação, empresas, projetos e links públicos.
- **src/data/github-snapshot.json**: último snapshot válido de repositórios.
- **scripts/github-data.mjs**: funções puras de normalização, filtro e ordenação.
- **scripts/sync-github.mjs**: chamada à API e fallback local.
- **scripts/github-data.test.ts**: testes do pipeline de GitHub.

### Página e apresentação

- **src/pages/index.astro**: composição da home.
- **src/layouts/BaseLayout.astro**: head, SEO, JSON-LD e shell.
- **src/components/SiteHeader.astro**: navegação desktop e montagem da ilha mobile.
- **src/components/MobileNav.tsx**: sheet acessível no mobile.
- **src/components/HeroPortrait.astro**: hero pessoal.
- **src/components/VisionSection.astro**: tese editorial.
- **src/components/FeaturedWork.astro**: projetos selecionados.
- **src/components/jarvis/JarvisCaseStudy.astro**: narrativa completa do case.
- **src/components/jarvis/JarvisDemo.tsx**: demonstração interativa.
- **src/components/jarvis/jarvis-machine.ts**: máquina de estados determinística.
- **src/components/jarvis/jarvis-machine.test.ts**: testes de transição.
- **src/components/GitHubProjects.astro**: destaques e projetos recentes.
- **src/components/PublicPresence.astro**: YouTube, Instagram e GitHub.
- **src/components/ContactFooter.astro**: CTA e rodapé.

### Estilos e assets

- **src/styles/tokens.css**: cor, tipografia, espaço, raio e motion tokens.
- **src/styles/global.css**: reset, layout, acessibilidade e componentes compartilhados.
- **src/styles/motion.css**: entradas, press feedback e reduced motion.
- **public/images/leonardo-portrait-original.jpg**: fotografia original sem alteração.
- **public/images/leonardo-portrait-wide.webp**: expansão horizontal gerada com identidade preservada.
- **public/favicon.svg**: monograma LC em SVG local.

### Verificação

- **tests/portfolio.spec.ts**: fluxo, navegação, conteúdo, mobile e reduced motion.
- **tests/accessibility.spec.ts**: axe e landmarks.
- **docs/animation-opportunities.md**: relatório read-only produzido pela auditoria de motion.

---

### Task 1: Inicializar o projeto e os gates básicos

**Files:**
- Create: **package.json**
- Create: **astro.config.mjs**
- Create: **tsconfig.json**
- Create: **vitest.config.ts**
- Create: **playwright.config.ts**
- Create: **.gitignore**
- Create: **src/env.d.ts**

- [ ] **Step 1: Inicializar Git sem criar commit**

Run:

~~~bash
git init -b feature/portfolio-rebrand
git config user.email "llima.leo.lima@gmail.com"
git config user.name "Leonardo Candiani"
~~~

Expected: repositório local em branch feature/portfolio-rebrand, sem commit. Como o projeto não possui commit inicial, este diretório novo funciona como workspace isolado até que uma worktree real seja possível.

- [ ] **Step 2: Criar o manifesto de dependências**

Create **package.json**:

~~~json
{
  "name": "leonardo-candiani-site",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev --host 0.0.0.0",
    "check": "astro check",
    "build": "astro check && astro build",
    "preview": "astro preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@astrojs/react": "6.0.2",
    "@astrojs/sitemap": "3.7.3",
    "astro": "7.2.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "sharp": "0.35.3"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.10",
    "@axe-core/playwright": "4.12.1",
    "@playwright/test": "1.62.1",
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.2",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "jsdom": "28.1.0",
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  }
}
~~~

- [ ] **Step 3: Criar as configurações**

Create **astro.config.mjs**:

~~~javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://leonardocandiani.com.br",
  integrations: [react(), sitemap()],
  output: "static",
  build: {
    format: "directory"
  }
});
~~~

Create **tsconfig.json**:

~~~json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
~~~

Create **vitest.config.ts**:

~~~typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"]
  }
});
~~~

Create **playwright.config.ts**:

~~~typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4322",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "ASTRO_DEV_BACKGROUND=0 npx astro dev --force --host 127.0.0.1 --port 4322",
    url: "http://127.0.0.1:4322/@vite/client",
    reuseExistingServer: false
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Safari"] } },
    { name: "iphone", use: { ...devices["iPhone 15 Pro"] } }
  ]
});
~~~

Create **tests/setup.ts**:

~~~typescript
import "@testing-library/jest-dom/vitest";
~~~

Create **src/env.d.ts**:

~~~typescript
/// <reference types="astro/client" />
~~~

Create **.gitignore**:

~~~gitignore
node_modules/
dist/
.astro/
playwright-report/
test-results/
coverage/
.DS_Store
.superpowers/
~~~

- [ ] **Step 4: Instalar e provar o baseline**

Run:

~~~bash
npm install
npx playwright install webkit
npm test
~~~

Expected: Vitest encerra com zero falhas; a ausência inicial de arquivos de teste é aceita.

- [ ] **Step 5: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts .gitignore src/env.d.ts tests/setup.ts
git commit -m "chore: inicializa o portfólio"
~~~

---

### Task 2: Definir contratos, conteúdo e tokens visuais

**Files:**
- Create: **src/types/site.ts**
- Create: **src/data/site.ts**
- Create: **src/data/site.test.ts**
- Create: **src/styles/tokens.css**
- Create: **src/styles/global.css**
- Create: **src/styles/motion.css**

- [ ] **Step 1: Escrever o teste de conteúdo**

Create **src/data/site.test.ts**:

~~~typescript
import { describe, expect, it } from "vitest";
import { siteContent } from "./site";

describe("siteContent", () => {
  it("mantém Leonardo como centro e Jarvis como case", () => {
    expect(siteContent.hero.name).toBe("Leonardo Candiani");
    expect(siteContent.hero.title).not.toContain("Minino Jarvis");
    expect(siteContent.jarvis.title).toBe("Pergunte à sua empresa. Ela responde no WhatsApp.");
  });

  it("mantém uma curadoria de quatro a seis projetos", () => {
    expect(siteContent.featuredWork.length).toBeGreaterThanOrEqual(4);
    expect(siteContent.featuredWork.length).toBeLessThanOrEqual(6);
  });

  it("usa apenas links públicos seguros", () => {
    for (const link of siteContent.links) {
      expect(link.href).toMatch(/^https:\/\//);
    }
  });
});
~~~

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run:

~~~bash
npm test -- src/data/site.test.ts
~~~

Expected: FAIL porque **src/data/site.ts** ainda não existe.

- [ ] **Step 3: Criar tipos e conteúdo**

Create **src/types/site.ts**:

~~~typescript
export type PublicLink = {
  label: string;
  href: string;
};

export type FeaturedWork = {
  slug: string;
  name: string;
  category: string;
  description: string;
  href?: string;
  tone: "sky" | "paper" | "ink" | "cotton";
};

export type JarvisStep = {
  id: "question" | "perception" | "context" | "action";
  label: string;
  title: string;
  description: string;
};

export type SiteContent = {
  navigation: Array<{ label: string; href: string }>;
  hero: {
    name: string;
    eyebrow: string;
    title: string;
    description: string;
  };
  vision: {
    title: string;
    body: string;
  };
  featuredWork: FeaturedWork[];
  jarvis: {
    eyebrow: string;
    title: string;
    description: string;
    steps: JarvisStep[];
  };
  links: PublicLink[];
};
~~~

Create **src/data/site.ts**:

~~~typescript
import type { SiteContent } from "../types/site";

export const siteContent: SiteContent = {
  navigation: [
    { label: "Visão", href: "#visao" },
    { label: "Projetos", href: "#projetos" },
    { label: "Jarvis", href: "#jarvis" },
    { label: "GitHub", href: "#github" },
    { label: "Contato", href: "#contato" }
  ],
  hero: {
    name: "Leonardo Candiani",
    eyebrow: "Fundador e operador de IA",
    title: "Construo sistemas de IA que ajudam empresas a perceber, decidir e agir melhor.",
    description: "Transformo visão empresarial em produtos, automações e operações que funcionam no mundo real."
  },
  vision: {
    title: "IA deve ampliar a capacidade de quem dirige a empresa.",
    body: "Meu trabalho é reduzir a distância entre uma pergunta importante e a ação que muda o negócio. Construo sistemas para levar contexto, decisão e execução até onde as pessoas já trabalham."
  },
  featuredWork: [
    {
      slug: "sixquasar",
      name: "SixQuasar",
      category: "Empresa",
      description: "Tecnologia aplicada a operações, produtos digitais e agentes de IA.",
      tone: "ink"
    },
    {
      slug: "minino-jarvis",
      name: "Minino Jarvis",
      category: "Case principal",
      description: "Informação e capacidade de ação da empresa dentro do WhatsApp.",
      tone: "sky"
    },
    {
      slug: "krit",
      name: "KRIT",
      category: "Open source",
      description: "Captura, gravação e anotação nativas para macOS.",
      href: "https://github.com/leonardocandiani/krit",
      tone: "paper"
    },
    {
      slug: "keepwright",
      name: "keepwright",
      category: "Open source",
      description: "Arquitetura de qualidade e automação de engenharia para projetos reais.",
      href: "https://github.com/leonardocandiani/keepwright",
      tone: "cotton"
    },
    {
      slug: "scratchmate",
      name: "scratchmate",
      category: "Open source",
      description: "Scratchpad programável e efêmero para desenvolvedores no macOS.",
      href: "https://github.com/leonardocandiani/scratchmate",
      tone: "paper"
    },
    {
      slug: "claude-optimizer",
      name: "claude-optimizer",
      category: "Open source",
      description: "Auditoria de contexto orientada a horas de trabalho recuperadas.",
      href: "https://github.com/leonardocandiani/claude-optimizer",
      tone: "cotton"
    }
  ],
  jarvis: {
    eyebrow: "Case de sucesso",
    title: "Pergunte à sua empresa. Ela responde no WhatsApp.",
    description: "O Minino Jarvis coloca informações conectadas da operação na palma de diretores e gestores, para investigar, decidir e acelerar novas capacidades sem sair da conversa.",
    steps: [
      {
        id: "question",
        label: "Pergunta",
        title: "O gestor pergunta como fala.",
        description: "Sem dashboard novo, consulta em linguagem natural dentro do WhatsApp."
      },
      {
        id: "perception",
        label: "Percepção",
        title: "O Jarvis consulta a empresa.",
        description: "Fontes e sistemas conectados entregam os sinais necessários."
      },
      {
        id: "context",
        label: "Contexto",
        title: "Harnesses próprios organizam a resposta.",
        description: "Ferramentas, memória e regras transformam dado disperso em entendimento."
      },
      {
        id: "action",
        label: "Ação",
        title: "A decisão pode virar execução.",
        description: "O gestor recebe contexto, riscos, próximos passos e ações autorizadas."
      }
    ]
  },
  links: [
    { label: "GitHub", href: "https://github.com/leonardocandiani" },
    { label: "YouTube", href: "https://youtube.com/@oleonardocandiani" },
    { label: "Instagram", href: "https://instagram.com/leonardocandiani" },
    { label: "WhatsApp", href: "https://wa.me/5544998893474" }
  ]
};
~~~

- [ ] **Step 4: Criar tokens e estilos globais**

Create **src/styles/tokens.css**:

~~~css
:root {
  color-scheme: light;
  --color-sky: #708ca1;
  --color-sky-light: #dfe9ee;
  --color-cotton: #f2eee7;
  --color-paper: #fbfaf7;
  --color-ink: #171513;
  --color-graphite: #45332a;
  --color-terracotta: #99694e;
  --color-line: rgb(23 21 19 / 12%);
  --color-muted: rgb(23 21 19 / 62%);
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif;
  --space-page: clamp(1.25rem, 4vw, 4rem);
  --space-section: clamp(5rem, 11vw, 10rem);
  --content-wide: 90rem;
  --content-copy: 48rem;
  --radius-surface: 1.75rem;
  --radius-control: 999px;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --duration-press: 140ms;
  --duration-ui: 240ms;
  --shadow-float: 0 1.5rem 5rem rgb(32 40 45 / 14%);
}
~~~

Create **src/styles/global.css**:

~~~css
@import "./tokens.css";
@import "./motion.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: var(--color-paper);
}

body {
  margin: 0;
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

body,
button,
a {
  text-rendering: optimizeLegibility;
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration-thickness: .08em;
  text-underline-offset: .2em;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  font: inherit;
}

:focus-visible {
  outline: 3px solid var(--color-sky);
  outline-offset: 4px;
}

.page-width {
  width: min(var(--content-wide), calc(100% - 2 * var(--space-page)));
  margin-inline: auto;
}

.section {
  padding-block: var(--space-section);
}

.eyebrow {
  margin: 0 0 .9rem;
  color: var(--color-graphite);
  font-size: .75rem;
  font-weight: 750;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.display {
  margin: 0;
  font-size: clamp(3rem, 8vw, 7.5rem);
  font-weight: 720;
  letter-spacing: -.055em;
  line-height: .94;
}

.section-title {
  margin: 0;
  max-width: 18ch;
  font-size: clamp(2.5rem, 5.6vw, 5.75rem);
  font-weight: 700;
  letter-spacing: -.05em;
  line-height: .98;
}

.body-large {
  max-width: var(--content-copy);
  color: var(--color-muted);
  font-size: clamp(1.12rem, 2vw, 1.5rem);
  line-height: 1.5;
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: .75rem;
  left: .75rem;
  translate: 0 -200%;
  padding: .75rem 1rem;
  border-radius: .75rem;
  background: var(--color-ink);
  color: white;
}

.skip-link:focus {
  translate: 0;
}
~~~

Create **src/styles/motion.css**:

~~~css
.pressable {
  transition: transform var(--duration-press) var(--ease-out);
}

.pressable:active {
  transform: scale(.975);
}

.reveal {
  opacity: 0;
  transform: translateY(1rem);
  transition:
    opacity 500ms var(--ease-out),
    transform 500ms var(--ease-out);
}

.reveal[data-visible="true"] {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .pressable,
  .reveal {
    transition: opacity 160ms linear;
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .material {
    background: var(--color-paper);
    backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  :root {
    --color-muted: rgb(23 21 19 / 82%);
    --color-line: rgb(23 21 19 / 38%);
  }
}
~~~

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run:

~~~bash
npm test -- src/data/site.test.ts
~~~

Expected: 3 tests PASS.

- [ ] **Step 6: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add src/types/site.ts src/data/site.ts src/data/site.test.ts src/styles/tokens.css src/styles/global.css src/styles/motion.css
git commit -m "feat: define conteúdo e sistema visual"
~~~

---

### Task 3: Implementar o snapshot do GitHub com fallback

**Files:**
- Create: **scripts/github-data.mjs**
- Create: **scripts/sync-github.mjs**
- Create: **scripts/github-data.test.ts**
- Create: **src/data/github-snapshot.json**
- Modify: **src/types/site.ts**
- Modify: **package.json**

- [ ] **Step 1: Escrever os testes do pipeline**

Create **scripts/github-data.test.ts**:

~~~typescript
import { describe, expect, it } from "vitest";
import { normalizeRepositories } from "./github-data.mjs";

const repo = (overrides = {}) => ({
  name: "krit",
  html_url: "https://github.com/leonardocandiani/krit",
  description: "Screenshot nativo para macOS",
  language: "Swift",
  stargazers_count: 12,
  fork: false,
  archived: false,
  disabled: false,
  pushed_at: "2026-08-06T13:21:07Z",
  ...overrides
});

describe("normalizeRepositories", () => {
  it("remove forks, arquivados, perfil e repos sem descrição", () => {
    const result = normalizeRepositories([
      repo(),
      repo({ name: "fork", fork: true }),
      repo({ name: "old", archived: true }),
      repo({ name: "leonardocandiani" }),
      repo({ name: "empty", description: "" })
    ]);

    expect(result.map((item) => item.name)).toEqual(["krit"]);
  });

  it("ordena por atividade recente", () => {
    const result = normalizeRepositories([
      repo({ name: "older", pushed_at: "2026-01-01T00:00:00Z" }),
      repo({ name: "newer", pushed_at: "2026-08-09T00:00:00Z" })
    ]);

    expect(result.map((item) => item.name)).toEqual(["newer", "older"]);
  });
});
~~~

- [ ] **Step 2: Rodar os testes e confirmar a falha**

Run:

~~~bash
npm test -- scripts/github-data.test.ts
~~~

Expected: FAIL porque **scripts/github-data.mjs** não existe.

- [ ] **Step 3: Criar a normalização**

Create **scripts/github-data.mjs**:

~~~javascript
const BLOCKED_NAMES = new Set(["leonardocandiani"]);

export function normalizeRepositories(repositories) {
  return repositories
    .filter((repo) => !repo.fork)
    .filter((repo) => !repo.archived && !repo.disabled)
    .filter((repo) => !BLOCKED_NAMES.has(repo.name))
    .filter((repo) => typeof repo.description === "string" && repo.description.trim().length > 0)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description.trim(),
      language: repo.language,
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at
    }))
    .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
}
~~~

- [ ] **Step 4: Criar o sincronizador e snapshot inicial**

Create **scripts/sync-github.mjs**:

~~~javascript
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { normalizeRepositories } from "./github-data.mjs";

const outputUrl = new URL("../src/data/github-snapshot.json", import.meta.url);
const outputPath = fileURLToPath(outputUrl);
const endpoint = "https://api.github.com/users/leonardocandiani/repos?per_page=100&sort=pushed";

async function readSnapshot() {
  const raw = await readFile(outputPath, "utf8");
  return JSON.parse(raw);
}

async function sync() {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "leonardo-candiani-site"
      }
    });

    if (!response.ok) {
      throw new Error("GitHub respondeu " + response.status);
    }

    const repositories = normalizeRepositories(await response.json());
    const snapshot = {
      syncedAt: new Date().toISOString(),
      repositories
    };

    await writeFile(outputPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
    console.log("GitHub: " + repositories.length + " repositórios sincronizados.");
  } catch (error) {
    const snapshot = await readSnapshot();
    console.warn("GitHub indisponível. Usando snapshot de " + snapshot.syncedAt + ".");
  }
}

await sync();
~~~

Create **src/data/github-snapshot.json**:

~~~json
{
  "syncedAt": "2026-08-10T00:00:00.000Z",
  "repositories": []
}
~~~

Update **package.json** so the synchronization only becomes a build dependency after the script exists:

~~~json
"sync:github": "node scripts/sync-github.mjs",
"build": "astro check && astro build",
"build:fresh": "npm run sync:github && npm run build"
~~~

Append to **src/types/site.ts**:

~~~typescript
export type GitHubRepository = {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type GitHubSnapshot = {
  syncedAt: string;
  repositories: GitHubRepository[];
};
~~~

- [ ] **Step 5: Provar testes e sincronização real**

Run:

~~~bash
npm test -- scripts/github-data.test.ts
npm run sync:github
~~~

Expected: 2 tests PASS e snapshot com repositórios públicos recentes.

- [ ] **Step 6: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add scripts/github-data.mjs scripts/sync-github.mjs scripts/github-data.test.ts src/data/github-snapshot.json src/types/site.ts
git commit -m "feat: sincroniza projetos públicos do GitHub"
~~~

---

### Task 4: Criar layout, SEO e navegação acessível

**Files:**
- Create: **src/layouts/BaseLayout.astro**
- Create: **src/components/SiteHeader.astro**
- Create: **src/components/MobileNav.tsx**
- Create: **src/pages/index.astro**
- Create: **public/favicon.svg**
- Create: **public/robots.txt**
- Create: **tests/portfolio.spec.ts**
- Modify: **package.json**

- [ ] **Step 1: Escrever o primeiro smoke test**

Create **tests/portfolio.spec.ts**:

~~~typescript
import { expect, test } from "@playwright/test";

test("renderiza a identidade pessoal e a navegação", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Construo sistemas de IA");
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeAttached();
});
~~~

Add the executable e2e gate to **package.json** now that the first spec exists:

~~~json
"test:e2e": "playwright test"
~~~

- [ ] **Step 2: Rodar o smoke test e confirmar a falha**

Run:

~~~bash
npx playwright test tests/portfolio.spec.ts --project=desktop
~~~

Expected: FAIL porque a página ainda não existe.

- [ ] **Step 3: Criar layout e metadados**

Create **src/layouts/BaseLayout.astro**:

~~~astro
---
import "../styles/global.css";

type Props = {
  title: string;
  description: string;
};

const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL("/images/leonardo-portrait-wide.webp", Astro.site);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leonardo Candiani",
  url: "https://leonardocandiani.com.br",
  jobTitle: "Fundador e operador de IA",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Maringá",
    addressRegion: "PR",
    addressCountry: "BR"
  },
  sameAs: [
    "https://github.com/leonardocandiani",
    "https://instagram.com/leonardocandiani",
    "https://youtube.com/@oleonardocandiani"
  ]
};
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#FBFAF7" />
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.svg" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <title>{title}</title>
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </head>
  <body>
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <slot />
  </body>
</html>
~~~

Create **public/favicon.svg**:

~~~svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="LC">
  <rect width="64" height="64" rx="15" fill="#171513"/>
  <path d="M17 15v34h19v-7H25V15h-8Zm30 8c-10 0-17 6-17 17s7 17 17 17c4 0 8-1 11-3l-3-6c-2 1-4 2-7 2-6 0-10-4-10-10s4-10 10-10c3 0 5 1 7 2l3-6c-3-2-7-3-11-3Z" fill="#F2EEE7"/>
</svg>
~~~

Create **public/robots.txt**:

~~~text
User-agent: *
Allow: /

Sitemap: https://leonardocandiani.com.br/sitemap-index.xml
~~~

- [ ] **Step 4: Criar navegação desktop e mobile**

Create **src/components/MobileNav.tsx**:

~~~tsx
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

type Item = { label: string; href: string };

export function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div className="mobile-nav">
      <button className="nav-trigger pressable" type="button" aria-expanded={open} onClick={() => setOpen(true)}>
        Menu
      </button>
      {open && (
        <div className="nav-scrim" role="presentation" onMouseDown={() => setOpen(false)}>
          <div
            className="nav-sheet material"
            role="dialog"
            aria-modal="true"
            aria-label="Navegação"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button ref={closeRef} className="nav-close pressable" type="button" onClick={() => setOpen(false)}>
              Fechar
            </button>
            <nav aria-label="Menu mobile">
              {items.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
~~~

Create **src/components/SiteHeader.astro**:

~~~astro
---
import { MobileNav } from "./MobileNav";
import { siteContent } from "../data/site";
---

<header class="site-header material">
  <a class="brand pressable" href="#conteudo" aria-label="Leonardo Candiani, início">Leonardo Candiani</a>
  <nav class="desktop-nav" aria-label="Principal">
    {siteContent.navigation.map((item) => <a class="pressable" href={item.href}>{item.label}</a>)}
  </nav>
  <MobileNav client:load items={siteContent.navigation} />
</header>

<style>
  .site-header {
    position: fixed;
    z-index: 50;
    top: 1rem;
    left: 50%;
    display: flex;
    width: min(56rem, calc(100% - 2rem));
    min-height: 3.5rem;
    align-items: center;
    justify-content: space-between;
    padding: .55rem .7rem .55rem 1rem;
    translate: -50% 0;
    border: 1px solid rgb(255 255 255 / 60%);
    border-radius: var(--radius-control);
    background: rgb(251 250 247 / 72%);
    box-shadow: 0 .75rem 2.5rem rgb(32 40 45 / 9%);
    backdrop-filter: blur(22px) saturate(160%);
  }
  .brand {
    font-size: .9rem;
    font-weight: 700;
    letter-spacing: -.02em;
    text-decoration: none;
  }
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: .25rem;
  }
  .desktop-nav a,
  :global(.nav-trigger),
  :global(.nav-close) {
    min-height: 2.5rem;
    padding: .65rem .85rem;
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    text-decoration: none;
  }
  :global(.mobile-nav) { display: none; }
  :global(.nav-scrim) {
    position: fixed;
    inset: 0;
    display: grid;
    align-items: end;
    background: rgb(23 21 19 / 26%);
  }
  :global(.nav-sheet) {
    display: grid;
    gap: .4rem;
    padding: 1rem 1rem 2rem;
    border-radius: 1.75rem 1.75rem 0 0;
    background: rgb(251 250 247 / 94%);
    backdrop-filter: blur(24px);
  }
  :global(.nav-sheet nav) {
    display: grid;
  }
  :global(.nav-sheet a) {
    padding: .9rem .5rem;
    font-size: 1.75rem;
    font-weight: 650;
    letter-spacing: -.04em;
    text-decoration: none;
  }
  @media (max-width: 48rem) {
    .desktop-nav { display: none; }
    :global(.mobile-nav) { display: block; }
  }
</style>
~~~

- [ ] **Step 5: Criar a composição mínima da página**

Create **src/pages/index.astro**:

~~~astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SiteHeader from "../components/SiteHeader.astro";
import { siteContent } from "../data/site";

const title = "Leonardo Candiani | IA, produtos e sistemas que operam empresas";
const description = "Fundador e operador de IA. Projetos, sistemas e open source construídos por Leonardo Candiani.";
---

<BaseLayout {title} {description}>
  <SiteHeader />
  <main id="conteudo">
    <section class="section page-width">
      <p class="eyebrow">{siteContent.hero.eyebrow}</p>
      <h1 class="display">{siteContent.hero.title}</h1>
      <p class="body-large">{siteContent.hero.description}</p>
    </section>
  </main>
</BaseLayout>
~~~

- [ ] **Step 6: Rodar smoke, check e build**

Run:

~~~bash
npx playwright test tests/portfolio.spec.ts --project=desktop
npm run check
~~~

Expected: smoke PASS e Astro check sem erros.

- [ ] **Step 7: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add src/layouts/BaseLayout.astro src/components/SiteHeader.astro src/components/MobileNav.tsx src/pages/index.astro public/favicon.svg public/robots.txt tests/portfolio.spec.ts
git commit -m "feat: cria shell e navegação do portfólio"
~~~

---

### Task 5: Produzir e integrar a fotografia principal

**Files:**
- Create: **public/images/leonardo-portrait-original.jpg**
- Create: **public/images/leonardo-portrait-wide.webp**
- Create: **src/components/HeroPortrait.astro**
- Modify: **src/pages/index.astro**

- [ ] **Step 1: Preservar o arquivo original**

Copy the supplied photograph to **public/images/leonardo-portrait-original.jpg** without recompression.

Run:

~~~bash
mkdir -p public/images
cp "/tmp/codex-remote-attachments/019fee97-4012-76a3-a91b-685100af085f/56E923E5-622E-4A67-9481-019B3D86B819/1-Foto-1.jpg" public/images/leonardo-portrait-original.jpg
cmp "/tmp/codex-remote-attachments/019fee97-4012-76a3-a91b-685100af085f/56E923E5-622E-4A67-9481-019B3D86B819/1-Foto-1.jpg" public/images/leonardo-portrait-original.jpg
~~~

Expected: exit 0.

- [ ] **Step 2: Gerar a expansão horizontal com imagegen**

Use built-in imagegen in edit mode with the original photo as edit target.

Prompt:

~~~text
Use case: identity-preserve
Asset type: desktop portfolio hero photograph
Primary request: expand the supplied portrait into a wide 16:9 editorial composition, creating generous clean sky and negative space on the left for website typography
Input images: Image 1 is the edit target
Style/medium: natural editorial photography
Composition/framing: preserve the person on the right half, extend only the surrounding sky and lower shirt area as needed
Lighting/mood: preserve the exact natural daylight and calm confident mood
Color palette: preserve the original sky blue, warm cotton shirt, skin and hair colors
Constraints: preserve identity, face, hair, beard, body, shirt, pose, expression, eye direction, camera perspective, skin texture and lighting; no beauty retouching; no added objects; no text; no watermark
Avoid: plastic skin, altered facial proportions, different clothing, dramatic clouds, cinematic color grading, neon, sci-fi elements, artificial blur
~~~

Save the selected project-bound output as **public/images/leonardo-portrait-wide.webp**. Do not overwrite the original.

- [ ] **Step 3: Inspecionar invariantes**

Use the image viewer on both files and confirm:

- Same identity and facial geometry.
- Same shirt and pose.
- Negative space on the left.
- No generated object or text.
- Natural skin texture.

If any invariant fails, perform one targeted edit iteration and re-check.

- [ ] **Step 4: Criar o hero**

Create **src/components/HeroPortrait.astro**:

~~~astro
---
import { siteContent } from "../data/site";
---

<section class="hero" aria-labelledby="hero-title">
  <picture class="hero-media">
    <source media="(min-width: 64rem)" srcset="/images/leonardo-portrait-wide.webp" />
    <img src="/images/leonardo-portrait-original.jpg" alt="Leonardo Candiani diante de um céu azul" fetchpriority="high" />
  </picture>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-content page-width">
    <p class="eyebrow">{siteContent.hero.eyebrow}</p>
    <h1 id="hero-title" class="display">{siteContent.hero.title}</h1>
    <p>{siteContent.hero.description}</p>
    <div class="hero-actions">
      <a class="primary-action pressable" href="#visao">Conhecer minha visão</a>
      <a class="secondary-action pressable" href="#projetos">Ver projetos</a>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    display: grid;
    min-height: 100svh;
    align-items: end;
    overflow: hidden;
    background: var(--color-sky-light);
  }
  .hero-media,
  .hero-shade {
    position: absolute;
    inset: 0;
  }
  .hero-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 53% 30%;
  }
  .hero-shade {
    background: linear-gradient(90deg, rgb(17 24 28 / 70%) 0%, rgb(17 24 28 / 18%) 55%, transparent 76%);
  }
  .hero-content {
    position: relative;
    z-index: 2;
    padding-block: clamp(8rem, 18vh, 13rem) clamp(3rem, 8vh, 6rem);
    color: white;
  }
  .hero-content .display {
    max-width: 10ch;
  }
  .hero-content > p:not(.eyebrow) {
    max-width: 36rem;
    margin: 1.5rem 0 0;
    color: rgb(255 255 255 / 78%);
    font-size: clamp(1.05rem, 2vw, 1.35rem);
  }
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: .75rem;
    margin-top: 2rem;
  }
  .hero-actions a {
    min-height: 3rem;
    padding: .85rem 1.15rem;
    border-radius: var(--radius-control);
    font-weight: 700;
    text-decoration: none;
  }
  .primary-action {
    background: white;
    color: var(--color-ink);
  }
  .secondary-action {
    border: 1px solid rgb(255 255 255 / 48%);
    background: rgb(255 255 255 / 10%);
    backdrop-filter: blur(14px);
  }
  @media (max-width: 47.99rem) {
    .hero-shade {
      background: linear-gradient(to top, rgb(17 24 28 / 82%) 0%, rgb(17 24 28 / 10%) 64%, transparent 78%);
    }
    .hero-content .display {
      max-width: 11ch;
      font-size: clamp(2.75rem, 13vw, 4.6rem);
    }
  }
</style>
~~~

Replace the temporary hero section in **src/pages/index.astro** with:

~~~astro
<HeroPortrait />
~~~

Add the import:

~~~astro
import HeroPortrait from "../components/HeroPortrait.astro";
~~~

- [ ] **Step 5: Provar renderização e imagem**

Run:

~~~bash
npx playwright test tests/portfolio.spec.ts --project=desktop
npx playwright test tests/portfolio.spec.ts --project=iphone
~~~

Expected: hero e heading visíveis nos dois projetos.

- [ ] **Step 6: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add public/images/leonardo-portrait-original.jpg public/images/leonardo-portrait-wide.webp src/components/HeroPortrait.astro src/pages/index.astro
git commit -m "feat: adiciona o hero editorial"
~~~

---

### Task 6: Construir visão e projetos selecionados

**Files:**
- Create: **src/components/VisionSection.astro**
- Create: **src/components/FeaturedWork.astro**
- Modify: **src/pages/index.astro**
- Modify: **tests/portfolio.spec.ts**

- [ ] **Step 1: Estender o smoke test**

Append to the existing test in **tests/portfolio.spec.ts**:

~~~typescript
await expect(page.getByRole("heading", { name: siteHeading("IA deve ampliar") })).toBeVisible();
await expect(page.locator("#projetos .work-item")).toHaveCount(6);
~~~

Add this helper above the test:

~~~typescript
function siteHeading(text: string) {
  return new RegExp(text, "i");
}
~~~

- [ ] **Step 2: Rodar e confirmar a falha**

Run:

~~~bash
npx playwright test tests/portfolio.spec.ts --project=desktop
~~~

Expected: FAIL porque Visão e Projetos não existem.

- [ ] **Step 3: Criar a seção de visão**

Create **src/components/VisionSection.astro**:

~~~astro
---
import { siteContent } from "../data/site";
---

<section id="visao" class="vision section">
  <div class="page-width vision-grid">
    <p class="eyebrow">Visão</p>
    <div>
      <h2 class="section-title">{siteContent.vision.title}</h2>
      <p class="body-large">{siteContent.vision.body}</p>
      <p class="signature">Leonardo Candiani, Maringá, PR</p>
    </div>
  </div>
</section>

<style>
  .vision {
    background: var(--color-paper);
  }
  .vision-grid {
    display: grid;
    grid-template-columns: minmax(10rem, .35fr) minmax(0, 1fr);
    gap: clamp(2rem, 8vw, 9rem);
    align-items: start;
  }
  .body-large {
    margin: 2rem 0 0;
  }
  .signature {
    margin: 3rem 0 0;
    color: var(--color-muted);
    font-size: .85rem;
  }
  @media (max-width: 45rem) {
    .vision-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
~~~

- [ ] **Step 4: Criar a curadoria de projetos**

Create **src/components/FeaturedWork.astro**:

~~~astro
---
import { siteContent } from "../data/site";
---

<section id="projetos" class="work section">
  <div class="page-width">
    <div class="work-heading">
      <div>
        <p class="eyebrow">Projetos selecionados</p>
        <h2 class="section-title">O que construo precisa funcionar fora da apresentação.</h2>
      </div>
      <p class="body-large">Empresas, ferramentas e sistemas que nasceram de problemas reais e continuam evoluindo em público ou em operação.</p>
    </div>
    <div class="work-grid">
      {siteContent.featuredWork.map((project, index) => project.href ? (
        <a
          class:list={["work-item", "pressable", "tone-" + project.tone, { "work-item-large": index < 2 }]}
          href={project.href}
          target="_blank"
          rel="noreferrer"
        >
          <span>{project.category}</span>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <strong aria-hidden="true">Abrir repositório</strong>
        </a>
      ) : (
        <article class:list={["work-item", "tone-" + project.tone, { "work-item-large": index < 2 }]}>
          <span>{project.category}</span>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .work {
    background: var(--color-cotton);
  }
  .work-heading {
    display: grid;
    grid-template-columns: 1.1fr .65fr;
    gap: clamp(2rem, 7vw, 7rem);
    align-items: end;
  }
  .work-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
    margin-top: clamp(3rem, 7vw, 6rem);
  }
  .work-item {
    grid-column: span 4;
    display: flex;
    min-height: 19rem;
    flex-direction: column;
    padding: clamp(1.35rem, 3vw, 2.25rem);
    border-radius: var(--radius-surface);
    background: var(--color-paper);
    color: var(--color-ink);
    text-decoration: none;
  }
  .work-item-large {
    grid-column: span 6;
    min-height: 27rem;
  }
  .tone-ink {
    background: var(--color-ink);
    color: white;
  }
  .tone-sky {
    background: var(--color-sky-light);
  }
  .tone-cotton {
    background: #e8dfd4;
  }
  .work-item > span {
    font-size: .75rem;
    font-weight: 750;
    letter-spacing: .09em;
    text-transform: uppercase;
    opacity: .62;
  }
  .work-item h3 {
    margin: auto 0 .75rem;
    font-size: clamp(2rem, 4vw, 4rem);
    letter-spacing: -.05em;
    line-height: .95;
  }
  .work-item p {
    max-width: 35rem;
    margin: 0;
    opacity: .7;
  }
  .work-item strong {
    margin-top: 1.5rem;
    font-size: .78rem;
  }
  @media (max-width: 52rem) {
    .work-heading {
      grid-template-columns: 1fr;
    }
    .work-item,
    .work-item-large {
      grid-column: 1 / -1;
      min-height: 18rem;
    }
  }
</style>
~~~

- [ ] **Step 5: Integrar as seções**

Add imports to **src/pages/index.astro**:

~~~astro
import VisionSection from "../components/VisionSection.astro";
import FeaturedWork from "../components/FeaturedWork.astro";
~~~

Render after **HeroPortrait**:

~~~astro
<VisionSection />
<FeaturedWork />
~~~

- [ ] **Step 6: Provar o smoke**

Run:

~~~bash
npx playwright test tests/portfolio.spec.ts --project=desktop
~~~

Expected: Visão visível e 6 articles ou links de projeto no grid.

- [ ] **Step 7: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add src/components/VisionSection.astro src/components/FeaturedWork.astro src/pages/index.astro tests/portfolio.spec.ts
git commit -m "feat: apresenta visão e projetos selecionados"
~~~

---

### Task 7: Construir o case e a demo do Minino Jarvis

**Files:**
- Create: **src/components/jarvis/jarvis-machine.ts**
- Create: **src/components/jarvis/jarvis-machine.test.ts**
- Create: **src/components/jarvis/JarvisDemo.tsx**
- Create: **src/components/jarvis/JarvisCaseStudy.astro**
- Modify: **src/pages/index.astro**
- Modify: **tests/portfolio.spec.ts**

- [ ] **Step 1: Escrever os testes da máquina de estados**

Create **src/components/jarvis/jarvis-machine.test.ts**:

~~~typescript
import { describe, expect, it } from "vitest";
import { initialJarvisState, jarvisReducer } from "./jarvis-machine";

describe("jarvisReducer", () => {
  it("avança pela sequência determinística", () => {
    const question = jarvisReducer(initialJarvisState, { type: "NEXT" });
    const consulting = jarvisReducer(question, { type: "NEXT" });
    const answer = jarvisReducer(consulting, { type: "NEXT" });
    const action = jarvisReducer(answer, { type: "NEXT" });

    expect([question.step, consulting.step, answer.step, action.step]).toEqual([
      "question",
      "consulting",
      "answer",
      "action"
    ]);
  });

  it("permite selecionar qualquer etapa e reiniciar", () => {
    const selected = jarvisReducer(initialJarvisState, { type: "SELECT", step: "answer" });
    expect(selected.step).toBe("answer");
    expect(jarvisReducer(selected, { type: "RESET" })).toEqual(initialJarvisState);
  });
});
~~~

- [ ] **Step 2: Rodar e confirmar a falha**

Run:

~~~bash
npm test -- src/components/jarvis/jarvis-machine.test.ts
~~~

Expected: FAIL porque a máquina não existe.

- [ ] **Step 3: Implementar a máquina de estados**

Create **src/components/jarvis/jarvis-machine.ts**:

~~~typescript
export type JarvisStep = "idle" | "question" | "consulting" | "answer" | "action";

export type JarvisState = {
  step: JarvisStep;
};

export type JarvisEvent =
  | { type: "NEXT" }
  | { type: "SELECT"; step: JarvisStep }
  | { type: "RESET" };

const order: JarvisStep[] = ["idle", "question", "consulting", "answer", "action"];

export const initialJarvisState: JarvisState = { step: "idle" };

export function jarvisReducer(state: JarvisState, event: JarvisEvent): JarvisState {
  if (event.type === "RESET") return initialJarvisState;
  if (event.type === "SELECT") return { step: event.step };

  const current = order.indexOf(state.step);
  const next = Math.min(current + 1, order.length - 1);
  return { step: order[next] };
}
~~~

- [ ] **Step 4: Provar a máquina**

Run:

~~~bash
npm test -- src/components/jarvis/jarvis-machine.test.ts
~~~

Expected: 2 tests PASS.

- [ ] **Step 5: Criar a demo acessível**

Create **src/components/jarvis/JarvisDemo.tsx**:

~~~tsx
import { useEffect, useReducer } from "react";
import { initialJarvisState, jarvisReducer, type JarvisStep } from "./jarvis-machine";

const steps: Array<{ id: JarvisStep; label: string }> = [
  { id: "question", label: "Pergunta" },
  { id: "consulting", label: "Consulta" },
  { id: "answer", label: "Resposta" },
  { id: "action", label: "Ação" }
];

export function JarvisDemo() {
  const [state, dispatch] = useReducer(jarvisReducer, initialJarvisState);

  useEffect(() => {
    if (state.step !== "idle") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispatch({ type: "SELECT", step: "answer" });
    }
  }, [state.step]);

  return (
    <div className="jarvis-demo" data-step={state.step}>
      <div className="demo-toolbar">
        <span>Exemplo ilustrativo</span>
        <button className="pressable" type="button" onClick={() => dispatch({ type: "RESET" })}>
          Reiniciar
        </button>
      </div>

      <div className="phone-frame" aria-live="polite">
        <div className="message message-director">
          Como está nossa operação hoje e onde preciso agir primeiro?
        </div>
        {["consulting", "answer", "action"].includes(state.step) && (
          <div className="system-note">Consultando indicadores, conversas e pendências conectadas.</div>
        )}
        {["answer", "action"].includes(state.step) && (
          <div className="message message-jarvis">
            <strong>Prioridade encontrada</strong>
            <p>Existe uma fila comercial sem retorno dentro da janela esperada. O risco está concentrado em oportunidades que já demonstraram intenção.</p>
            <ul>
              <li>Retomar as conversas prioritárias.</li>
              <li>Avisar o gestor responsável.</li>
              <li>Acompanhar a recuperação na próxima hora.</li>
            </ul>
          </div>
        )}
        {state.step === "action" && (
          <div className="system-note system-note-success">Ações autorizadas e iniciadas.</div>
        )}
      </div>

      <div className="demo-controls" aria-label="Etapas da demonstração">
        {steps.map((step) => (
          <button
            key={step.id}
            className="pressable"
            type="button"
            aria-pressed={state.step === step.id}
            onClick={() => dispatch({ type: "SELECT", step: step.id })}
          >
            {step.label}
          </button>
        ))}
      </div>

      {state.step === "idle" && (
        <button className="demo-start pressable" type="button" onClick={() => dispatch({ type: "NEXT" })}>
          Ver como funciona
        </button>
      )}
    </div>
  );
}
~~~

- [ ] **Step 6: Criar a narrativa editorial do case**

Create **src/components/jarvis/JarvisCaseStudy.astro**:

~~~astro
---
import { siteContent } from "../../data/site";
import { JarvisDemo } from "./JarvisDemo";
---

<section id="jarvis" class="jarvis section" aria-labelledby="jarvis-title">
  <div class="page-width">
    <div class="jarvis-intro">
      <p class="eyebrow">{siteContent.jarvis.eyebrow}</p>
      <h2 id="jarvis-title" class="section-title">{siteContent.jarvis.title}</h2>
      <p class="body-large">{siteContent.jarvis.description}</p>
    </div>

    <div class="demo-shell">
      <JarvisDemo client:visible />
    </div>

    <ol class="jarvis-steps">
      {siteContent.jarvis.steps.map((step, index) => (
        <li>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p class="eyebrow">{step.label}</p>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>

    <aside class="technical-proof">
      <p class="eyebrow">Por trás da conversa</p>
      <h3>Harnesses próprios, integrações reais e frameworks atuais validados no mercado.</h3>
      <p>A experiência simples no WhatsApp depende de uma arquitetura que organiza contexto, ferramentas, memória, regras e permissões da empresa.</p>
    </aside>
  </div>
</section>

<style>
  .jarvis {
    background: var(--color-ink);
    color: white;
  }
  .jarvis-intro {
    display: grid;
    grid-template-columns: .35fr 1.1fr;
    gap: 2rem clamp(2rem, 8vw, 9rem);
    align-items: start;
  }
  .jarvis-intro .eyebrow {
    color: #a8bfcb;
  }
  .jarvis-intro .body-large {
    grid-column: 2;
    color: rgb(255 255 255 / 65%);
  }
  .demo-shell {
    margin-top: clamp(3rem, 8vw, 7rem);
    padding: clamp(1rem, 3vw, 2rem);
    border: 1px solid rgb(255 255 255 / 13%);
    border-radius: var(--radius-surface);
    background: rgb(255 255 255 / 5%);
  }
  :global(.jarvis-demo) {
    position: relative;
    min-height: 34rem;
  }
  :global(.demo-toolbar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgb(255 255 255 / 55%);
    font-size: .75rem;
  }
  :global(.demo-toolbar button),
  :global(.demo-controls button),
  :global(.demo-start) {
    min-height: 2.75rem;
    padding: .7rem 1rem;
    border: 1px solid rgb(255 255 255 / 16%);
    border-radius: var(--radius-control);
    background: rgb(255 255 255 / 7%);
    color: white;
  }
  :global(.phone-frame) {
    width: min(34rem, 100%);
    min-height: 23rem;
    margin: 2rem auto;
    padding: 1rem;
    border-radius: 2rem;
    background: var(--color-paper);
    color: var(--color-ink);
    box-shadow: var(--shadow-float);
  }
  :global(.message) {
    width: min(86%, 28rem);
    margin-bottom: .8rem;
    padding: .9rem 1rem;
    border-radius: 1.15rem;
  }
  :global(.message-director) {
    margin-left: auto;
    border-bottom-right-radius: .35rem;
    background: var(--color-sky);
    color: white;
  }
  :global(.message-jarvis) {
    border-bottom-left-radius: .35rem;
    background: white;
    box-shadow: 0 .4rem 1.4rem rgb(32 40 45 / 10%);
  }
  :global(.message-jarvis p),
  :global(.message-jarvis ul) {
    color: var(--color-muted);
    font-size: .9rem;
  }
  :global(.system-note) {
    margin: .8rem 0;
    color: var(--color-muted);
    font-size: .78rem;
    text-align: center;
  }
  :global(.system-note-success) {
    color: var(--color-sky);
    font-weight: 700;
  }
  :global(.demo-controls) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: .5rem;
  }
  :global(.demo-controls button[aria-pressed="true"]) {
    background: white;
    color: var(--color-ink);
  }
  :global(.demo-start) {
    position: absolute;
    left: 50%;
    bottom: 4rem;
    translate: -50% 0;
  }
  .jarvis-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    margin: 6rem 0 0;
    padding: 0;
    list-style: none;
    background: rgb(255 255 255 / 14%);
  }
  .jarvis-steps li {
    padding: 1.5rem;
    background: var(--color-ink);
  }
  .jarvis-steps li > span {
    color: #a8bfcb;
    font-size: .75rem;
  }
  .jarvis-steps h3 {
    margin: 1rem 0;
    font-size: 1.5rem;
    letter-spacing: -.035em;
  }
  .jarvis-steps li > p:last-child {
    color: rgb(255 255 255 / 55%);
  }
  .technical-proof {
    display: grid;
    grid-template-columns: .35fr 1fr .7fr;
    gap: 2rem;
    margin-top: 5rem;
    padding-top: 3rem;
    border-top: 1px solid rgb(255 255 255 / 16%);
  }
  .technical-proof h3 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 3.5rem);
    letter-spacing: -.045em;
    line-height: 1;
  }
  .technical-proof > p:last-child {
    margin: 0;
    color: rgb(255 255 255 / 58%);
  }
  @media (max-width: 52rem) {
    .jarvis-intro,
    .technical-proof {
      grid-template-columns: 1fr;
    }
    .jarvis-intro .body-large {
      grid-column: 1;
    }
    .jarvis-steps {
      grid-template-columns: 1fr;
    }
  }
</style>
~~~

- [ ] **Step 7: Integrar e testar**

Add import and render after **FeaturedWork** in **src/pages/index.astro**:

~~~astro
import JarvisCaseStudy from "../components/jarvis/JarvisCaseStudy.astro";
~~~

~~~astro
<JarvisCaseStudy />
~~~

Append to **tests/portfolio.spec.ts**:

~~~typescript
test("apresenta o Minino Jarvis como case e não como hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).not.toContainText("Minino Jarvis");
  await expect(page.locator("#jarvis")).toContainText("Pergunte à sua empresa");
  await page.getByRole("button", { name: "Ver como funciona" }).click();
  await page.getByRole("button", { name: "Resposta" }).click();
  await expect(page.locator(".message-jarvis")).toContainText("Prioridade encontrada");
});
~~~

Run:

~~~bash
npm test -- src/components/jarvis/jarvis-machine.test.ts
npx playwright test tests/portfolio.spec.ts --project=desktop
~~~

Expected: unit tests e case smoke PASS.

- [ ] **Step 8: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add src/components/jarvis src/pages/index.astro tests/portfolio.spec.ts
git commit -m "feat: apresenta o case Minino Jarvis"
~~~

---

### Task 8: Construir GitHub, presença pública e contato

**Files:**
- Create: **src/components/GitHubProjects.astro**
- Create: **src/components/PublicPresence.astro**
- Create: **src/components/ContactFooter.astro**
- Modify: **src/pages/index.astro**
- Modify: **tests/portfolio.spec.ts**

- [ ] **Step 1: Adicionar expectativas de conteúdo**

Append to **tests/portfolio.spec.ts**:

~~~typescript
test("mostra GitHub recente e contato", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#github")).toContainText("Open source");
  await expect(page.locator("#github article").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /WhatsApp/i }).last()).toHaveAttribute("href", /wa\.me/);
});
~~~

- [ ] **Step 2: Rodar e confirmar a falha**

Run:

~~~bash
npx playwright test tests/portfolio.spec.ts --project=desktop
~~~

Expected: FAIL porque GitHub e contato ainda não existem.

- [ ] **Step 3: Criar a seção GitHub**

Create **src/components/GitHubProjects.astro**:

~~~astro
---
import snapshot from "../data/github-snapshot.json";
import type { GitHubSnapshot } from "../types/site";

const data = snapshot as GitHubSnapshot;
const featuredNames = ["krit", "scratchmate", "keepwright"];
const featured = featuredNames
  .map((name) => data.repositories.find((repo) => repo.name === name))
  .filter(Boolean);
const recent = data.repositories
  .filter((repo) => !featuredNames.includes(repo.name))
  .slice(0, 6);

const date = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric"
});
---

<section id="github" class="github section">
  <div class="page-width">
    <div class="github-heading">
      <div>
        <p class="eyebrow">GitHub, @leonardocandiani</p>
        <h2 class="section-title">O que aprendo também vira ferramenta pública.</h2>
      </div>
      <a class="github-profile pressable" href="https://github.com/leonardocandiani" target="_blank" rel="noreferrer">Ver perfil completo</a>
    </div>

    <div class="github-featured">
      {featured.map((repo) => repo && (
        <article>
          <p>{repo.language ?? "Projeto aberto"}</p>
          <h3><a href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a></h3>
          <p>{repo.description}</p>
        </article>
      ))}
    </div>

    <div class="github-recent" aria-label="Repositórios recentes">
      {recent.map((repo) => (
        <article>
          <div>
            <h3><a href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a></h3>
            <p>{repo.description}</p>
          </div>
          <span>{repo.language ?? "Aberto"} · {date.format(new Date(repo.pushedAt))}</span>
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .github {
    background: var(--color-paper);
  }
  .github-heading {
    display: flex;
    gap: 2rem;
    align-items: end;
    justify-content: space-between;
  }
  .github-profile {
    flex: 0 0 auto;
    padding: .85rem 1.1rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    text-decoration: none;
  }
  .github-featured {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 5rem;
  }
  .github-featured article {
    min-height: 21rem;
    padding: 1.75rem;
    border-radius: var(--radius-surface);
    background: var(--color-sky-light);
  }
  .github-featured article:nth-child(2) {
    background: var(--color-cotton);
  }
  .github-featured article:nth-child(3) {
    background: var(--color-ink);
    color: white;
  }
  .github-featured article > p:first-child {
    font-size: .75rem;
    font-weight: 700;
    opacity: .55;
  }
  .github-featured h3 {
    margin: 6rem 0 1rem;
    font-size: clamp(2rem, 4vw, 3.5rem);
    letter-spacing: -.05em;
  }
  .github-featured h3 a,
  .github-recent h3 a {
    text-decoration: none;
  }
  .github-featured article > p:last-child {
    opacity: .66;
  }
  .github-recent {
    margin-top: 4rem;
    border-top: 1px solid var(--color-line);
  }
  .github-recent article {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: center;
    padding: 1.35rem 0;
    border-bottom: 1px solid var(--color-line);
  }
  .github-recent h3,
  .github-recent p {
    margin: 0;
  }
  .github-recent p,
  .github-recent span {
    color: var(--color-muted);
    font-size: .85rem;
  }
  @media (max-width: 52rem) {
    .github-heading {
      display: grid;
    }
    .github-profile {
      justify-self: start;
    }
    .github-featured {
      grid-template-columns: 1fr;
    }
    .github-recent article {
      grid-template-columns: 1fr;
      gap: .6rem;
    }
  }
</style>
~~~

- [ ] **Step 4: Criar presença pública e contato**

Create **src/components/PublicPresence.astro**:

~~~astro
---
import { siteContent } from "../data/site";
const publicLinks = siteContent.links.filter((link) => link.label !== "WhatsApp");
---

<section class="presence section">
  <div class="page-width presence-grid">
    <div>
      <p class="eyebrow">Conteúdo e presença pública</p>
      <h2 class="section-title">O caminho também vira conteúdo.</h2>
    </div>
    <div class="presence-links">
      {publicLinks.map((link) => (
        <a class="pressable" href={link.href} target="_blank" rel="noreferrer">
          <span>{link.label}</span>
          <strong>Abrir</strong>
        </a>
      ))}
    </div>
  </div>
</section>

<style>
  .presence {
    background: var(--color-sky-light);
  }
  .presence-grid {
    display: grid;
    grid-template-columns: 1fr .75fr;
    gap: clamp(3rem, 9vw, 9rem);
  }
  .presence-links {
    border-top: 1px solid var(--color-line);
  }
  .presence-links a {
    display: flex;
    min-height: 4.75rem;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-line);
    text-decoration: none;
  }
  .presence-links strong {
    font-size: .75rem;
  }
  @media (max-width: 48rem) {
    .presence-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
~~~

Create **src/components/ContactFooter.astro**:

~~~astro
<footer id="contato" class="contact section">
  <div class="page-width">
    <p class="eyebrow">Contato</p>
    <h2 class="section-title">Se a conversa pede ação, vamos construir.</h2>
    <a class="contact-action pressable" href="https://wa.me/5544998893474?text=Olá%20Leo%2C%20quero%20conversar%20sobre%20IA%20na%20minha%20empresa">
      Falar com Leonardo no WhatsApp
    </a>
    <div class="footer-line">
      <span>Leonardo Candiani</span>
      <span>Maringá, PR, Brasil</span>
      <span>{new Date().getFullYear()}</span>
    </div>
  </div>
</footer>

<style>
  .contact {
    min-height: 72svh;
    background: var(--color-graphite);
    color: white;
  }
  .contact .eyebrow {
    color: #b8cad3;
  }
  .contact-action {
    display: inline-flex;
    min-height: 3.25rem;
    align-items: center;
    margin-top: 3rem;
    padding: .9rem 1.2rem;
    border-radius: var(--radius-control);
    background: white;
    color: var(--color-ink);
    font-weight: 750;
    text-decoration: none;
  }
  .footer-line {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-top: clamp(7rem, 18vh, 13rem);
    padding-top: 1.25rem;
    border-top: 1px solid rgb(255 255 255 / 18%);
    color: rgb(255 255 255 / 55%);
    font-size: .78rem;
  }
  @media (max-width: 40rem) {
    .footer-line {
      display: grid;
    }
  }
</style>
~~~

- [ ] **Step 5: Integrar as seções**

Add imports to **src/pages/index.astro**:

~~~astro
import GitHubProjects from "../components/GitHubProjects.astro";
import PublicPresence from "../components/PublicPresence.astro";
import ContactFooter from "../components/ContactFooter.astro";
~~~

Render after **JarvisCaseStudy**:

~~~astro
<GitHubProjects />
<PublicPresence />
<ContactFooter />
~~~

- [ ] **Step 6: Provar conteúdo e build**

Run:

~~~bash
npm run sync:github
npx playwright test tests/portfolio.spec.ts --project=desktop
npm run build
~~~

Expected: snapshot preenchido, smoke PASS e build concluído.

- [ ] **Step 7: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add src/components/GitHubProjects.astro src/components/PublicPresence.astro src/components/ContactFooter.astro src/pages/index.astro tests/portfolio.spec.ts src/data/github-snapshot.json
git commit -m "feat: adiciona GitHub e presença pública"
~~~

---

### Task 8.5: Apresentar educação aplicada para empresas

**Files:**
- Modify: **src/types/site.ts**
- Modify: **src/data/site.ts**
- Modify: **src/data/site.test.ts**
- Create: **src/components/EducationSection.astro**
- Modify: **src/pages/index.astro**
- Modify: **tests/portfolio.spec.ts**

- [ ] Adicionar `Educação` à navegação e conteúdo tipado para treinamento in-company.
- [ ] Posicionar Educação depois do case Jarvis e antes do GitHub.
- [ ] Apresentar `7× mais rápido` e `Capacidade de 7 pessoas` como referências de método e alavancagem, sem promessa uniforme de resultado.
- [ ] Explicar o método em três etapas: diagnóstico da operação, prática aplicada e capacidade que permanece.
- [ ] Ligar a seção ao contato e provar os seis destinos da navegação no Playwright.
- [ ] Rodar testes unitários, E2E, check e build determinístico.

---

### Task 9: Aplicar motion contida e acessibilidade

**Files:**
- Modify: **src/layouts/BaseLayout.astro**
- Modify: **src/styles/motion.css**
- Modify: **src/components/MobileNav.tsx**
- Create: **tests/accessibility.spec.ts**
- Modify: **tests/portfolio.spec.ts**
- Modify: **package.json**

- [ ] **Step 1: Escrever os testes de acessibilidade e reduced motion**

Create **tests/accessibility.spec.ts**:

~~~typescript
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("não possui violações axe críticas ou sérias", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(blocking).toEqual([]);
});

test("mantém landmarks e um único h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
});
~~~

Add the accessibility gate to **package.json** now that its spec exists:

~~~json
"test:a11y": "playwright test tests/accessibility.spec.ts"
~~~

Append to **tests/portfolio.spec.ts**:

~~~typescript
test("reduced motion preserva todo o conteúdo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#jarvis").scrollIntoViewIfNeeded();
  await expect(page.locator(".message-jarvis")).toContainText("Prioridade encontrada");
  await expect(page.locator("#github")).toBeVisible();
});
~~~

- [ ] **Step 2: Rodar e observar falhas reais**

Run:

~~~bash
npx playwright test tests/accessibility.spec.ts --project=desktop
npx playwright test tests/portfolio.spec.ts --project=desktop
~~~

Expected: os testes revelam qualquer problema de semântica, foco ou conteúdo reduced motion antes da correção.

- [ ] **Step 3: Adicionar reveal progressivo sem bloquear conteúdo**

Append before the closing body in **src/layouts/BaseLayout.astro**:

~~~astro
<script>
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.dataset.visible = "true");
  } else {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -10% 0px" });

    targets.forEach((target) => observer.observe(target));
  }
</script>
~~~

Update **src/styles/motion.css**:

~~~css
[data-reveal] {
  opacity: 0;
  transform: translateY(1rem);
  transition:
    opacity 480ms var(--ease-out),
    transform 480ms var(--ease-out);
}

[data-reveal][data-visible="true"] {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: opacity 160ms linear;
  }
}
~~~

Apply **data-reveal** to exactly these four existing containers:

~~~astro
<div data-reveal>
  <h2 class="section-title">{siteContent.vision.title}</h2>
  <p class="body-large">{siteContent.vision.body}</p>
  <p class="signature">Leonardo Candiani, Maringá, PR</p>
</div>
~~~

~~~astro
<div class="work-heading" data-reveal>
~~~

~~~astro
<div class="jarvis-intro" data-reveal>
~~~

~~~astro
<div class="github-heading" data-reveal>
~~~

Do not apply reveal to cards or list rows.

- [ ] **Step 4: Corrigir foco do menu mobile**

Replace the initial focus effect in **MobileNav.tsx** and add trigger, sheet and previous-open refs:

~~~tsx
const triggerRef = useRef<HTMLButtonElement>(null);
const sheetRef = useRef<HTMLDivElement>(null);
const wasOpenRef = useRef(false);

useEffect(() => {
  if (open) {
    wasOpenRef.current = true;
    closeRef.current?.focus();
    return;
  }
  if (wasOpenRef.current) {
    triggerRef.current?.focus();
  }
}, [open]);

function handleSheetKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
  if (event.key === "Escape") {
    setOpen(false);
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = sheetRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
  if (!focusable?.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
~~~

Assign **ref={triggerRef}** to the Menu button. Assign **ref={sheetRef}** and **onKeyDown={handleSheetKeyDown}** to the dialog container. Keep **role="dialog"**, **aria-modal="true"** and the nested nav landmark shown in Task 4.

- [ ] **Step 5: Provar acessibilidade e reduced motion**

Run:

~~~bash
npx playwright test tests/accessibility.spec.ts --project=desktop
npx playwright test tests/portfolio.spec.ts --project=desktop
npx playwright test tests/portfolio.spec.ts --project=iphone
~~~

Expected: todos os testes PASS.

- [ ] **Step 6: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add src/layouts/BaseLayout.astro src/styles/motion.css src/components/MobileNav.tsx tests/accessibility.spec.ts tests/portfolio.spec.ts
git commit -m "feat: refina motion e acessibilidade"
~~~

---

### Task 10: Auditar slop e oportunidades de animação

**Files:**
- Create: **docs/animation-opportunities.md**
- Modify: only files confirmed by the audits

- [ ] **Step 1: Rodar o scanner kill-ai-slop**

Run:

~~~bash
node /Users/leonardolima/.claude/skills/kill-ai-slop/scripts/scan.mjs /Volumes/Code/leonardo-candiani-site
~~~

Expected: relatório agrupado por tell. Confirmar cada hit lendo o arquivo indicado.

- [ ] **Step 2: Triar e corrigir apenas slop confirmado**

Reject false positives such as the single purposeful translucent navigation layer. Fix confirmed hits by editing the shared token or component that owns the pattern. Re-run:

~~~bash
node /Users/leonardolima/.claude/skills/kill-ai-slop/scripts/scan.mjs /Volumes/Code/leonardo-candiani-site
~~~

Expected: zero slop confirmado; hits intencionais documentados com justificativa.

- [ ] **Step 3: Executar find-animation-opportunities em modo read-only**

Sweep:

- stack and existing motion tokens;
- conditional rendering in MobileNav and JarvisDemo;
- pressable elements;
- route and section transitions;
- list and GitHub rendering;
- reduced motion.

Write **docs/animation-opportunities.md** in the required three-part format:

1. Opportunities table with file and line evidence, purpose, frequency and exact motion values.
2. Two to five rejected candidates with the gate that rejected each.
3. Verdict naming the single highest-leverage opportunity.

Cap surviving suggestions at five. If nothing survives, state that plainly.

- [ ] **Step 4: Implementar apenas oportunidades sobreviventes**

For each surviving suggestion:

1. Add a failing Playwright or unit assertion when behavior is testable.
2. Implement exact duration, curve and properties from the report.
3. Add or confirm reduced motion behavior.
4. Run the focused test.

Do not implement a rejected candidate. Do not add bounce unless the user directly creates momentum.

- [ ] **Step 5: Checkpoint de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git add docs/animation-opportunities.md src tests
git commit -m "refactor: elimina slop e refina interações"
~~~

---

### Task 11: Verificar a entrega local e expor pelo Tailscale

**Files:**
- Modify: any file required to fix a verified failure

- [ ] **Step 1: Rodar todos os gates técnicos**

Run:

~~~bash
npm test
npm run check
npm run build
npx playwright test
test -f dist/sitemap-index.xml
test -f dist/robots.txt
~~~

Expected: todos os comandos exit 0.

- [ ] **Step 2: Verificar destinos externos reais**

Run:

~~~bash
for url in \
  https://github.com/leonardocandiani \
  https://youtube.com/@oleonardocandiani \
  https://instagram.com/leonardocandiani \
  https://wa.me/5544998893474
do
  status=$(curl -L -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url")
  echo "$status $url"
  test "$status" -ge 200
  test "$status" -lt 400
done
~~~

Expected: cada URL termina com status entre 200 e 399.

- [ ] **Step 3: Inspecionar desktop e iPhone em navegador real**

Open the local site in the browser and verify:

- Hero uses the correct photo and readable text.
- Navigation reaches every section.
- No horizontal overflow.
- Jarvis demo advances, reverses by direct selection and resets.
- GitHub renders real snapshot data.
- External links point to the expected destinations.
- Console has zero errors.
- Reduced motion preserves all information.

Capture screenshots at desktop and iPhone viewport for comparison. Fix every visible issue found and rerun the relevant check.

- [ ] **Step 4: Subir preview persistente**

Choose an unused port, then run the development server inside a named tmux session so it survives tool turns:

~~~bash
tmux new-session -d -s leonardo-site-preview "cd /Volumes/Code/leonardo-candiani-site && npm run dev -- --host 0.0.0.0 --port 4321"
~~~

Expected: tmux session **leonardo-site-preview** exists.

- [ ] **Step 5: Resolver o IP Tailscale local**

Run:

~~~bash
ifconfig | rg -B 3 -A 3 "inet 100\\."
~~~

Expected on the current MacBook Pro: **100.95.243.67**. Use the live command output rather than memory if it differs.

- [ ] **Step 6: Provar acesso pela malha**

Run locally:

~~~bash
curl -sS -o /dev/null -w "%{http_code}\n" http://100.95.243.67:4321/
~~~

Run from another Mac headless:

~~~bash
ssh mini "curl -sS -o /dev/null -w '%{http_code}\n' --connect-timeout 8 http://100.95.243.67:4321/"
~~~

Expected: HTTP 200 nos dois testes.

- [ ] **Step 7: Entregar a URL móvel**

Provide:

~~~text
http://100.95.243.67:4321
~~~

State that this is a local Tailscale preview, not a deploy.

- [ ] **Step 8: Checkpoint final de commit, condicionado à autorização**

Run only after explicit authorization:

~~~bash
git status --short
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts .gitignore public scripts src tests docs
git commit -m "feat: reconstrói o portfólio de Leonardo Candiani"
~~~

---

## Ordem de aceite

1. Conteúdo e hierarquia pessoal.
2. Fotografia e sistema visual.
3. Case Minino Jarvis.
4. GitHub com fallback.
5. Acessibilidade e motion.
6. Build e testes.
7. Inspeção visual real.
8. Acesso Tailscale comprovado externamente.

## Resultado esperado

Ao concluir o plano, **/Volumes/Code/leonardo-candiani-site** contém uma aplicação Astro estática, testada e navegável. Leonardo é o centro da narrativa, o Minino Jarvis aparece como case principal, o GitHub mostra trabalho open source recente e a URL local funciona no iPhone conectado ao Tailscale. Nenhum deploy, push ou commit é declarado sem autorização correspondente.
