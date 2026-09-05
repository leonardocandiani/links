import type { SiteContent } from "../types/site";

export const siteContent = {
  navigation: [
    { label: "Sobre", href: "#sobre" },
    { label: "Repertório", href: "#repertorio" },
    { label: "Jarvis", href: "#jarvis" },
    { label: "Educação", href: "#educacao" },
    { label: "Open source", href: "#github" },
    { label: "YouTube", href: "#youtube" },
    { label: "Contato", href: "#contato" }
  ],
  hero: {
    name: "Leonardo Candiani",
    eyebrow: "Liderança, tecnologia e educação",
    title: "Construo a inteligência que faz empresas agirem.",
    limitWord: "agirem.",
    description: "Lidero pessoas e construo sistemas de IA para transformar o que uma empresa sabe no que ela consegue fazer."
  },
  about: {
    title: "Operação antes do hype.",
    lead: "Minha atuação conecta liderança, produto e engenharia. Entender a operação, dar direção às pessoas e construir a tecnologia que faz o trabalho avançar.",
    body: [
      "Sou formado em Administração, cofundador da SixQuasar e construo tecnologia dentro de operações reais. Trabalho entre estratégia, produto e engenharia, do problema empresarial até o sistema em produção.",
      "Proteauto, SegSmart, IACall e os projetos da SixQuasar formam meu laboratório diário. O que aprendo construindo agentes, CRMs, automações, produtos e infraestrutura também vira ferramenta aberta e conteúdo público."
    ],
    quote: "Colocar para funcionar vence a perfeição. Resolver o problema real vence a apresentação.",
    stats: [
      { value: "2018", label: "automação na prática" },
      { value: "2019", label: "IA aplicada a negócios" },
      { value: "4", label: "frentes em operação" }
    ]
  },
  culture: {
    eyebrow: "Nossa cultura",
    title: "O que nos limita é a nossa criatividade.",
    limitWord: "criatividade.",
    description:
      "Criatividade, para mim, é repertório aplicado: enxergar possibilidades, testar caminhos e transformar ideias em capacidade real.",
    imageCaption: "Uma ideia deixa de ser abstrata quando alguém começa a construí-la.",
    bridgeTitle: "Uma cultura que se transforma em trabalho.",
    echoes: [
      {
        label: "Repertório",
        title: "Mais referências, mais caminhos possíveis.",
        description: "Estratégia, produto, tecnologia e execução convivem no mesmo raciocínio."
      },
      {
        label: "Minino Jarvis",
        title: "Informação vira capacidade empresarial.",
        description:
          "Diretores e gestores acessam a empresa pelo WhatsApp e aceleram decisões e desenvolvimento."
      },
      {
        label: "Educação",
        title: "O repertório deixa de ficar concentrado.",
        description:
          "Treinamento coloca novas ferramentas nas mãos das equipes para que elas próprias criem soluções."
      }
    ]
  },
  repertoire: {
    title: "Um repertório construído em operação.",
    description: "Não separo negócio, produto e tecnologia. Navegue pelas frentes que conecto para tirar uma ideia da conversa e colocá-la funcionando.",
    areas: [
      {
        id: "operacao",
        label: "Operação & negócio",
        title: "Tecnologia começa entendendo onde a empresa perde tempo, margem ou velocidade.",
        description: "Atuo perto de diretores e gestores para transformar gargalos em sistemas mensuráveis, com responsabilidade sobre a adoção e o resultado.",
        items: [
          { title: "SixQuasar", description: "Produtos, operações digitais e sistemas de IA construídos para empresas reais." },
          { title: "Proteauto", description: "Cotação, vistoria, CRM e inteligência comercial para proteção veicular." },
          { title: "SegSmart", description: "Automação de atendimento e vendas pelo canal onde o cliente já está." },
          { title: "IACall", description: "Agentes de voz e análise de conversas integrados à operação." }
        ],
        tools: ["Estratégia", "Processos", "Produto", "Métricas", "Go-to-market"]
      },
      {
        id: "agentes",
        label: "Agentes & automação",
        title: "Agentes que conversam, consultam, decidem e executam com contexto.",
        description: "Desenho arquiteturas com ferramentas, memória, permissões e observabilidade para sair do chatbot genérico e chegar a uma capacidade operacional.",
        items: [
          { title: "Minino Jarvis", description: "A empresa disponível para diretores e gestores dentro do WhatsApp." },
          { title: "Operações multicanal", description: "Agentes coordenados em WhatsApp, Telegram, voz e sistemas internos." },
          { title: "Harnesses próprios", description: "Camadas de execução que tornam modelos úteis, seguros e repetíveis." },
          { title: "RAG e MCP", description: "Contexto e ferramentas conectados ao fluxo real de trabalho." }
        ],
        tools: ["Claude", "OpenAI", "MCP", "LangChain", "n8n", "ElevenLabs"]
      },
      {
        id: "produto",
        label: "Produto & engenharia",
        title: "Da interface ao processo de fundo, construo o produto inteiro.",
        description: "Minha engenharia é orientada pelo uso. A interface precisa reduzir atrito, a arquitetura precisa suportar evolução e o deploy precisa fechar o ciclo.",
        items: [
          { title: "Produtos SaaS", description: "CRMs, plataformas comerciais e painéis de gestão." },
          { title: "Experiências guiadas", description: "Vistoria digital, cotação e onboarding com validação por IA." },
          { title: "Ferramentas agent-first", description: "CLIs para UAZAPI, CRM, anúncios e rotinas compostas por agentes." },
          { title: "Open source para macOS", description: "Captura, automação e utilitários nativos para ampliar o trabalho." }
        ],
        tools: ["TypeScript", "Next.js", "React", "Node.js", "Python", "Swift"]
      },
      {
        id: "infra",
        label: "Dados & infraestrutura",
        title: "Sistemas rápidos de usar e sóbrios de operar.",
        description: "Escolho a infraestrutura pelo fluxo que ela precisa sustentar, com dados acessíveis, integrações observáveis e automações recuperáveis.",
        items: [
          { title: "Dados operacionais", description: "PostgreSQL, Supabase, Redis e modelos orientados ao negócio." },
          { title: "Infraestrutura web", description: "Cloudflare, Vercel, Railway, Docker e serviços conectados." },
          { title: "Mensageria", description: "WhatsApp Business, UAZAPI, Evolution API e Telegram." },
          { title: "Observabilidade", description: "Logs, rastreabilidade e sinais que ajudam a agir antes da falha." }
        ],
        tools: ["PostgreSQL", "Supabase", "Redis", "Cloudflare", "Vercel", "Docker"]
      },
      {
        id: "educacao",
        label: "Conteúdo & educação",
        title: "O conhecimento só vale quando outra pessoa consegue usar.",
        description: "Transformo prática de campo em treinamento, conteúdo e playbooks que aumentam a autonomia de profissionais e equipes.",
        items: [
          { title: "Treinamento in-company", description: "IA aplicada aos gargalos e decisões da própria empresa." },
          { title: "YouTube", description: "Bastidores, ferramentas e aprendizados sem esconder o processo." },
          { title: "Mente Conectada", description: "Comunidade para desenvolver repertório e capacidade com IA." },
          { title: "Playbooks", description: "Padrões que permanecem utilizáveis depois do treinamento." }
        ],
        tools: ["Workshops", "Mentoria", "Conteúdo", "Comunidade", "Playbooks"]
      }
    ]
  },
  jarvis: {
    eyebrow: "Case de sucesso",
    title: "Pergunte à sua empresa. Ela responde no WhatsApp.",
    description:
      "O Minino Jarvis coloca informações conectadas da operação na palma de diretores e gestores, para investigar, decidir e acelerar novas capacidades sem sair da conversa.",
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
  education: {
    eyebrow: "Educação aplicada para empresas",
    title: "Elevar o nível das pessoas muda o limite da empresa.",
    description:
      "Desenho e conduzo treinamentos in-company para transformar IA em capacidade prática: mais repertório, autonomia e velocidade para resolver problemas reais da operação.",
    leverage: [
      {
        metric: "7×",
        title: "Aprender mais rápido",
        description: "Ciclos curtos de prática, feedback e IA comprimem o caminho entre não saber e conseguir aplicar."
      },
      {
        metric: "1 → 7",
        title: "Capacidade de 7 pessoas",
        description:
          "Agentes, automações e sistemas ajudam cada colaborador a operar com a alavancagem de uma pequena equipe, sem multiplicar horas."
      }
    ],
    method: [
      {
        number: "01",
        title: "Diagnóstico da operação",
        description: "O treinamento começa nos gargalos, ferramentas e decisões que a equipe já enfrenta."
      },
      {
        number: "02",
        title: "Prática aplicada",
        description: "Cada conceito vira exercício, workflow e uso real de IA dentro do contexto da empresa."
      },
      {
        number: "03",
        title: "Capacidade que permanece",
        description: "Playbooks e padrões deixam o conhecimento utilizável depois do encontro."
      }
    ],
    note:
      "7× é uma referência de desenho e alavancagem do programa. O resultado depende do contexto, da adesão e da execução de cada equipe.",
    ctaLabel: "Levar o treinamento para minha empresa"
  },
  links: [
    { label: "GitHub", href: "https://github.com/leonardocandiani" },
    { label: "YouTube", href: "https://youtube.com/@oleonardocandiani" },
    { label: "Instagram", href: "https://instagram.com/leonardocandiani" },
    { label: "WhatsApp", href: "https://wa.me/5544998893474" }
  ]
} satisfies SiteContent;
