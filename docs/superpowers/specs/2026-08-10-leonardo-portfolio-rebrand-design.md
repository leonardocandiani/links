# Leonardo Candiani Portfolio Rebrand

## Status

Design-base aprovado em 10 de agosto de 2026. A experiência interativa do Minino Jarvis e o manifesto de criatividade como fio condutor foram aprovados em 11 de agosto de 2026. Esta especificação define a primeira versão local. Deploy, migração de domínio e substituição do site atual não fazem parte desta etapa.

## Resumo

Reconstruir o site pessoal de Leonardo Candiani como um portfólio editorial, rápido e orientado à marca pessoal. A página apresenta Leonardo como fundador e operador de inteligência artificial, usa “O que nos limita é a nossa criatividade” como cultura e fio narrativo, mostra projetos e empresas selecionados, aprofunda o Minino Jarvis como principal case de sucesso e usa o GitHub como prova viva de execução open source.

O site publicado em `leonardocandiani.com.br` serve apenas como inventário de conteúdo. O repositório `leonardocandiani/leonardocandiani` contém o perfil do GitHub, não o código-fonte do site. A reconstrução nasce como projeto local novo.

## Objetivos

1. Consolidar a marca pessoal de Leonardo como fundador e operador de IA.
2. Comunicar visão, capacidade técnica e execução real sem transformar a home em catálogo.
3. Apresentar o Minino Jarvis como case principal, com impacto claro para diretores e gestores.
4. Mostrar projetos open source recentes do GitHub de forma atualizada, legível e confiável.
5. Entregar uma experiência excelente em iPhone e desktop, acessível pelo Tailscale durante o desenvolvimento.
6. Obter estética inspirada na clareza, tipografia, materiais e motion language da Apple sem copiar páginas, assets ou componentes proprietários.
7. Mostrar criatividade como repertório aplicado, capacidade empresarial e conhecimento multiplicado nas equipes.

## Não objetivos

- Criar uma página comercial do SegsClaw.
- Posicionar o Minino Jarvis como produto principal do site.
- Reproduzir o site atual ou migrar seu código compilado.
- Criar CMS, área administrativa, autenticação ou backend.
- Exibir todos os projetos e tecnologias na home.
- Publicar ou trocar o domínio nesta etapa.
- Inventar métricas de impacto ou números que não possam ser provados.

## Público e ação principal

O público principal inclui fundadores, diretores, gestores e profissionais de tecnologia interessados em aplicar IA de forma operacional. A ação principal é entender quem Leonardo é e acompanhar seu trabalho. Contato comercial, GitHub, YouTube e Instagram são destinos secundários e visíveis.

## Posicionamento

Leonardo é apresentado como fundador e operador que transforma IA em capacidade concreta para empresas. A marca combina visão empresarial, construção de sistemas e compartilhamento público do que aprende.

Mensagem-base do hero:

> Leonardo Candiani constrói sistemas de IA que ajudam empresas a perceber, decidir e agir melhor.

Essa frase pode ser refinada durante a implementação, mas deve preservar três ideias: identidade pessoal, aplicação empresarial e execução real.

## Direção visual

### Conceito

Editorial de produto. Leonardo recebe o mesmo cuidado visual que uma empresa de tecnologia usaria para apresentar seu produto principal. A foto conduz a identidade, a tipografia cria hierarquia e as provas aparecem em capítulos amplos, não em uma grade contínua de cards.

### Paleta

As cores partem da fotografia fornecida:

| Token | Valor | Uso |
| --- | --- | --- |
| Céu | `#708CA1` | Accent estrutural, links, superfícies selecionadas |
| Céu claro | `#DFE9EE` | Fundos de seção e materiais claros |
| Algodão | `#F2EEE7` | Fundo quente alternativo |
| Papel | `#FBFAF7` | Fundo principal |
| Tinta | `#171513` | Texto e contraste principal |
| Grafite quente | `#45332A` | Elementos de apoio e superfícies escuras |
| Terracota | `#99694E` | Detalhes humanos usados com parcimônia |

