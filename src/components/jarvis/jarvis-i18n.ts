import type { JarvisStep } from "./jarvis-machine";
import type { JarvisScenario, JarvisScenarioId } from "./jarvis-scenarios";

export type JarvisLocale = "pt-BR" | "en";

type JarvisUiCopy = {
  statusTextByStep: Record<JarvisStep, string>;
  toolbar: {
    title: string;
    live: string;
  };
  control: {
    kicker: string;
    title: string;
    copy: string;
    scenariosAriaLabel: string;
    questionLabel: string;
    questionPlaceholder: string;
    submitButton: string;
    demoNote: string;
  };
  phone: {
    ariaLabel: string;
    avatar: string;
    name: string;
    availability: string;
    secure: string;
    inputPlaceholder: string;
    sendSymbol: string;
  };
  idle: {
    title: string;
    copy: string;
  };
  thinking: {
    title: string;
    live: string;
  };
  tools: {
    ariaLabel: string;
  };
  sources: {
    ariaLabel: string;
  };
  approval: {
    confidence: string;
    authorizeButton: string;
    askAgainButton: string;
  };
  executing: {
    ariaLabel: string;
    taskStatus: string;
  };
  success: {
    title: string;
    askAgainButton: string;
  };
  unsupported: {
    title: string;
    copy: string;
    button: string;
  };
  backstage: {
    ariaLabel: string;
    title: string;
    runStatus: string;
    code: {
      declaration: string;
      variable: string;
      assignment: string;
      awaitedNamespace: string;
      awaitedMethod: string;
      awaitedArgument: string;
      returnKeyword: string;
      returnVariable: string;
      approvalMethod: string;
    };
  };
};

const ptBrScenarios = {
  operation: {
    id: "operation",
    domain: "operação",
    shortQuestion: "Onde preciso agir hoje?",
    question: "Como está nossa operação hoje e onde preciso agir primeiro?",
    answerTitle: "Prioridade encontrada",
    answer:
      "Conversas qualificadas estão aguardando retorno. A prioridade é recuperar as oportunidades que já demonstraram intenção de compra antes de abrir novas frentes.",
    actionTitle: "Quer que eu organize a recuperação?",
    action:
      "Distribuir as conversas entre os responsáveis, avisar os gestores e acompanhar cada retorno.",
    tools: ["crm.oportunidades", "whatsapp.pendências", "metas.semanais"],
    traces: ["CRM consultado", "Conversas cruzadas", "Metas comparadas"],
    sources: ["CRM / pipeline", "WhatsApp / conversas", "Metas / semana"],
    tasks: ["Responsáveis definidos", "Gestores avisados", "Acompanhamento criado"],
    success: "Contatos distribuídos, gestores avisados e acompanhamento criado."
  },
  sales: {
    id: "sales",
    domain: "comercial",
    shortQuestion: "O que mudou no comercial?",
    question: "O que mudou no comercial nesta semana?",
    answerTitle: "O gargalo mudou de lugar",
    answer:
      "A entrada de oportunidades cresceu, mas a conversão perdeu velocidade na passagem para proposta. O ganho mais imediato está em reduzir o intervalo entre diagnóstico e envio comercial.",
    actionTitle: "Quer acelerar as propostas pendentes?",
    action:
      "Priorizar as oportunidades maduras, preparar os dados e entregar a fila aos gestores responsáveis.",
    tools: ["crm.funil", "vendas.conversões", "metas.período"],
    traces: ["Funil consolidado", "Conversão calculada", "Desvio priorizado"],
    sources: ["CRM / funil", "Vendas / conversão", "Metas / período"],
    tasks: ["Oportunidades priorizadas", "Dados preparados", "Gestores responsáveis avisados"],
    success: "Fila priorizada, responsáveis definidos e prazos de retorno acompanhados."
  },
  team: {
    id: "team",
    domain: "equipe",
    shortQuestion: "Qual equipe pede atenção?",
    question: "Qual equipe precisa de atenção hoje?",
    answerTitle: "Atenção na equipe de atendimento",
    answer:
      "A equipe de atendimento mantém a entrega, mas concentrou pendências em poucas pessoas. Redistribuir agora evita atraso sem aumentar jornada ou comprometer a qualidade.",
    actionTitle: "Quer que eu proponha a redistribuição?",
    action:
      "Montar a redistribuição pela capacidade atual e enviar a proposta aos gestores para aprovação.",
    tools: ["tarefas.capacidade", "sla.atendimento", "gestão.pendências"],
    traces: ["Capacidade lida", "SLA comparado", "Sobrecarga detectada"],
    sources: ["Tarefas / capacidade", "Atendimento / SLA", "Gestão / pendências"],
    tasks: ["Capacidade organizada", "Redistribuição proposta", "Gestores chamados para validar"],
    success: "Redistribuição proposta e enviada para validação dos gestores."
  }
} satisfies Record<JarvisScenarioId, JarvisScenario>;

