# Revisão da experiência do portfólio

## Escopo

Evolução sobre `leonardocandiani/links`, a partir de `d3504a8`, desenvolvida na branch `improve/portfolio-experience`. Este documento registra a revisão pré-publicação. O histórico da `main` e o deployment do provedor são as fontes para confirmar a versão em produção.

A identidade aprovada foi preservada: azul da fotografia, algodão, grafite, imagens arquitetônicas e retrato pessoal. A mudança principal é a organização da experiência, não uma nova marca.

## Decisões de design

- Cabeçalho de 60 px, nome centralizado por layout flex e classes próprias. Uma superfície única substitui os controles sobrepostos; o menu mobile assume abaixo de 1100 px.
- Hero com título mais largo, hierarquia entre mensagem e descrição e uma entrada direta para o manifesto de criatividade.
- Sobre com retrato e texto separados. O conteúdo não depende de legibilidade sobre uma imagem.
- Manifesto com texto de cor sólida e sem linha atravessando palavras.
- Repertório com cinco frentes acessíveis por teclado e disponíveis no HTML mesmo sem JavaScript.
- Educação com apresentação do treinamento, intenção dos multiplicadores e ressalva junto dos números. O CTA leva ao WhatsApp com uma mensagem específica sobre treinamento.
- GitHub com projetos públicos atualizados e cartões visíveis no celular, sem uma faixa horizontal que esconde o restante.
- YouTube com destaque editorial, vídeos adicionais, datas originais e player sob demanda. A página em inglês explica que os vídeos estão em português.

A referência [Taste: Redesign](https://github.com/Leonxlnx/taste-skill/tree/main/skills/redesign-skill) orientou a hierarquia editorial e a redução da repetição. Apple Design, Better UI e Motion Design orientaram espaçamento, materiais, foco, retorno das interações e movimento. Kill AI Slop foi usado para revisar os efeitos decorativos.

## Movimento e interação

- Entrada do hero em 650 ms com pequenos intervalos entre título, descrição e ações.
- Reveals editoriais com deslocamento de 20 px em 600 ms, sem diminuir o contraste do texto.
- Imagens com escala contida de 1,025 para 1. Nenhum scroll hijacking ou parallax obrigatório.
- Navegação indica a seção atual com `aria-current`.
- Drawer com contenção de foco, Escape, fundo inerte e restauração do foco e da rolagem. Redimensionar para desktop encerra o drawer.
- `prefers-reduced-motion` remove movimentos de entrada e preserva a experiência completa do Jarvis.
- Repetir a mesma pergunta do Jarvis inicia uma nova execução; timers anteriores não deixam a simulação travada.
- A demo identifica dados ilustrativos e não executa consultas ou ações reais. O botão de mensagem leva ao campo de pergunta funcional.

## Conteúdo externo

O build atualiza GitHub e YouTube com fallback validado. A integração do YouTube usa o feed público do canal, sem chave de API. Os seis vídeos mais recentes ficam no snapshot; quatro aparecem na página.

Não há sincronização periódica implantada. Novos vídeos aparecem no próximo build. O título e a data do vídeo são dados da fonte, não texto gerado para aparentar atividade recente.

Os multiplicadores de educação e a descrição do Jarvis como case foram pedidos pelo autor. Não foram adicionadas métricas de resultado, depoimentos ou empresas atendidas sem evidência.

## Verificação e limites

Resultado final desta revisão:

- `npm run build`: duas rotas geradas, zero erros, zero warnings e dois hints.
- `npm test`: 73 testes aprovados em sete arquivos.
- `npm run test:e2e -- --workers=1`: 100 testes aprovados; 29 casos ignorados por serem exclusivos de outro viewport. Nenhuma falha.
- `npm audit`: nenhuma vulnerabilidade encontrada.
- `git diff --check`: sem erros de whitespace.
- Preview PT/EN: HTTP 200 pelo endereço Tailscale. Todas as imagens carregadas, nenhum erro JavaScript e nenhum overflow nas inspeções finais de 1440 px e 393 px.

A suíte cobre WebKit com perfis de Safari desktop, iPhone e tablet, PT/EN, acessibilidade Axe, navegação por teclado, fallback sem JavaScript, geometria do cabeçalho, imagens, repertório e simulação do Jarvis. São perfis emulados, não testes em aparelhos físicos. Os testes de integração do player interceptam o serviço externo para verificar determinismo; também foi realizado um smoke real do iframe, com vídeo carregado e em reprodução.

Inspeção visual em desktop de 1440 px e iPhone de 393 px. Verificação adicional de overflow em 320, 375, 768, 1099, 1100 e 1280 px. O scanner visual restante identifica máscaras de contraste das fotografias, sublinhados de links, o único material do cabeçalho e monoespaçada da demonstração técnica; são usos deliberados.

A revisão independente identificou perda de foco durante a troca do link nativo do YouTube pelo botão, quando o JavaScript chegava atrasado. O teste reproduziu a falha antes da correção. A implementação agora conserva o foco, sem deslocar o usuário de outro controle.

O check do Astro conserva dois hints de depreciação de `XMLValidator`. A validação explícita de XML foi mantida. Não há erro de compilação associado.

Preview privado: `http://100.95.243.67:57064/`, com inglês em `/en/`. O servidor está separado do processo de desenvolvimento e serve apenas `dist/`. Depende de o Mac permanecer ligado e acessível pelo Tailscale; não é hospedagem de produção.