Não usar gradiente roxo, neon, glow, orbes de IA, palavras com gradient clipping, glassmorphism empilhado ou paleta semântica genérica.

### Tipografia

- Fonte principal: stack de sistema da Apple, com fallback para `system-ui`.
- Display: peso 650 a 750, tracking entre `-0.04em` e `-0.06em`, leading entre `0.92` e `1.02`.
- Corpo: 17 a 20px no desktop e 16 a 18px no mobile, leading entre `1.45` e `1.6`.
- Labels: 11 a 13px, tracking positivo discreto, usados apenas para contexto.
- Nenhuma fonte serifada decorativa ou troca de fonte para destacar uma palavra.

### Materiais

- Navegação flutuante com uma única camada translúcida.
- Superfícies grandes usam fundos sólidos ou translúcidos leves, nunca vidro sobre vidro.
- Divisão de conteúdo por escala, espaço e mudança de superfície, não por bordas em cada bloco.
- Cantos arredondados apenas onde existe uma superfície física clara, como demo, imagem ou card de projeto.

### Linguagem técnica

A estética de código aparece em momentos que comprovam construção real, não como decoração genérica. Labels monoespaçadas identificam traces, fontes, repositórios, linguagens e estados. Trechos curtos de código podem aparecer nos bastidores do Jarvis e no repertório técnico, sempre legíveis e ligados ao conteúdo apresentado.

Não espalhar terminais, sintaxe falsa ou janelas de editor por todas as seções. A linguagem principal continua editorial e pessoal.

## Arquitetura da informação

### 1. Navegação

Barra compacta com nome, Visão, Projetos, Jarvis, GitHub e Contato. No mobile, os destinos principais ficam em um sheet acionado por botão com feedback imediato.

### 2. Hero pessoal

- Fotografia dominante de Leonardo.
- Nome e posicionamento em linguagem direta.
- Ações: conhecer a visão e ver projetos.
- Prova discreta: fundador da SixQuasar, atuação em SegSmart e Proteauto, localização em Maringá.
- Nenhum contador, badge ou nuvem de tecnologias.

### 3. Sobre

Bloco editorial apresentando trajetória, atuação entre negócio e tecnologia, fotografia pessoal, princípio de execução e experiência em operação. A tese de Leonardo aparece no que ele constrói, sem transformar a seção em biografia cronológica.

### 4. Manifesto de criatividade

Depois da apresentação pessoal e antes do repertório, uma composição editorial em duas partes apresenta a cultura de Leonardo:

> O que nos limita é a nossa criatividade.

A frase fica integralmente sobre fundo Papel, sem disputar contraste com a imagem. O texto complementar define criatividade como repertório aplicado para enxergar possibilidades, testar caminhos e transformar ideias em capacidade real.

No desktop, texto e imagem ocupam colunas independentes. No celular, o texto vem primeiro e a imagem aparece abaixo. A imagem `vision-architecture.webp`, antes usada como encerramento visual da seção Sobre, passa a pertencer exclusivamente ao manifesto para evitar repetição.

Abaixo da composição principal, três ecos tornam o conceito concreto sem repetir o slogan:

1. Repertório amplia os caminhos possíveis.
2. Minino Jarvis transforma informação em capacidade empresarial.
3. Educação distribui repertório e ferramentas para as equipes criarem soluções.

### 5. Empresas e projetos selecionados

Apresentar quatro a seis frentes que comprovem amplitude e execução. Prioridade inicial:

- SixQuasar
- Minino Jarvis
- KRIT
- keepwright
- scratchmate
- claude-optimizer

O Minino Jarvis recebe apenas uma chamada curta nesta seção; o case completo vem depois.

### 6. Case principal: Minino Jarvis

#### Papel narrativo

O Minino Jarvis demonstra o poder do trabalho de Leonardo. Não é hero, marca do site ou página de produto do SegsClaw.

