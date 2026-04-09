

## Add metrics summary bar to Leads Kanban

### What it does
Add a compact stats bar above the Kanban board showing key metrics at a glance: total leads, leads per stage with mini progress indicators, and conversion rate (closed vs total).

### Design

A horizontal scrollable row of small metric cards above the filters:

```text
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Novos    │ │ Fechados │ │ Conversão│
│   12     │ │    5     │ │    2     │ │  16.7%   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

- **Total leads**: count of all leads (unfiltered)
- **Per-stage counters**: show count for key stages (new, contact, proposal, closed, lost) with colored dots matching Kanban columns
- **Conversion rate**: `closed / (total - lost) * 100` percentage
- **Lost rate**: `lost / total * 100`
- Responsive: horizontal scroll on mobile, grid on desktop
- Uses existing `STAGE_COLORS` for consistency

### Changes

**1 file: `src/pages/admin/LeadsList.tsx`**

- Import `TrendingUp`, `TrendingDown`, `Users` from lucide-react
- Add a `renderMetrics()` function that computes counts from the `leads` array (all leads, not filtered)
- Render the metrics bar between the title row and the filter card
- Use a `grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2` layout with small cards showing icon + label + value
- Metrics shown: Total, Novos, Contato, Proposta, Fechados, Perdidos, Taxa de conversão, Taxa de perda

### About testing the Kanban drag-and-drop
The Kanban is rendering correctly on mobile with accordion view. Drag-and-drop is desktop-only (HTML5 native). The current viewport is 390px (mobile), so drag is not available — but the code and Supabase update logic are in place and will work on desktop.

