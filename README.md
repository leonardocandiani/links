# leonardocandiani.com

Site pessoal de Leonardo Candiani — Especialista em IA e Tecnologia

## 🎨 Design

- **Aesthetic**: Dark editorial premium
- **Fonts**: Cormorant Garamond (serif) + Space Grotesk (sans)
- **Colors**: Deep blue-black (#050508) + Warm amber (#F59E0B)
- **Motion**: Heavy scroll-triggered animations, parallax, staggered reveals
- **Responsive**: Mobile-first (80%+ visitors from Instagram)

## 🚀 Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)

## 📦 Desenvolvimento

```bash
# Instalar dependências
npm install

# Dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 Deploy (Cloudflare Pages)

1. Push para GitHub
2. Conectar repo no Cloudflare Pages
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18+

4. Conectar domínio:
   - DNS: leonardocandiani.com → Cloudflare nameservers
   - Custom domain no Cloudflare Pages

## 📁 Estrutura

```
src/
├── components/
│   ├── Hero.tsx        # Hero com nome + tagline + animações
│   ├── About.tsx       # Bio + foto + stats
│   ├── Projects.tsx    # SixClaw, Proteauto, SegSmart
│   ├── Instagram.tsx   # Feed com carousels reais
│   ├── Links.tsx       # Templates, Prompts, YouTube
│   └── Contact.tsx     # WhatsApp, Instagram, YouTube + Footer
├── App.tsx
├── main.tsx
└── index.css          # Global styles + fonts + grain texture

public/
└── images/
    ├── profile-pic.jpg
    ├── post-dificil.png
    ├── post-claude-context.png
    ├── post-anthropic-academy.png
    └── post-meta-ai.png
```

## 🎯 Seções

1. **Hero** — Full-screen com nome, tagline, gradient animado
2. **About** — Bio + foto + estatísticas (1.3k+ seguidores)
3. **Projects** — Cards para SixClaw, Proteauto, SegSmart
4. **Instagram** — 4 posts reais do feed (feature post grande + 3 grid)
5. **Links** — Templates, Prompts, YouTube
6. **Contact** — WhatsApp, Instagram, YouTube + CTA + Footer

## 🔗 Links Importantes

- WhatsApp: +55 44 99889-3474
- Instagram: [@leonardocandiani](https://instagram.com/leonardocandiani)
- YouTube: [@oleonardocandiani](https://youtube.com/@oleonardocandiani)

## 📝 Atualizar Conteúdo

### Trocar links do Google Drive (Templates/Prompts)

Edite `src/components/Links.tsx`:

```tsx
const links = [
  {
    url: 'https://drive.google.com/drive/folders/SEU-ID-AQUI',
    // ...
  }
];
```

### Adicionar novos posts do Instagram

1. Copie a imagem do carousel para `public/images/`
2. Edite `src/components/Instagram.tsx`:

```tsx
const posts = [
  {
    image: '/images/seu-post.png',
    title: 'Título',
    description: 'Descrição',
  }
];
```

---

**Made with ❤️ and a lot of ☕**