#### Tese

> Pergunte à sua empresa. Ela responde no WhatsApp.

Diretores e gestores acessam informações conectadas da empresa na palma da mão, investigam problemas, cruzam contexto e aceleram análises, automações e novas ferramentas dentro do WhatsApp.

#### Estrutura do case

1. Problema: informação fragmentada, relatórios atrasados e dependência de pessoas para obter contexto.
2. Experiência: o gestor pergunta no WhatsApp usando linguagem natural.
3. Percepção: o sistema consulta fontes e sistemas conectados.
4. Contexto: harnesses próprios organizam ferramentas, memória e regras da empresa.
5. Execução: o Jarvis responde, aponta riscos e pode iniciar ações autorizadas.
6. Impacto: direção e gestão ganham velocidade para entender a empresa e desenvolver novas capacidades.
7. Prova técnica: arquiteturas de harness próprias, integrações reais e frameworks validados e atuais.

#### Demonstração interativa aprovada

A demonstração não é um vídeo, carrossel ou ciclo automático. O visitante inicia e controla a experiência. O WhatsApp ocupa o papel principal e a tecnologia aparece apenas quando ajuda a explicar como a resposta foi construída.

O estado inicial oferece três perguntas demonstrativas:

1. Operação: onde a direção precisa agir hoje.
2. Comercial: o que mudou no funil e onde existe perda de velocidade.
3. Equipe: qual grupo precisa de atenção e por quê.

Um campo livre aceita perguntas relacionadas a operação, comercial ou equipe. Como a demonstração é local e não consulta dados reais, um roteador determinístico associa termos conhecidos a um dos três cenários. Perguntas fora desses domínios recebem uma resposta transparente informando o limite da demonstração e mantêm as três sugestões visíveis. O sistema nunca simula ter compreendido ou consultado uma informação que não existe.

Depois da escolha, a experiência progride somente uma vez:

1. A pergunta do diretor entra na conversa do WhatsApp.
2. O estado de pensamento identifica quais fontes são necessárias.
3. Tool chips aparecem conforme CRM, conversas, metas ou capacidade são consultados.
4. Um pequeno painel de bastidores mostra trace, duração e duas linhas de código editorial.
5. A resposta é transmitida com prioridade, explicação e fontes visíveis.
6. O painel técnico desaparece para devolver o foco ao resultado empresarial.
7. Um approval card descreve a próxima ação e exige autorização humana.
8. Depois da autorização, task rows confirmam execução, responsáveis e acompanhamento.

O visitante pode trocar de cenário ou enviar outra pergunta a qualquer momento. Isso cancela a sequência anterior e inicia uma nova a partir do estado visual atual. Não existe repetição automática.

#### Hierarquia visual da demonstração