const enScenarios = {
  operation: {
    id: "operation",
    domain: "operations",
    shortQuestion: "Where should I act today?",
    question: "How are operations today, and where should I act first?",
    answerTitle: "Priority found",
    answer:
      "Qualified conversations are waiting for follow-up. The priority is to recover opportunities that have already shown buying intent before opening new fronts.",
    actionTitle: "Should I organize the recovery?",
    action:
      "Distribute the conversations among the owners, notify managers and track each follow-up.",
    tools: ["crm.opportunities", "whatsapp.pending", "goals.weekly"],
    traces: ["CRM checked", "Conversations matched", "Goals compared"],
    sources: ["CRM / pipeline", "WhatsApp / conversations", "Goals / week"],
    tasks: ["Owners assigned", "Managers notified", "Tracking created"],
    success: "Contacts distributed, managers notified and tracking created."
  },
  sales: {
    id: "sales",
    domain: "sales",
    shortQuestion: "What changed in sales?",
    question: "What changed in sales this week?",
    answerTitle: "The bottleneck moved",
    answer:
      "Opportunity intake increased, but conversion slowed on the way to proposal. The fastest gain is reducing the gap between diagnosis and commercial follow-up.",
    actionTitle: "Should I speed up pending proposals?",
    action:
      "Prioritize mature opportunities, prepare the data and hand the queue to the responsible managers.",
    tools: ["crm.funnel", "sales.conversions", "goals.period"],
    traces: ["Funnel consolidated", "Conversion calculated", "Deviation prioritized"],
    sources: ["CRM / funnel", "Sales / conversion", "Goals / period"],
    tasks: ["Opportunities prioritized", "Data prepared", "Responsible managers notified"],
    success: "Queue prioritized, owners assigned and response deadlines tracked."
  },
  team: {
    id: "team",
    domain: "team",
    shortQuestion: "Which team needs attention?",
    question: "Which team needs attention today?",
    answerTitle: "Support team needs attention",
    answer:
      "The support team is still delivering, but pending work is concentrated among a few people. Redistributing now avoids delays without increasing hours or compromising quality.",
    actionTitle: "Should I propose the redistribution?",
    action:
      "Build the redistribution from current capacity and send the proposal to managers for approval.",
    tools: ["tasks.capacity", "sla.support", "management.pending"],
    traces: ["Capacity read", "SLA compared", "Overload detected"],
    sources: ["Tasks / capacity", "Support / SLA", "Management / pending"],
    tasks: ["Capacity organized", "Redistribution proposed", "Managers asked to validate"],
    success: "Redistribution proposed and sent for manager validation."
  }
} satisfies Record<JarvisScenarioId, JarvisScenario>;

export const jarvisScenariosByLocale = {
  "pt-BR": ptBrScenarios,
  en: enScenarios
} satisfies Record<JarvisLocale, Record<JarvisScenarioId, JarvisScenario>>;

