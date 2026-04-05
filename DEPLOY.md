# Deploy Guide - Cloudflare Pages

## ✅ Pré-requisitos

1. Conta no Cloudflare
2. Repositório GitHub com o código
3. DNS do domínio leonardocandiani.com configurado

## 🚀 Step-by-Step

### 1. Push pro GitHub

```bash
cd ~/projetos/links-temp
git add .
git commit -m "feat: rebuild site with premium design"
git push origin main
```

### 2. Cloudflare Pages Setup

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Pages** → **Create a project**
3. Conecte seu GitHub
4. Selecione o repo `links-temp` (ou o nome que você deu)

### 3. Build Configuration

Na tela de configuração:

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

**Environment variables** (se necessário):
```
NODE_VERSION = 18
```

### 4. Deploy

Clique em **Save and Deploy**

Cloudflare vai:
- Instalar dependências
- Rodar `npm run build`
- Deploy automático
- Gerar URL temporária (ex: `links-temp-abc.pages.dev`)

### 5. Conectar Domínio

1. No projeto do Pages, vá em **Custom domains**
2. Click **Set up a custom domain**
3. Digite: `leonardocandiani.com`
4. Cloudflare vai detectar se você usa os nameservers deles

**Se DNS não estiver no Cloudflare:**
1. Vá em **DNS** no Cloudflare Dashboard
2. Adicione um registro CNAME:
   ```
   Type: CNAME
   Name: @
   Target: [seu-projeto].pages.dev
   Proxy: ON (laranja)
   ```

3. Adicione também pra www:
   ```
   Type: CNAME
   Name: www
   Target: [seu-projeto].pages.dev
   Proxy: ON
   ```

### 6. SSL/HTTPS

Cloudflare ativa SSL automaticamente. Aguarde alguns minutos.

Verifique em **SSL/TLS** → **Overview**:
- Modo: **Full** ou **Full (strict)**

## 🔄 Updates Futuros

Cloudflare Pages tem **deploy automático**:

1. Faça alterações localmente
2. Commit e push pro GitHub
3. Cloudflare detecta e faz deploy automático

```bash
git add .
git commit -m "update: nova seção X"
git push
```

Deploy acontece em ~1-2 minutos.

## 🌐 URLs Finais

- **Produção**: https://leonardocandiani.com
- **Preview builds**: https://[commit-hash].[projeto].pages.dev

## 🐛 Troubleshooting

### Build falha

1. Verifique logs no Cloudflare
2. Teste localmente:
   ```bash
   npm run build
   ```

### Domínio não resolve

1. Aguarde propagação DNS (até 24h, geralmente 5-10min)
2. Teste com:
   ```bash
   nslookup leonardocandiani.com
   ```
3. Verifique nameservers:
   ```bash
   dig NS leonardocandiani.com
   ```

### Imagens não aparecem

Certifique-se que estão em `public/images/` e não em `src/`

---

**🎉 Site no ar!**

Agora é só compartilhar: https://leonardocandiani.com
