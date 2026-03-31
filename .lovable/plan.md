

## Plano — Portal Imobiliário Líder Imóveis Itaúna

### Identidade Visual
- **Cores**: Verde marca (#5B9A2D / #7BC043), branco (#FFFFFF), cinza escuro (#1A1A1A), cinza médio (#6B7280), cinza claro (#F5F5F5)
- **Logo**: usar o arquivo transparente (`full_margin_transparent_customcolor.png`) no header
- **Tipografia**: Inter (corpo) + fonte display sofisticada para títulos
- **Estilo**: clean, premium regional, bastante respiro, fundo claro, fotos grandes

---

### Estrutura de Páginas (11 páginas + detalhe do imóvel)

**Layout global (componentes reutilizáveis):**
- **Topbar**: CRECI, telefone, redes sociais
- **Header**: logo, menu (Comprar, Alugar, Sobre, Anuncie, Contato), botão "Área do Cliente", menu mobile hamburger
- **Footer**: horário, links institucionais, contatos por departamento, endereço, redes sociais, links para área do cliente/documentos/ouvidoria
- **Botão flutuante WhatsApp** (mobile e desktop)

---

#### 1. HOME
- **Hero** com busca avançada: comprar/alugar, tipo, bairro, quartos, valor min/max, código, botão "Buscar"
- **Bloco de atalhos do sistema**: "Área do Cliente", "Envie seu imóvel", "Fale com Locação", "Fale com Vendas", "Solicite Atendimento"
- **Super Destaque**: 1 imóvel premium com imagem ampla, atributos e CTAs
- **Imóveis em destaque — Venda**: grid/carrossel de cards
- **Imóveis em destaque — Locação**: mesmo padrão
- **Bloco institucional**: resumo + CTA para "Sobre"
- **Bloco captação**: CTA para proprietários anunciarem

#### 2. COMPRAR & 3. ALUGAR
- Filtros laterais/topo (tipo, bairro, quartos, preço, código)
- Grid de cards de imóveis com badges (Novo, Destaque)
- Ordenação, contagem de resultados, paginação
- Dados mockados prontos para substituição por API

#### 4. DETALHE DO IMÓVEL
- Galeria de imagens, preço, código, localização
- Atributos (quartos, suítes, banheiros, vagas, área)
- Descrição completa
- Formulário de interesse + botão WhatsApp
- Imóveis semelhantes

#### 5. SOBRE
- História da empresa, missão/valores, equipe, CRECI, foto da fachada mockada

#### 6. ANUNCIE SEU IMÓVEL
- Formulário completo (nome, telefone, e-mail, tipo, endereço, descrição)
- Estados de sucesso/erro

#### 7. CONTATO
- Formulário de contato + mapa + contatos por departamento (locação, vendas, financeiro)

#### 8. ÁREA DO CLIENTE (hub de transição)
- Design de "portal" — visual diferenciado
- Título forte + texto explicativo
- Botões: "Entrar no Sistema", "Acessar Documentos", "Solicitar Suporte", "Atendimento Financeiro", "Atendimento Locação"
- Links apontam para `#` (prontos para URLs externas)

#### 9. DOCUMENTOS
- Lista de documentos úteis com links para download/sistema externo

#### 10. OUVIDORIA
- Formulário de ouvidoria com campos específicos

#### 11. TRABALHE CONOSCO
- Formulário de candidatura (nome, cargo, telefone, currículo)

#### 12. POLÍTICA DE PRIVACIDADE
- Texto legal padrão LGPD

---

### Dados Mockados
- ~12 imóveis fictícios realistas (casas, aptos, terrenos em Itaúna-MG) com bairros reais
- Contatos setorizados fictícios (locação, vendas, financeiro, ouvidoria)
- Horário de funcionamento, endereço fictício em Itaúna

### Preparação para Integração
- Dados centralizados em arquivos de mock (`/data/`) facilmente substituíveis por chamadas API
- Componentes com props tipadas (TypeScript)
- Estados de loading, vazio e erro em listagens
- Formulários com estrutura de submit pronta para conectar a backend
- Links do sistema principal como constantes configuráveis

### Componentes Reutilizáveis
TopBar, Header, Footer, MobileMenu, PropertyCard, PremiumPropertyCard, SearchBar, FilterSidebar, PropertyGrid, SystemShortcutsGrid, InstitutionalBlock, CTABlock, ContactByDepartment, StandardForm, Breadcrumbs, Pagination, StatusBadge, WhatsAppButton

### Responsividade
- Mobile-first com breakpoints adequados
- Menu hamburger, cards empilhados, CTAs grandes no mobile

### SEO & Acessibilidade
- Títulos e meta descriptions por página via react-helmet
- Headings semânticos (h1-h3)
- Alt text em imagens, labels nos formulários, contraste adequado