export const jarvisUiByLocale = {
  "pt-BR": {
    statusTextByStep: {
      idle: "Demonstração pronta para uma pergunta.",
      question: "Pergunta enviada pelo diretor.",
      consulting: "Jarvis consultando as fontes conectadas.",
      answering: "Jarvis organizando a resposta empresarial.",
      approval: "Recomendação pronta para aprovação humana.",
      executing: "Ação autorizada e em execução.",
      success: "Execução confirmada e acompanhada.",
      unsupported: "Pergunta fora do escopo desta demonstração local."
    },
    toolbar: {
      title: "MININO JARVIS / DEMONSTRAÇÃO",
      live: "canal seguro ativo"
    },
    control: {
      kicker: "Escolha uma pergunta",
      title: "A empresa inteira dentro de uma conversa.",
      copy:
        "O diretor pergunta. O Jarvis encontra contexto, mostra a origem da informação e transforma decisão em ação.",
      scenariosAriaLabel: "Perguntas demonstrativas",
      questionLabel: "Pergunta para o Minino Jarvis",
      questionPlaceholder: "Pergunte sobre operação, comercial ou equipe",
      submitButton: "Enviar",
      demoNote: "Dados demonstrativos para explicar a experiência."
    },
    phone: {
      ariaLabel: "Simulação do Minino Jarvis no WhatsApp",
      avatar: "MJ",
      name: "Minino Jarvis",
      availability: "online pelo WhatsApp",
      secure: "harness ativo",
      inputPlaceholder: "Mensagem",
      sendSymbol: "↑"
    },
    idle: {
      title: "Faça uma pergunta de negócio",
      copy: "O Jarvis responde com contexto e uma próxima ação."
    },
    thinking: {
      title: "Consultando a empresa",
      live: "ao vivo"
    },
    tools: {
      ariaLabel: "Fontes consultadas"
    },
    sources: {
      ariaLabel: "Origem das informações"
    },
    approval: {
      confidence: "confiança alta / aprovação humana",
      authorizeButton: "Autorizar ação",
      askAgainButton: "Escolher outra pergunta"
    },
    executing: {
      ariaLabel: "Ações em execução",
      taskStatus: "concluindo"
    },
    success: {
      title: "Ação iniciada e acompanhada",
      askAgainButton: "Fazer outra pergunta"
    },
    unsupported: {
      title: "Esta demonstração tem um recorte claro.",
      copy:
        "Ela responde exemplos sobre operação, comercial e equipe. O Jarvis real usa as fontes conectadas de cada empresa.",
      button: "Ver perguntas disponíveis"
    },
    backstage: {
      ariaLabel: "Bastidores técnicos da consulta",
      title: "trace empresarial",
      runStatus: "run_live",
      code: {
        declaration: "const",
        variable: "decisão",
        assignment: "=",
        awaitedNamespace: "jarvis",
        awaitedMethod: "analisar",
        awaitedArgument: "contexto",
        returnKeyword: "return",
        returnVariable: "decisão",
        approvalMethod: "pedirAprovação"
      }
    }
  },
  en: {
    statusTextByStep: {
      idle: "Demo ready for a question.",
      question: "Question sent by the director.",
      consulting: "Jarvis is checking connected sources.",
      answering: "Jarvis is organizing the business answer.",
      approval: "Recommendation ready for human approval.",
      executing: "Action authorized and running.",
      success: "Execution confirmed and tracked.",
      unsupported: "Question outside the scope of this local demo."
    },
    toolbar: {
      title: "MININO JARVIS / DEMO",
      live: "secure channel active"
    },
    control: {
      kicker: "Choose a question",
      title: "The whole company inside one conversation.",
      copy:
        "The director asks. Jarvis finds context, shows where the information came from and turns decisions into action.",
      scenariosAriaLabel: "Demo questions",
      questionLabel: "Question for Minino Jarvis",
      questionPlaceholder: "Ask about operations, sales or team",
      submitButton: "Send",
      demoNote: "Demo data used to explain the experience."
    },
    phone: {
      ariaLabel: "Minino Jarvis simulation on WhatsApp",
      avatar: "MJ",
      name: "Minino Jarvis",
      availability: "online on WhatsApp",
      secure: "harness active",
      inputPlaceholder: "Message",
      sendSymbol: "↑"
    },
    idle: {
      title: "Ask a business question",
      copy: "Jarvis answers with context and a next action."
    },
    thinking: {
      title: "Checking the company",
      live: "live"
    },
    tools: {
      ariaLabel: "Sources checked"
    },
    sources: {
      ariaLabel: "Information sources"
    },
    approval: {
      confidence: "high confidence / human approval",
      authorizeButton: "Authorize action",
      askAgainButton: "Choose another question"
    },
    executing: {
      ariaLabel: "Actions running",
      taskStatus: "finishing"
    },
    success: {
      title: "Action started and tracked",
      askAgainButton: "Ask another question"
    },
    unsupported: {
      title: "This demo has a clear scope.",
      copy:
        "It answers examples about operations, sales and team capacity. The real Jarvis uses each company's connected sources.",
      button: "See available questions"
    },
    backstage: {
      ariaLabel: "Technical backstage for the query",
      title: "business trace",
      runStatus: "run_live",
      code: {
        declaration: "const",
        variable: "decision",
        assignment: "=",
        awaitedNamespace: "jarvis",
        awaitedMethod: "analyze",
        awaitedArgument: "context",
        returnKeyword: "return",
        returnVariable: "decision",
        approvalMethod: "requestApproval"
      }
    }
  }
} satisfies Record<JarvisLocale, JarvisUiCopy>;

