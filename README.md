# StarPhone - Plataforma E-commerce

Plataforma completa de e-commerce para venda de peças e acessórios de celulares, desenvolvida com React, TypeScript, Tailwind CSS e Supabase.

## Recursos

- Sistema completo de carrinho de compras
- Autenticação de usuários (cadastro e login)
- Painel administrativo para gerenciamento
- Gestão de produtos, pedidos e categorias
- Integração com WhatsApp para pedidos
- Sistema de pagamento via PIX e dinheiro
- Banners personalizáveis
- Design responsivo (mobile e desktop)
- Política de cookies e LGPD

## Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage

## Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio-url>
cd starphone
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Execute as migrações do banco de dados:
As migrações estão em `supabase/migrations/` e devem ser aplicadas no seu projeto Supabase.

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter
- `npm run typecheck` - Verifica os tipos do TypeScript

## Estrutura do Projeto

```
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Contextos React (Auth)
│   ├── lib/            # Configurações (Supabase)
│   ├── pages/          # Páginas da aplicação
│   ├── utils/          # Utilitários
│   └── App.tsx         # Componente principal
├── supabase/
│   └── migrations/     # Migrações do banco de dados
└── public/            # Arquivos estáticos

```

## Configuração do Banco de Dados

O projeto utiliza Supabase com as seguintes tabelas principais:

- `products` - Produtos disponíveis
- `orders` - Pedidos realizados
- `user_profiles` - Perfis de usuários
- `admin_credentials` - Credenciais de administradores
- `product_categories` - Categorias/marcas de produtos
- `banner_settings` - Configurações do banner principal

## Painel Administrativo

Acesse o painel administrativo através do link "Admin" no rodapé da página.

**Credenciais padrão:**
- Usuário: `StaphoneConchal`
- Senha: `StarphoneGeral2026`

## Deploy

O projeto está configurado para deploy no Vercel através do arquivo `vercel.json`.

### Deploy no Vercel:

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. O deploy será feito automaticamente

## Segurança

- Row Level Security (RLS) ativado em todas as tabelas
- Autenticação via Supabase Auth
- Validação de dados no frontend e backend
- Conformidade com LGPD

## Funcionalidades Principais

### Para Clientes:
- Navegação por categorias de produtos
- Busca de produtos
- Carrinho de compras
- Finalização de pedido via WhatsApp
- Área do cliente com histórico de pedidos
- Cadastro de endereço

### Para Administradores:
- Gerenciamento de produtos (CRUD)
- Gerenciamento de pedidos
- Confirmação de pagamentos
- Impressão de etiquetas de envio
- Personalização do banner principal
- Gestão de categorias/marcas
- Criação de novos administradores

## Contato

- WhatsApp: (19) 99992-1698
- Instagram: @starphonecelulares
- Endereço: R. Mogi Mirim, 152 - Centro, Conchal - SP

## Licença

Todos os direitos reservados - StarPhone 2026