- WhatsApp e resultado empresarial dominam a composição.
- Thinking, streaming text, tool chips, context cards, task rows e approval card usam a lógica visual da referência [Beautiful UI](https://beautiful-ui-five.vercel.app/), adaptada à paleta do portfólio.
- A estética de código fica restrita ao painel temporário de bastidores, labels monoespaçadas, traces e fontes.
- O painel técnico nunca ocupa mais espaço que a conversa nem permanece visível depois da resposta.
- Os dados são identificados como demonstrativos. Nenhum número é apresentado como resultado real do Minino Jarvis.

#### Comportamento mobile

No celular, as perguntas aparecem antes da conversa. Ao selecionar uma delas ou enviar o formulário, a página leva o visitante diretamente ao WhatsApp e mantém a pergunta enviada no topo visível. A conversa ocupa a largura disponível, o painel de bastidores surge como uma camada compacta e nenhuma etapa depende de hover.

Depois da conclusão, o visitante consegue retornar às perguntas por um controle textual visível. A interface não sequestra o scroll quando a pessoa movimenta a página manualmente.

### 7. GitHub open source

Seção editorial com dois níveis:

1. Três projetos em destaque, escolhidos por relevância para a narrativa pessoal.
2. Lista de repositórios públicos recentes, ordenada por atividade.

Campos exibidos:

- Nome
- Descrição
- Linguagem principal
- Data de atualização em formato humano
- Stars quando o número trouxer informação útil
- Link para o repositório

Excluir forks, repositórios arquivados, repositórios sem conteúdo público relevante e o repositório de perfil. Não usar badges, tabelas de stack, troféus ou gráficos decorativos.

### 8. Conteúdo e presença pública

Bloco compacto para YouTube, Instagram e materiais públicos. O conteúdo reforça a visão e leva o visitante para canais externos sem competir com os projetos.

### 9. Contato e rodapé

- CTA principal de contato no WhatsApp.
- Links para GitHub, YouTube e Instagram.
- Rodapé simples com nome, cidade e ano.

## Assets

### Fotografia principal

A foto enviada é a fonte visual primária. O arquivo original deve ser preservado sem sobrescrita.

O `imagegen` produzirá uma variante horizontal para desktop por expansão de composição. Invariantes:

- Preservar identidade, rosto, cabelo, barba, corpo, camiseta, pose e direção do olhar.
- Preservar luz natural, textura de pele e aparência fotográfica.
- Expandir apenas o céu e o espaço ao redor para criar área negativa de texto.
- Não retocar o rosto, mudar roupa, adicionar objetos, inserir texto ou produzir aparência plástica.

Uma textura complementar para o case do Minino Jarvis só será gerada se a composição implementada precisar de separação visual. Ela deve representar fluxo de informação de forma editorial, sem orbe, robô, circuito neon ou interface sci-fi.

## Motion language

### Princípios

- Resposta instantânea em pointer down e touch down.
- Movimento orientado a feedback, estado, espacialidade ou explicação.
- Propriedades animadas limitadas a `transform`, `opacity` e blur em materiais específicos.
- Springs criticamente amortecidas por padrão.
- Bounce apenas em interação física iniciada pelo usuário.
- Toda transição reversível começa no valor visual atual.

### Momentos permitidos

- Materialização curta da navegação no carregamento inicial.
- Entrada do hero em uma sequência única, sem bloquear leitura ou interação.
- Press feedback em links e botões, escala entre `0.97` e `0.985`, 100 a 160ms.
- Sequência explicativa do case Minino Jarvis, controlada por scroll ou seleção direta.
- Expansão de detalhes de projetos e navegação mobile com origem espacial clara.

### Redução de movimento

Com `prefers-reduced-motion: reduce`, entradas viram cross-fades de até 200ms, a sequência do Jarvis mostra todos os estados sem deslocamento e nenhuma informação depende da animação.

Depois da primeira versão navegável, a skill `find-animation-opportunities` fará uma auditoria read-only. Só serão implementadas oportunidades que passem pelos gates de frequência, propósito, velocidade e função.

## Arquitetura técnica

### Stack

- Astro para páginas, conteúdo e build estático.
- React apenas nas ilhas interativas.
- TypeScript em modo estrito.
- CSS do projeto com tokens e componentes locais.
- Nenhum backend nesta etapa.

### Estrutura de componentes

- `SiteHeader`: navegação desktop e mobile.
- `HeroPortrait`: fotografia, posicionamento e ações.
- `VisionSection`: apresentação pessoal e trajetória. O nome técnico é legado da primeira composição e não altera seu papel como Sobre.
- `CultureManifesto`: manifesto e conexão com repertório, Jarvis e educação.
- `FeaturedWork`: empresas e projetos selecionados.
- `JarvisCaseStudy`: narrativa, demo e prova técnica.
- `JarvisDemo`: ilha React com estados de pergunta, consulta, resposta e ação.
- `GitHubProjects`: projetos em destaque e recentes.
- `PublicPresence`: conteúdo e canais.
- `ContactFooter`: contato e rodapé.

Componentes de apresentação recebem dados tipados e não buscam APIs diretamente.

### Conteúdo

Textos e projetos ficam em arquivos TypeScript ou JSON locais tipados. O objetivo é permitir alteração sem editar a estrutura visual.

### GitHub data flow

1. Um script de sincronização chama a API pública do GitHub durante o build ou por comando manual.
2. O script normaliza os campos necessários e aplica filtros.
3. O resultado é salvo como snapshot local versionável.
4. A página lê apenas o snapshot durante a renderização.
5. Se a API falhar, o build usa o último snapshot válido e registra o aviso no terminal.

Nenhum token do GitHub vai para o navegador. A página nunca depende da API no runtime.

### Estado da demo

`JarvisDemo` usa uma máquina de estados local, determinística e interruptível:

1. `idle`
2. `question`
3. `consulting`
4. `answering`
5. `approval`
6. `executing`
7. `success`
8. `unsupported`

Uma nova pergunta invalida os timers e efeitos da execução anterior. O visitante pode escolher outro cenário sem esperar o fim da animação. A implementação não usa loop temporal global.

Em `prefers-reduced-motion: reduce`, a pergunta, as ferramentas, a resposta e a aprovação aparecem sem digitação ou deslocamento. A ordem semântica e o conteúdo são idênticos.

## Tratamento de erros

- Falha de GitHub: usar snapshot local e emitir aviso no build.
- Ausência de descrição ou linguagem: ocultar o campo sem placeholder genérico.
- Imagem não disponível: preservar layout com fundo da paleta e texto alternativo.
- Link externo inválido detectado na verificação: bloquear entrega até correção.
- JavaScript desativado: todo conteúdo permanece legível; apenas a demo perde a progressão interativa.

## SEO e metadados

- Título: `Leonardo Candiani | IA, produtos e sistemas que operam empresas`.
- Descrição focada em fundador, IA aplicada e projetos.
- Canonical preparado para `https://leonardocandiani.com.br`.
- Open Graph com fotografia e composição próprias.
- JSON-LD do tipo `Person`, com links públicos confirmados.
- Sitemap, robots e favicon próprios.

## Acessibilidade

- HTML semântico e landmarks completos.
- Navegação integral por teclado.
- Focus visível em todos os controles.
- Contraste WCAG AA para texto e controles.
- Alvos de toque com pelo menos 44 por 44px.
- Texto alternativo objetivo para fotografia e projetos.
- Conteúdo do case compreensível sem motion, hover ou áudio.
- Suporte a `prefers-reduced-motion`, `prefers-reduced-transparency` e `prefers-contrast` quando disponível.

## Validação

### Gates técnicos

- Instalação reproduzível.
- TypeScript sem erro.
- Build de produção concluído.
- Verificação de links internos e externos.
- Scanner de slop executado e triado.
- Auditoria read-only de oportunidades de animação executada.

### Gates visuais e funcionais

- Hero, navegação, manifesto, projetos, case, GitHub e contato renderizados.
- Manifesto posicionado entre Sobre e Repertório, com texto e imagem em áreas independentes no celular.
- Layout validado em largura de iPhone e desktop.
- Interações testadas com mouse, teclado e toque.
- Demo do Jarvis funcional e interruptível.
- Os três cenários produzem respostas, fontes e ações coerentes com a pergunta escolhida.
- Pergunta livre conhecida segue para o cenário correto; pergunta fora do escopo não inventa resposta.
- A autorização muda o estado para execução e termina em confirmação visível.
- No mobile, escolher uma pergunta conduz à conversa sem impedir scroll manual posterior.
- O painel técnico aparece apenas durante consulta e some antes da aprovação.
- Reduced motion validado.
- Console sem erros.
- Site acessível pelo IP Tailscale do Mac durante o desenvolvimento.

### Critério de conclusão local

A entrega local termina quando o build passa, a página foi inspecionada no navegador real, o fluxo principal funciona em iPhone pelo Tailscale e os problemas visuais ou funcionais encontrados foram corrigidos. Nenhuma alegação de deploy ou produção será feita.