const keywordPatternsByLocale = {
  "pt-BR": {
    sales:
      /\b(venda|vendas|comercial|receita|faturamento|funil|lead|leads|proposta|propostas|contrato|contratos|cliente|clientes|conversao|converter)\b/,
    team:
      /\b(equipe|equipes|time|times|pessoa|pessoas|colaborador|colaboradores|capacidade|sobrecarga|sobrecarregada|atendimento|sla|redistribuir|redistribuicao)\b/,
    operation:
      /\b(operacao|operacoes|agir|acao|prioridade|prioridades|processo|processos|pendencia|pendencias|hoje|rotina|execucao|gargalo|recuperacao)\b/
  },
  en: {
    sales:
      /\b(sale|sales|commercial|revenue|pipeline|funnel|lead|leads|proposal|proposals|contract|contracts|customer|customers|conversion|convert)\b/,
    team:
      /\b(team|teams|people|person|staff|employee|employees|capacity|overload|overloaded|support|sla|redistribute|redistribution|manager|managers)\b/,
    operation:
      /\b(operation|operations|operate|act|action|priority|priorities|process|processes|pending|today|workflow|execution|bottleneck|recovery)\b/
  }
} satisfies Record<JarvisLocale, Record<JarvisScenarioId, RegExp>>;

function normalizeQuestion(question: string, locale: JarvisLocale) {
  return question
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(locale);
}

export function routeJarvisQuestion(
  question: string,
  locale: JarvisLocale
): JarvisScenario | null {
  const normalizedQuestion = normalizeQuestion(question, locale);
  const keywordPatterns = keywordPatternsByLocale[locale];

  if (keywordPatterns.sales.test(normalizedQuestion)) {
    return jarvisScenariosByLocale[locale].sales;
  }

  if (keywordPatterns.team.test(normalizedQuestion)) {
    return jarvisScenariosByLocale[locale].team;
  }

  if (keywordPatterns.operation.test(normalizedQuestion)) {
    return jarvisScenariosByLocale[locale].operation;
  }

  return null;
}
