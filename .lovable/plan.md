
O usuário pediu para verificar todo o site no formato mobile. Isso é teste/verificação no preview — vou usar o browser em viewport mobile (375x812, iPhone) para inspecionar as páginas principais públicas e internas, capturar screenshots e reportar problemas reais de layout, overflow, toques pequenos demais, navegação quebrada etc.

## Escopo da verificação mobile (375x812)

**Site público:**
1. `/` — Home (hero, busca, vitrines, simulador, grid de bairros, FAQ, footer)
2. `/comprar` — listagem com filtros, chips, paginação
3. `/alugar` — idem
4. `/imovel/:id` — detalhe (galeria, lightbox, formulário, WhatsApp)
5. `/financiamento` — simulador, passos, docs, FAQ
6. `/anuncie` — formulário com select de bairro
7. `/sobre`, `/contato`, `/ouvidoria`, `/trabalhe-conosco`, `/privacidade` — varredura rápida
8. Header mobile (menu hambúrguer) e Footer

**Áreas internas (se acessível com sessão atual):**
9. `/admin` Dashboard (KPIs, funil, pendências)
10. `/admin/leads` (Kanban — crítico em mobile)
11. `/admin/tarefas`
12. `/admin/imoveis`, `/admin/bairros`

## O que vou avaliar em cada tela

- Overflow horizontal (scroll lateral indevido)
- Texto cortado, sobreposto ou ilegível
- Botões/áreas de toque < 40px
- Imagens estouradas ou desproporcionais
- Modais/drawers que ficam fora da viewport
- Kanban no mobile (geralmente problemático — confirmar se há fallback)
- Tabelas que não viram cards/lista
- Header sticky e menu hambúrguer
- Formulários (selects, inputs, datepickers)
- WhatsApp button fixo não cobrindo conteúdo

## Entrega

Relatório objetivo agrupado por:
- ✅ OK
- ⚠️ Ajuste recomendado (com print)
- ❌ Bug real (com print + correção sugerida)

Ao final, listo as correções priorizadas. Se encontrar bugs durante a auditoria, paro e te aviso antes de seguir corrigindo (regra do modo browser).

Sem mudanças de código nesta etapa — só auditoria. Após o relatório você decide o que corrigir.
