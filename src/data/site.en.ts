import type { SiteContent } from "../types/site";

export const siteContentEn = {
  navigation: [
    { label: "About", href: "#sobre" },
    { label: "Capabilities", href: "#repertorio" },
    { label: "Jarvis", href: "#jarvis" },
    { label: "Education", href: "#educacao" },
    { label: "Open source", href: "#github" },
    { label: "Contact", href: "#contato" }
  ],
  hero: {
    name: "Leonardo Candiani",
    eyebrow: "Founder and applied AI operator",
    title: "I build the intelligence that helps companies act.",
    limitWord: "act.",
    description: "Systems, agents, and products that connect context, decisions, and execution in the real world."
  },
  about: {
    title: "Operations before hype.",
    lead: "Automation since 2018, artificial intelligence since 2019, and one constant obsession: turning manual process into systems that run on their own.",
    body: [
      "I have a background in Business Administration, I am a cofounder of SixQuasar, and I build technology inside real operations. My work sits between strategy, product, and engineering, from the business problem to the system in production.",
      "Proteauto, SegSmart, IACall, and SixQuasar projects are my daily lab. What I learn while building agents, CRMs, automations, products, and infrastructure also becomes open tooling and public content."
    ],
    quote: "Making it work beats perfecting the presentation. Solving the real problem beats performing for the room.",
    stats: [
      { value: "2018", label: "automation in practice" },
      { value: "2019", label: "AI applied to business" },
      { value: "4", label: "operating fronts" }
    ]
  },
  culture: {
    eyebrow: "Our culture",
    title: "What limits us is our creativity.",
    limitWord: "creativity.",
    description:
      "To me, creativity is applied range: seeing possibilities, testing paths, and turning ideas into real capability.",
    imageCaption: "An idea stops being abstract when someone starts building it.",
    bridgeTitle: "The line opens the idea. The next sections show what it produces.",
    echoes: [
      {
        label: "Capabilities",
        title: "More references, more possible paths.",
        description: "Strategy, product, technology, and execution live inside the same line of thought."
      },
      {
        label: "Minino Jarvis",
        title: "Information becomes business capability.",
        description:
          "Directors and managers access the company through WhatsApp and accelerate decisions and development."
      },
      {
        label: "Education",
        title: "Capability stops being concentrated in a few people.",
        description:
          "Training puts new tools in the hands of teams so they can create solutions themselves."
      }
    ]
  },
  repertoire: {
    title: "A range of capabilities built in operation.",
    description: "I do not separate business, product, and technology. Explore the fronts I connect to move an idea from conversation into production.",
    areas: [
      {
        id: "operacao",
        label: "Operations & business",
        title: "Technology starts by understanding where a company loses time, margin, or speed.",
        description: "I work close to owners, directors, and managers to turn bottlenecks into measurable systems, with responsibility for adoption and results.",
        items: [
          { title: "SixQuasar", description: "Products, digital operations, and AI systems built for real companies." },
          { title: "Proteauto", description: "Quoting, inspection, CRM, and commercial intelligence for vehicle protection." },
          { title: "SegSmart", description: "Customer service and sales automation in the channel where the customer already is." },
          { title: "IACall", description: "Voice agents and conversation analysis integrated into the operation." }
        ],
        tools: ["Strategy", "Processes", "Product", "Metrics", "Go-to-market"]
      },
      {
        id: "agentes",
        label: "Agents & automation",
        title: "Agents that talk, query, decide, and execute with context.",
        description: "I design architectures with tools, memory, permissions, and observability to move beyond generic chatbots and create operational capability.",
        items: [
          { title: "Minino Jarvis", description: "The company available to directors and managers inside WhatsApp." },
          { title: "Multichannel operations", description: "Coordinated agents across WhatsApp, Telegram, voice, and internal systems." },
          { title: "Custom harnesses", description: "Execution layers that make models useful, safe, and repeatable." },
          { title: "RAG and MCP", description: "Context and tools connected to the real workflow." }
        ],
        tools: ["Claude", "OpenAI", "MCP", "LangChain", "n8n", "ElevenLabs"]
      },
      {
        id: "produto",
        label: "Product & engineering",
        title: "From interface to background process, I build the whole product.",
        description: "My engineering is driven by use. The interface has to reduce friction, the architecture has to support evolution, and the deployment has to close the loop.",
        items: [
          { title: "SaaS products", description: "CRMs, commercial platforms, and management dashboards." },
          { title: "Guided experiences", description: "Digital inspection, quoting, and onboarding with AI validation." },
          { title: "Agent-first tools", description: "CLIs for UAZAPI, CRM, ads, and routines composed by agents." },
          { title: "Open source for macOS", description: "Capture, automation, and native utilities that extend work." }
        ],
        tools: ["TypeScript", "Next.js", "React", "Node.js", "Python", "Swift"]
      },
      {
        id: "infra",
        label: "Data & infrastructure",
        title: "Systems that are fast to use and sober to operate.",
        description: "I choose infrastructure based on the flow it needs to sustain, with accessible data, observable integrations, and recoverable automations.",
        items: [
          { title: "Operational data", description: "PostgreSQL, Supabase, Redis, and business-oriented models." },
          { title: "Web infrastructure", description: "Cloudflare, Vercel, Railway, Docker, and connected services." },
          { title: "Messaging", description: "WhatsApp Business, UAZAPI, Evolution API, and Telegram." },
          { title: "Observability", description: "Logs, traceability, and signals that help teams act before failure." }
        ],
        tools: ["PostgreSQL", "Supabase", "Redis", "Cloudflare", "Vercel", "Docker"]
      },
      {
        id: "educacao",
        label: "Content & education",
        title: "Knowledge only matters when someone else can use it.",
        description: "I turn field practice into training, content, and playbooks that increase autonomy for professionals and teams.",
        items: [
          { title: "In-company training", description: "AI applied to the bottlenecks and decisions of the company itself." },
          { title: "YouTube", description: "Behind the scenes, tools, and lessons without hiding the process." },
          { title: "Mente Conectada", description: "A community for developing range and capability with AI." },
          { title: "Playbooks", description: "Patterns that remain usable after the training session." }
        ],
        tools: ["Workshops", "Mentoring", "Content", "Community", "Playbooks"]
      }
    ]
  },
  jarvis: {
    eyebrow: "Success case",
    title: "Ask your company. It answers on WhatsApp.",
    description:
      "Minino Jarvis puts connected operational information in the hands of directors and managers, so they can investigate, decide, and accelerate new capabilities without leaving the conversation.",
    steps: [
      {
        id: "question",
        label: "Question",
        title: "The manager asks naturally.",
        description: "No new dashboard, just natural-language queries inside WhatsApp."
      },
      {
        id: "perception",
        label: "Perception",
        title: "Jarvis queries the company.",
        description: "Connected sources and systems provide the signals needed."
      },
      {
        id: "context",
        label: "Context",
        title: "Custom harnesses organize the answer.",
        description: "Tools, memory, and rules turn scattered data into understanding."
      },
      {
        id: "action",
        label: "Action",
        title: "The decision can become execution.",
        description: "The manager receives context, risks, next steps, and authorized actions."
      }
    ]
  },
  education: {
    eyebrow: "Applied education for companies",
    title: "Raising people's level changes the company's limits.",
    description:
      "I design and lead in-company training that turns AI into practical capability: more range, autonomy, and speed to solve real operational problems.",
    leverage: [
      {
        metric: "7x",
        title: "Learn faster",
        description: "Short cycles of practice, feedback, and AI compress the path between not knowing and being able to apply."
      },
      {
        metric: "1 to 7",
        title: "The capacity of 7 people",
        description:
          "Agents, automations, and systems help each team member operate with the leverage of a small team, without multiplying hours."
      }
    ],
    method: [
      {
        number: "01",
        title: "Operational diagnosis",
        description: "Training starts with the bottlenecks, tools, and decisions the team already faces."
      },
      {
        number: "02",
        title: "Applied practice",
        description: "Every concept becomes an exercise, workflow, and real use of AI inside the company's context."
      },
      {
        number: "03",
        title: "Capability that remains",
        description: "Playbooks and patterns keep the knowledge usable after the session."
      }
    ],
    note:
      "7x is a program design and leverage reference. Results depend on each team's context, adoption, and execution.",
    ctaLabel: "Bring this training to my company"
  },
  links: [
    { label: "GitHub", href: "https://github.com/leonardocandiani" },
    { label: "YouTube", href: "https://youtube.com/@oleonardocandiani" },
    { label: "Instagram", href: "https://instagram.com/leonardocandiani" },
    { label: "WhatsApp", href: "https://wa.me/5544998893474" }
  ]
} satisfies SiteContent;
