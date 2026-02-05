# Nutallis Brasil - Full Stack

Ecossistema full-stack com Next.js (App Router), Supabase e dashboard ERP.

## Requisitos

- Node.js 18+
- Projeto Supabase com banco, auth e storage

## Configuracao

1) Copie o arquivo `.env.example` para `.env.local` e preencha as chaves.
2) Execute o schema em `supabase/schema.sql` no Supabase.
3) Crie o bucket de storage informado em `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.

## Rodar local

```bash
npm install
npm run dev
```

## Funcionalidades principais

- Landing page e catalogo dinamico com filtros e busca.
- Carrinho lateral e checkout com autocomplete e calculo de frete.
- Motor de pagamento hibrido (Pix Mercado Pago, Cartao EfI).
- ERP com CRUD de produtos/categorias, estoque em gramas e caixinhas financeiras.

## Estrutura de pastas

- `src/app/(store)`: Storefront
- `src/app/admin`: ERP
- `src/app/api`: APIs de pagamento, logistica e webhooks
- `supabase/schema.sql`: Schema do banco
