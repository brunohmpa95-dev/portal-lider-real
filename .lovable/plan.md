

# Finalização do Site Público — Líder Imóveis Itaúna

## Auditoria curta do front público

**Já existe e funciona:**
- Home com hero, busca, vitrines, simulador CAIXA, CTA captação
- Listagens `/comprar` e `/alugar` com filtros, paginação, ordenação
- Detalhe do imóvel com galeria, lightbox, formulário de lead, WhatsApp contextualizado, JSON-LD `RealEstateListing`
- Páginas Sobre, Contato, Anuncie, Privacidade, Ouvidoria, Carreiras, Documentos
- JSON-LD `RealEstateAgent + LocalBusiness` na home
- Formulários com validação básica, consentimento LGPD
- Responsividade existente, skeletons

**Lacunas para fechar:**
- Sem seção "Como funciona" para comprador/locatário/proprietário
- Sem FAQ (e sem `FAQPage` JSON-LD)
- Sem bloco/seção de bairros atendidos com links indexáveis
- Sem `BreadcrumbList` JSON-LD
- Copy genérica em alguns blocos institucionais
- Página Anuncie pouco persuasiva (sem benefícios claros para proprietário)
- Privacy completa mas formal demais — falta um resumo visual de confiança
- CTAs WhatsApp pouco contextualizados por intenção (comprar vs alugar vs anunciar)
- Detalhe do imóvel sem bloco "fale com especialista" segmentado
- Listagens sem chip de filtros ativos visível e sem CTA intermediário de WhatsApp

---

## O que vou implementar

### 1. Novos componentes públicos compartilhados
- `src/components/shared/HowItWorks.tsx` — bloco com 3-4 passos, variante por intenção (comprar / alugar / anunciar)
- `src/components/shared/FaqSection.tsx` — accordion + injeção automática de `FAQPage` JSON-LD
- `src/components/shared/NeighborhoodsGrid.tsx` — grid de bairros de Itaúna com link para listagem filtrada (`/comprar?bairro=...`)
- `src/components/shared/TrustStrip.tsx` — faixa de confiança (CRECI, atendimento local, transparência, LGPD)
- `src/components/shared/BreadcrumbsJsonLd.tsx` — helper para `BreadcrumbList`
- `src/lib/whatsapp.ts` — helper `buildWhatsAppLink(intent, context)` para mensagens contextualizadas

### 2. Home (`Index.tsx`)
- Reescrever H1 e subtítulo com posicionamento local mais forte
- Adicionar `TrustStrip` logo após o hero
- Adicionar `HowItWorks` (variante "comprar/alugar/anunciar" em tabs)
- Adicionar `NeighborhoodsGrid` (SEO local + navegação)
- Adicionar `FaqSection` curta (5-6 perguntas)
- Reforçar CTAs: trocar "Anuncie seu imóvel" final por bloco com 3 jornadas (comprador, locatário, proprietário)

### 3. `Sobre`
- Reescrever copy: posicionamento, processo, compromisso, foco regional
- Adicionar bloco "Como atendemos" (timeline 4 etapas)
- Reforçar autoridade: CRECI + endereço + cobertura geográfica
- CTAs segmentados no final

### 4. `Contato`
- Cabeçalho mais comercial, microcopy por canal (telefone = atendimento rápido, WhatsApp = resposta em minutos, e-mail = retorno em até 1 dia útil)
- Departamentos com finalidade clara de cada um
- Mapa/endereço destacado

### 5. `Anuncie`
- Reescrever hero com benefícios para proprietário (avaliação sem compromisso, divulgação, triagem de interessados, suporte documental)
- Expandir "Como funciona" com 4 passos detalhados
- Bloco "Por que anunciar com a Líder" (4 diferenciais)
- FAQ específica para proprietários
- Manter o formulário, melhorar microcopy de campos

### 6. `PropertyDetail`
- Adicionar `BreadcrumbList` JSON-LD
- CTAs WhatsApp com mensagem contextualizada por compra/locação
- Bloco "Fale com um especialista" mais persuasivo no sidebar
- Microcopy do formulário mais clara
- Mantém galeria/lightbox/similar

### 7. `PropertyListing` (`/comprar`, `/alugar`)
- Subtítulo descritivo abaixo do H1 (SEO local)
- Chips de filtros ativos removíveis
- CTA intermediário ao final dos resultados ("Não encontrou? Fale conosco / Cadastre seu interesse")
- Adicionar `BreadcrumbList` JSON-LD

### 8. `Privacy`
- Adicionar resumo visual no topo (4 cards: o que coletamos, para que, seus direitos, contato DPO)
- Manter conteúdo legal completo abaixo
- Versão mais navegável com índice clicável

### 9. SEO técnico
- Atualizar `PageHead` para aceitar `keywords` e `canonical` opcionais
- `BreadcrumbList` JSON-LD em todas as páginas internas
- `FAQPage` JSON-LD nas páginas com FAQ
- Heading hierarchy revisada (um único H1 por página)

### 10. Padronização e polish
- Consistência de copy (botões, labels, mensagens)
- Revisão de espaçamentos verticais entre seções
- Acessibilidade: foco visível, aria-labels em ícones-only, contraste

---

## O que NÃO será alterado
- Área interna (`/admin`, `/parceiro`, `/cliente`) e seus componentes
- Auth, RBAC, integrações Supabase
- Schema/layouts internos
- Sem seção de depoimentos (proibido)

## Estimativa
- ~6 componentes novos compartilhados
- ~9 páginas públicas atualizadas (Index, About, Contact, Advertise, Privacy, PropertyDetail, PropertyListing, PageHead helper, whatsapp helper)
- 0 migrações SQL
- 0 mudanças em rotas

Após aprovação, executo em uma única passada por estar tudo no escopo público.

