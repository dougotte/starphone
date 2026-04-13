# Starphone Admin - Instruções de Acesso

## Credenciais do Administrador

- **Usuário**: `StaphoneConchal`
- **Senha**: `StarphoneGeral2026`

## Como Acessar o Painel Admin

1. Na página inicial (home), role até o rodapé da página
2. Clique no link **"Admin"** no canto inferior direito
3. Entre com as credenciais acima
4. **IMPORTANTE**: Após clicar em "Entrar como Admin", aguarde alguns segundos - o sistema irá redirecionar automaticamente para o painel

## Produtos já Cadastrados

O sistema já possui 4 produtos cadastrados e visíveis na home:

1. **iPhone 15 Pro Max** - R$ 7.999,00
   - Apple, 50 unidades em estoque

2. **Samsung Galaxy S24 Ultra** - R$ 6.499,00
   - Samsung, 35 unidades em estoque

3. **Xiaomi 14 Pro** - R$ 4.299,00
   - Xiaomi, 40 unidades em estoque

4. **Google Pixel 8 Pro** - R$ 5.999,00
   - Google, 25 unidades em estoque

## Funcionalidades do Painel

### 1. Aba Produtos
- Cadastrar novos produtos com:
  - Nome do produto
  - Descrição
  - Marca
  - Preço
  - Estoque
  - URL da imagem (use imagens do Pexels)
- Editar produtos existentes
- Excluir produtos
- Ver todos os produtos cadastrados

### 2. Aba Banners
- Cadastrar banners promocionais para a home page
- Gerenciar ordem de exibição
- Ativar/desativar banners
- Os banners aparecem no topo da home

### 3. Aba Marcas (Categorias)
- Adicionar novas marcas/categorias
- Personalizar cores e ícones (emoji)
- Controlar ordem de exibição
- Ativar/desativar marcas

### 4. Aba Administradores
- Criar novos usuários admin
- Gerenciar acessos ao painel
- Excluir administradores

## Notas Importantes

- O sistema possui segurança através do localStorage para manter a sessão
- Os dados são persistidos no banco de dados Supabase
- Use URLs públicas para as imagens (recomendamos o Pexels)
- O logout limpa completamente a sessão de admin
- Row Level Security (RLS) está ativo para proteção de dados
