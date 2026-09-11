# Kit olek.si: dissecação e reuso

Captura completa do que faz o [olek.si](https://olek.si/) parecer do jeito que parece, extraída do bundle Vite em produção (10/09/2026). O CSS bruto está em `olek-source.css` (26 KB, 7 blocos injetados pelo JS), as fórmulas de scroll vieram do `index-Cq43OVCY.js`. A implementação reutilizável vive em `src/styles/kit-olek.css` e `src/scripts/kit-olek.js`.

## O que o site é, tecnicamente

SPA Vite sem framework de UI, com Motion (`animate`, `frame`) pra springs, Lottie pro ícone do estúdio e Three.js carregado mas não usado no desktop. Não existe WebGL nem canvas nos efeitos que interessam: tudo é CSS (`filter: blur`, `rotateX` com `perspective`, `mask-image`, `backdrop-filter`) dirigido por scroll.

Quando o FPS médio cai abaixo de 45 por três segundos, o site entra em "Saving Battery" e zera os blurs (por isso browser headless sem GPU mostra o card amarelo). O modo não é persistido em localStorage, é só uma variável de módulo.

## Fontes

| Papel no olek | Arquivo | Fonte real | Uso |
|---|---|---|---|
| `display` | display-*.woff2 | Google Sans Display Bold | etiqueta "OLEKSII" (14px, caixa alta) |
| `interd` | inter-d-*.woff2 | Inter Display Medium | headline 96/116, letter-spacing -2.64px |
| `text` | text-*.woff2 | Inter Variable (opsz 14-32, wght 100-900) | corpo, `opsz 32 wght 350` |
| `inter` | inter-t-*.woff2 | Inter Medium | timeline, botões |
| `interr` | inter-r-*.woff2 | Inter Regular | artigo |

Inter é SIL OFL e está self-hosted em `public/fonts/`. Google Sans Display não é redistribuível, então a etiqueta usa Inter Display no lugar.

## Tokens

```css
--animat: cubic-bezier(0.1, 0.1, 0, 1);   /* easing mestre de tudo */
--background: #FFF; --text: #000; --accent: #6549F2;
--secondary: #999; --element: #F2F2F2; --border: #DDD7;
```

Tom por seção (`html[data-tone="dark"]`): `--tone-fg`, `--tone-soft`, `--tone-invert` (0/1, usado em `filter: invert()` nos ícones), `--tone-fade` (#F5F5F5 / #101010), `--glow-color` (#FFF / #111), `--tone-blend` (plus-darker / plus-lighter). A troca leva 0.4s com `cubic-bezier(0.4, 0, 0, 1)` e usa `@property` pra animar as cores custom.

## Os blurs, um por um

1. **Entrada cube-rotate** (headline, botões, ícones). O elemento nasce com `opacity: 0` (classe `.torender`) e, ao renderizar, roda `0.8s cube-rotate var(--animat)`:
   ```css
   @keyframes cube-rotate { 0% { transform: rotateX(-45deg) translateY(64px); opacity: 0; filter: blur(4px); } }
   ```
   O pai tem `perspective: 512px`. A etiqueta do nome usa a variante `name` (48px, easing 0.3,0,0,1). Timeline lateral: `translateY(192px)` + `blur(8px)` em 1s.

2. **Transição entre seções** (o efeito principal). Cada projeto é um `.page` absoluto de 100dvh dentro de `.sections` com `scroll-snap-type: y mandatory`; 15 divs `.snap` vazias fazem o scroll. A cada frame, para a seção `r` e a posição fracionária `o`, com `h = r - o` e `y = |h|`:
   ```
   transform-origin: 50% calc(50% - h*100vh)
   transform: rotateX(-5h deg)
   opacity: max(0, 1 - y / (mesmo tom ? 2 : 1.1))
   filter: calculateBlur(y)
   ```
   com
   ```js
   calculateBlur(y) = min(56, compress((borda ? y³·32 : max(0, y-0.15)²) · 48)) px
   compress(t) = t < 16 ? t : round(t / 2^(floor(log2 t) - 3)) · 2^(...)   // quantiza em degraus
   ```
   Fora de `|h| > 1.5` a seção recebe `content-visibility: hidden` e `will-change: auto`. Ou seja: a seção vizinha aparece meio transparente, girada 5° pra dentro e com ~5px de blur, e assenta conforme centraliza.

3. **Lightbox** (clicar numa imagem). O header some com `opacity: 0; filter: blur(8px)`, o título faz `scale: 0.9 0.75` e sobe pelo `--header-morph-y`, o conteúdo vai a `opacity: 0.08; filter: blur(16px)`, tudo em 0.5 a 0.75s com `--animat`. O rótulo "Scroll or click to exit" entra com `blur(6px) → 0` e `scale 0.75 → 1`.

4. **Indicador de galeria**: pontos e chevron fazem cross-fade simétrico (`opacity`, `filter: blur(6px)`, `scale 0.5`) em 0.75s.

5. **Fade inferior** (`#safari-fade`): 128px com `background: linear-gradient(transparent, var(--tone-fade))`, `mask-image: linear-gradient(to top, var(--tone-fade) 50%, transparent)` e `backdrop-filter: blur(4px)`. No olek fica em `top: 100dvh` (só aparece no overscroll do Safari); no kit ficou no rodapé do viewport.

6. **Pull-to-refresh** (mobile): anel com `filter: blur(64px) brightness(5)` que explode em `blur(96px)` e `scale(3)` por 800ms.

7. **Timeline lateral**: cada aba distante `q` da ativa recebe `blur(min(cap, max(0, q-0.5)·scale))` e opacidade 1 / 0.5 / 0.3 (ativa, ano, mês).

8. **Pull-to-refresh do hero** (celular): com progresso `U` do puxão, cada filho do headline recebe `rotateX(-45U deg) translateY(32U px)`, e a assinatura some com `blur(32px)` em 2s. Não é efeito de saída por scroll; aplicado assim no deck ele briga com a dobra da seção e o título parece bugar.

## Componentes menores

- Pílula (`#mail`): 36px de altura, `padding 0 16px 0 12px`, `border-radius 18px`, `background #0001`, Inter Display 16px.
- Círculos sociais (`#profiles a`): 50px, `box-shadow: inset 0 0 0 1px #DDD7`, gap 24px.
- Card flutuante (`#battery`): `border-radius 30px`, sombra `0 0 0 1px #00000005, 0 1px 1px #00000005, 0 6px 32px #0000000A`.
- Etiqueta de nome: retrato 24x16 com `border-radius 96px` e `box-shadow 0 0 0 3px` da cor do fundo, texto 14px `letter-spacing -0.64px`.
- Raio das mídias: `clamp(16px, 2vw, 24px)`; imagens do projeto `max-width: min(1024px, 92vw)`, `max-height: calc(100vh - 256px)`, recortadas com `clip-path: path()` de cantos suavizados.

## Como usar o kit

- Envolva o bloco em `.k-stage` (ou dê `perspective: 512px`) e marque cada filho com `data-cube` e `--i` pra escalonar 70ms.
- `startKit()` (chamado no BaseLayout) revela os `data-cube` por IntersectionObserver e, em ponteiro fino, transforma `main > section` e o `footer` num deck de slides de 100dvh: cada slide rola por dentro, e na borda a roda, PageDown/PageUp, setas, espaço e os links `#id` do menu pulam pro slide vizinho com animação própria (rAF, 700ms). O snap não usa `scroll-snap` CSS porque o snap nativo mira a caixa já girada pela perspectiva e o ponto de encaixe fugia com a rotação; o olek resolve com `.snap` vazias, aqui o motor conduz o scroll. `data-tone="dark"` numa seção troca o tom do documento quando ela cobre o centro do viewport. Em toque a página rola normal, sem motor.
- A distância `h` de cada slide vem de `offsetTop` e `scrollY`, nunca de `getBoundingClientRect`: o retângulo já vem girado e realimenta a própria rotação.
- Dobra na costura (de jh3y/lid-plane, app Metal que inclina o desktop com a tampa do MacBook): a dobradiça é a borda entre os slides (`transform-origin` 50% 0 em quem entra, 50% 100% em quem sai), projeção paralela sem `perspective` (encurta, não faz keystone), e o blur cresce com a distância da dobradiça. No lid-plane isso é `radius = smoothstep(0.08, 1, altura) × |sin(ângulo)| × 65` misturando quatro gaussianas (sigma 2, 6, 16, 40); aqui é a variável `--fold` (0 em repouso, 1 no meio da troca) esticando as camadas de `backdrop-filter` do topo e do rodapé até 35vh. O settle usa o AutoAnchor dele: 150ms parado, 200ms de volta com smoothstep.
- Roda por gesto: gesto novo = pausa de 200ms, troca de direção ou delta subindo; troca de slide com 24px se começou na borda ou 140px de insistência; uma troca por gesto; widget rolável sob o cursor consome a roda antes; Tab pra outro slide anima até ele; settle suspenso com o mouse pressionado.
- `.k-morph` + `data-hidden` reproduz o morph por blur do lightbox em qualquer elemento.
- Referências visuais: `ref-hero.png` e `ref-transicao.png`.
