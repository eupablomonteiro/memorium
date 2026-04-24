# Memorium - Como acessar do celular

## Seu IP na rede local

```
http://[IP_ADDRESS]
```

## Como pode acessar:

1. Conecte o celular no mesmo Wi-Fi que o seu PC
2. Abra o navegador do celular
3. Digite: http://[IP_ADDRESS]

## Para iniciar o servidor:

### Terminal 1 - API (Backend)

```bash
cd apps/api
pnpm dev
```

- API em: http://localhost:3001
- Docs: http://localhost:3001/docs

### Terminal 2 - Web (Frontend)

```bash
cd apps/web
pnpm dev
```

- Web em: http://localhost:3000

## Estrutura de pastas

```
memorium/
├── apps/
│   ├── api/        # Backend (Express + TypeScript)
│   └── web/         # Frontend (Next.js + PWA)
├── docs/           # Documentação
└── packages/       # Código compartilhado
```

## Tecnologias

- **Backend**: Node.js, Express, Multer, EXIF, FFmpeg
- **Frontend**: Next.js 14, React, TailwindCSS
- **Testes**: Vitest, Supertest

## Dicas

- O upload organiza fotos por data automaticamente
- Arquivos vão para: D:\Memorium\YYYY\MM\DD\
- Configure o caminho em: http://[IP_ADDRESS]:3000/setup
