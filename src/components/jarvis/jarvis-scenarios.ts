export type JarvisScenarioId = "operation" | "sales" | "team";

export type JarvisScenario = {
  id: JarvisScenarioId;
  domain: string;
  shortQuestion: string;
  question: string;
  answerTitle: string;
  answer: string;
  actionTitle: string;
  action: string;
  tools: readonly [string, string, string];
  traces: readonly [string, string, string];
  sources: readonly [string, string, string];
  tasks: readonly [string, string, string];
  success: string;
};

export const jarvisScenarios = {
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

function normalizeQuestion(question: string) {
  return question
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export function routeJarvisQuestion(question: string): JarvisScenario | null {
  const normalizedQuestion = normalizeQuestion(question);

  if (/\b(venda|vendas|comercial|receita|funil|proposta|propostas)\b/.test(normalizedQuestion)) {
    return jarvisScenarios.sales;
  }

  if (/\b(equipe|equipes|time|times|pessoa|pessoas|colaborador|colaboradores|capacidade|sobrecarga|sobrecarregada)\b/.test(normalizedQuestion)) {
    return jarvisScenarios.team;
  }

  if (/\b(operacao|operacoes|agir|prioridade|prioridades|processo|processos|pendencia|pendencias|hoje)\b/.test(normalizedQuestion)) {
    return jarvisScenarios.operation;
  }

  return null;
}
