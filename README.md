<!-- readme-padrao:header -->
<!-- Banner -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:1a1a2e,100:00d9ff&height=200&section=header&text=Leonardo%20Candiani&fontSize=54&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Portf%C3%B3lio%20pessoal&descAlignY=58&descSize=16" alt="Leonardo Candiani" width="100%" />
</div>

<!-- Typing -->
<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=21&duration=2800&pause=900&color=00d9ff&center=true&vCenter=true&width=840&lines=Portf%C3%B3lio+pessoal+de+Leonardo+Candiani;Lideran%C3%A7a+em+IA%2C+produtos+e+sistemas;Minino+Jarvis+como+case%2C+educa%C3%A7%C3%A3o+corporativa%2C+open+source;Astro+7+++React+19%2C+deploy+na+Vercel" alt="Portfólio pessoal de Leonardo Candiani" />
</div>

<div align="center">

  <p>Site publicado em <a href="https://leonardocandiani.com.br">leonardocandiani.com.br</a>.</p>

  <p>
    <img src="https://img.shields.io/badge/Astro-7-1a1a2e?style=for-the-badge&logo=astro&logoColor=white" alt="Astro: 7" />
    <img src="https://img.shields.io/badge/React-19-1a1a2e?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React: 19" />
    <img src="https://img.shields.io/badge/Deploy-Vercel-0d1117?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy: Vercel" />
    <img src="https://img.shields.io/badge/Idiomas-PT%20%C2%B7%20EN-00d9ff?style=for-the-badge" alt="Idiomas: PT · EN" />
  </p>

  <p>
    <a href="#stack">Stack</a> •
    <a href="#desenvolvimento">Desenvolvimento</a> •
    <a href="#verificação">Verificação</a> •
    <a href="#rotas">Rotas</a> •
    <a href="#conteúdo-público">Conteúdo público</a> •
    <a href="#produção">Produção</a>
  </p>
</div>

<br>

> **leonardocandiani.com.br** é a vitrine do trabalho do Leonardo: liderança em IA, produtos e sistemas em operação, o Minino Jarvis como case empresarial, educação corporativa e os projetos open source.

## O que é

```yaml
produto: site pessoal e portfólio, estático
stack:   Astro 7, React 19 para ilhas interativas, TypeScript
testes:  Vitest (unitário) e Playwright (e2e)
rotas:   / em português, /en/ em inglês
deploy:  Vercel, branch main como fonte canônica, build em dist/
dev:     npm ci · npm run dev · npm run check · npm test
```

<!-- /readme-padrao:header -->

Portfólio pessoal de Leonardo Candiani, publicado em [leonardocandiani.com.br](https://leonardocandiani.com.br).

O site apresenta liderança em IA, repertório de produtos e sistemas, o Minino Jarvis como case empresarial, educação corporativa, projetos open source e vídeos do YouTube.

## Stack

- Astro 7
- React 19 para experiências interativas
- TypeScript
- Vitest e Playwright
- Deploy na Vercel

## Desenvolvimento

```bash
npm ci
npm run dev
```

## Verificação

```bash
npm run check
npm test
npm run test:e2e
npm run build
```

## Rotas

- `/`: versão em português
- `/en/`: versão em inglês

## Conteúdo público

O build atualiza os projetos públicos do GitHub e os vídeos do canal `@oleonardocandiani` antes de gerar as duas rotas. Não exige token do YouTube.

```bash
npm run sync:github
npm run sync:youtube
```

O YouTube usa o feed público do canal `UCqO85XZNoBRx1SuYX20Nbgw`. O sincronizador valida o XML, a identidade do canal e os links antes de substituir o snapshot local. Em falhas de rede, preserva uma cópia válida; se também não houver cópia válida, o build falha explicitamente.

São armazenados seis vídeos. A página apresenta o mais recente em destaque e outros três, com títulos e datas originais. O player `youtube-nocookie` só é criado após interação. As capas são imagens públicas do YouTube, carregadas sob demanda.

Novas publicações entram no próximo build. Não há um agendamento de atualização ou deploy configurado neste repositório.

## Produção

A branch `main` é a fonte canônica do site. O build gera arquivos estáticos em `dist/`.

`vercel.json` fixa o preset Astro, a instalação por `npm ci`, o build por `npm run build` e a publicação de `dist/`. O projeto existente na Vercel é `leonardo-candiani-site`.

Publicar código no GitHub não comprova deploy: a integração do provedor e a versão servida no domínio devem ser verificadas separadamente.

<!-- readme-padrao:footer -->
<br>

---

<div align="center">
  <p><strong>Feito por <a href="https://github.com/leonardocandiani">Leonardo Candiani</a></strong> · Mais projetos em <a href="https://github.com/leonardocandiani?tab=repositories">github.com/leonardocandiani</a></p>
  <p>Leonardo Candiani constrói agentes de IA que conversam, decidem e fecham negócio. Cofundador da SixQuasar, operando Proteauto, SegSmart e IACall ponta a ponta.</p>
  <a href="https://leonardocandiani.com.br">
    <img src="https://img.shields.io/badge/-Website-0d1117?style=for-the-badge&logo=safari&logoColor=00d9ff" alt="Website" />
  </a>
  <a href="https://github.com/leonardocandiani">
    <img src="https://img.shields.io/badge/-GitHub-0d1117?style=for-the-badge&logo=github&logoColor=00d9ff" alt="GitHub" />
  </a>
  <a href="https://instagram.com/leonardocandiani">
    <img src="https://img.shields.io/badge/-Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" />
  </a>
  <a href="https://youtube.com/@oleonardocandiani">
    <img src="https://img.shields.io/badge/-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" />
  </a>
</div>

<br>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00d9ff,50:1a1a2e,100:0d1117&height=120&section=footer&text=Obrigado%20pela%20visita%21&fontSize=18&fontColor=ffffff&fontAlignY=72" alt="Obrigado pela visita!" width="100%" />
</div>
<!-- /readme-padrao:footer -->
