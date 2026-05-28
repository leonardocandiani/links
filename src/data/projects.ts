// Vitrine tecnica curada a partir do perfil GitHub.
// A maioria dos projetos do cluster e privada (operacao real de cliente),
// entao a curadoria vive aqui. Repos publicos linkam direto.

export interface Project {
  name: string;
  blurb: string;
  tags: string[];
  url?: string;
  openSource?: boolean;
}

export interface Cluster {
  id: string;
  label: string;
  tagline: string;
  projects: Project[];
}

export const clusters: Cluster[] = [
  {
    id: 'agents',
    label: 'Agentes & Orquestração',
    tagline: 'O núcleo. IA que conversa, decide e fecha negócio.',
    projects: [
      {
        name: 'SixClaw',
        blurb:
          'Plataforma de orquestração de agentes que liga IA aos fluxos de venda e atendimento. Vira o "Jarvis" da empresa: filtra, prioriza, responde e delega 24 horas por dia.',
        tags: ['AI Agents', 'WhatsApp', 'Claude', 'Bun'],
      },
      {
        name: 'SegsClaw',
        blurb:
          'Plataforma multi-agente em WhatsApp e Telegram que opera a SegSmart e a Proteauto no dia a dia. Vários agentes dividindo o trabalho, cada um na sua função.',
        tags: ['Multi-agent', 'WhatsApp', 'Telegram'],
      },
      {
        name: 'zapmentor',
        blurb:
          'Mentoria e automação direto no WhatsApp, com CLI próprio pra operar tudo pela linha de comando.',
        tags: ['WhatsApp', 'Mentoria', 'CLI'],
      },
    ],
  },
  {
    id: 'proteauto',
    label: 'Cluster Proteauto',
    tagline: 'Proteção veicular operada ponta a ponta por agentes de IA.',
    projects: [
      {
        name: 'proteauto-crm',
        blurb: 'CRM feito sob medida pra proteção veicular, do lead ao contrato.',
        tags: ['CRM', 'Next.js', 'Supabase'],
      },
      {
        name: 'proteauto-cliente',
        blurb:
          'Cotação automática de proteção veicular pra caminhões, com o agente conduzindo a conversa até o fechamento.',
        tags: ['Cotação', 'Bots', 'Caminhões'],
      },
      {
        name: 'proteauto-admin',
        blurb:
          'PWA de vistoria digital com captura guiada de fotos. O cliente fotografa o veículo e a IA valida na hora.',
        tags: ['PWA', 'Computer Vision', 'Vistoria'],
      },
      {
        name: 'dashboard-proteauto',
        blurb:
          'Dashboard gamificado pra rodar na TV do escritório, acompanhando venda em tempo real.',
        tags: ['Dashboard', 'Realtime', 'TV'],
      },
      {
        name: 'sdr-proteauto',
        blurb:
          'Monorepo do SDR com arquitetura Cote.Zap: pipeline de equalização em 12 camadas e auto-review no CI/CD.',
        tags: ['SDR', 'Monorepo', 'CI/CD'],
      },
      {
        name: 'sdr-advertorial',
        blurb:
          'Portal advertorial que alimenta o funil de SDR pra caminhoneiros, com PIX inline na própria página.',
        tags: ['Advertorial', 'Funil', 'PIX'],
      },
    ],
  },
  {
    id: 'voice',
    label: 'Voz & Multi-canal',
    tagline: 'Agentes que falam, ouvem e atendem em qualquer canal.',
    projects: [
      {
        name: 'mininoweb',
        blurb:
          'Interface web de agente de voz no estilo Jarvis. Next.js com ElevenLabs por WebRTC e visual em Three.js.',
        tags: ['Voice', 'Three.js', 'ElevenLabs'],
      },
      {
        name: 'alexa-minino-jarvis',
        blurb:
          'Skill da Alexa com voz ElevenLabs e classificador próprio, disparando ações em background pelo WhatsApp.',
        tags: ['Alexa', 'Voice', 'WhatsApp'],
      },
      {
        name: 'call-flow-insight',
        blurb:
          'Dashboard que analisa fluxo de chamadas e cadência de ligação pra afinar a operação de telefonia.',
        tags: ['Voice', 'Analytics', 'Telefonia'],
      },
    ],
  },
  {
    id: 'cli',
    label: 'CLIs Agent-First',
    tagline: 'Ferramentas pipe-friendly, feitas pra rodar dentro de agentes.',
    projects: [
      {
        name: 'uazapi-cli',
        blurb:
          'CLI sobre a API de WhatsApp da UAZAPI. Mais de 105 endpoints, pensada pra encadear em pipe.',
        tags: ['WhatsApp', 'CLI', '105+ endpoints'],
      },
      {
        name: 'moskit-cli',
        blurb:
          'CLI do CRM Moskit V2 pra análise gerencial. Feita em Bun com Commander e formato AXI.',
        tags: ['CRM', 'Bun', 'AXI'],
      },
      {
        name: 'metaads-cli',
        blurb:
          'CLI da Meta Marketing API na Graph v21. Read-only por decisão de projeto, com perfis que cruzam empresas.',
        tags: ['Meta Ads', 'Graph API', 'Read-only'],
      },
    ],
  },
  {
    id: 'oss',
    label: 'Open Source',
    tagline: 'O que eu construo e devolvo pra comunidade.',
    projects: [
      {
        name: 'setup-projeto-qualidade',
        blurb:
          'Skill do Claude Code que aplica arquitetura de qualidade alta em qualquer projeto git: rules estruturadas, CI/CD com auto-review e deploy adaptado à stack.',
        tags: ['Claude Code', 'CI/CD', 'TypeScript'],
        url: 'https://github.com/leonardocandiani/setup-projeto-qualidade',
        openSource: true,
      },
      {
        name: 'glint',
        blurb:
          'Status line liquid-glass pra CLI do Claude Code: pill com gradiente de vidro, tracking de contexto e cor por nível de esforço.',
        tags: ['Claude Code', 'Shell', 'CLI'],
        url: 'https://github.com/leonardocandiani/glint',
        openSource: true,
      },
      {
        name: 'overclocked',
        blurb:
          'Guia de tuning do Claude Code baseado no código-fonte de verdade. Nasceu de rodar várias instâncias em paralelo no dia a dia.',
        tags: ['Claude Code', 'Guia', 'DX'],
        openSource: true,
      },
    ],
  },
  {
    id: 'dashboards',
    label: 'Dashboards & Dados',
    tagline: 'Operação visível, decisão na ponta dos dedos.',
    projects: [
      {
        name: 'dashboard-segsmart',
        blurb:
          'Acompanhamento de vendas da SegSmart, na versão Web Plus e na versão SaaS.',
        tags: ['Vendas', 'SaaS', 'Dashboard'],
      },
      {
        name: 'hinova-api',
        blurb:
          'Espelho da API Hinova SGA com dashboard. Next.js e Supabase, com sync em Python rodando por trás.',
        tags: ['Next.js', 'Supabase', 'Python'],
      },
      {
        name: 'instainsight',
        blurb: 'Leitura de insights do Instagram pra entender o que engaja de verdade.',
        tags: ['Instagram', 'Analytics'],
      },
    ],
  },
];
