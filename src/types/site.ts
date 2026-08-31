export type PublicLink = {
  label: string;
  href: string;
};

export type SiteLocale = "pt-BR" | "en";

export type AboutStat = {
  value: string;
  label: string;
};

export type RepertoireItem = {
  title: string;
  description: string;
};

export type CultureEcho = {
  label: string;
  title: string;
  description: string;
};

export type RepertoireArea = {
  id: string;
  label: string;
  title: string;
  description: string;
  items: RepertoireItem[];
  tools: string[];
};

export type JarvisStep = {
  id: "question" | "perception" | "context" | "action";
  label: string;
  title: string;
  description: string;
};

export type EducationLeverage = {
  metric: string;
  title: string;
  description: string;
};

export type EducationMethodStep = {
  number: string;
  title: string;
  description: string;
};

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

export type SiteContent = {
  navigation: PublicLink[];
  hero: {
    name: string;
    eyebrow: string;
    title: string;
    limitWord: string;
    description: string;
  };
  about: {
    title: string;
    lead: string;
    body: string[];
    quote: string;
    stats: AboutStat[];
  };
  culture: {
    eyebrow: string;
    title: string;
    limitWord: string;
    description: string;
    imageCaption: string;
    bridgeTitle: string;
    echoes: [CultureEcho, CultureEcho, CultureEcho];
  };
  repertoire: {
    title: string;
    description: string;
    areas: RepertoireArea[];
  };
  jarvis: {
    eyebrow: string;
    title: string;
    description: string;
    steps: JarvisStep[];
  };
  education: {
    eyebrow: string;
    title: string;
    description: string;
    leverage: [EducationLeverage, EducationLeverage];
    method: [EducationMethodStep, EducationMethodStep, EducationMethodStep];
    note: string;
    ctaLabel: string;
  };
  links: PublicLink[];
};
