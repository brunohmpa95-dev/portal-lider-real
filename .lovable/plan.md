

# Plano de Implementação: JSON-LD, CRUD Admin com Upload de Fotos, e Testes

## Resumo

Três entregas em uma implementação:
1. JSON-LD para SEO (RealEstateListing na página de imóvel, LocalBusiness na home)
2. CRUD completo de imóveis no admin com upload de fotos ao bucket `property-images`
3. Teste do portal via navegador

---

## 1. JSON-LD para SEO

### Home — LocalBusiness
- Adicionar script `<script type="application/ld+json">` via `react-helmet-async` no componente `Index.tsx`
- Schema `LocalBusiness` com dados do `COMPANY` (nome, endereço, telefone, CRECI, horários, redes sociais)
- Incluir `RealEstateAgent` como `@type` adicional

### Página de Detalhe — RealEstateListing
- Adicionar JSON-LD no `PropertyDetail.tsx` via Helmet
- Schema `RealEstateListing` com: nome, descrição, preço, endereço, área, quartos, fotos, URL
- Dados dinâmicos vindos do objeto `property`

---

## 2. CRUD de Imóveis no Admin com Upload de Fotos

### PropertyForm.tsx — Adicionar Upload de Imagens
- Adicionar seção "Fotos" ao formulário existente com:
  - Input `type="file"` com `accept="image/*"` e `multiple`
  - Preview das imagens selecionadas (thumbnails)
  - Upload para o bucket `property-images` via `supabase.storage.from('property-images').upload()`
  - Gerar URL pública com `getPublicUrl()`
  - Salvar array de URLs no campo `images` da tabela `properties`
  - Drag-to-reorder das fotos (reordenação simples com botões mover)
  - Botão de remover foto individual
- Na edição, carregar imagens existentes e permitir adicionar/remover

### PropertiesList.tsx — Melhorias
- O CRUD já funciona (listagem, filtros, delete, toggle status)
- Adicionar thumbnail da primeira foto na tabela (coluna antes do código)
- A listagem já está conectada ao Supabase — apenas melhoria visual

### RLS do bucket property-images
- O bucket já é público (leitura). Verificar se há policies de upload para usuários autenticados com roles internos
- Criar migration para adicionar policy de INSERT no `storage.objects` para usuários com roles `corretor`, `vendas`, `administrativo`, `superadmin`

---

## 3. Testes via Navegador

Após implementar, navegar pelo portal:
- Home: verificar destaques e JSON-LD
- Listagem comprar/alugar: testar filtros
- Detalhe do imóvel: verificar galeria, ficha técnica, JSON-LD

---

## Arquivos Modificados

| Arquivo | Ação |
|---|---|
| `src/pages/Index.tsx` | Adicionar JSON-LD LocalBusiness |
| `src/pages/PropertyDetail.tsx` | Adicionar JSON-LD RealEstateListing |
| `src/pages/admin/PropertyForm.tsx` | Adicionar upload de fotos, previews, reordenação |
| `src/pages/admin/PropertiesList.tsx` | Adicionar thumbnail na tabela |
| Migration SQL | RLS policy para upload no bucket `property-images` |

---

## Ordem de Execução

1. Migration: RLS policy de upload no bucket `property-images`
2. JSON-LD na Home e PropertyDetail
3. Upload de fotos no PropertyForm
4. Thumbnail na PropertiesList
5. Testar portal completo via navegador

