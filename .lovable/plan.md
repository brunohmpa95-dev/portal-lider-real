## Bug 1 — Persist form state across tabs

Today `PropertyForm.tsx` renders all sections (Informações, Valores, Localização, Detalhes, Fotos) as stacked Cards. Wrap them in `Tabs` from `@/components/ui/tabs` with 4 triggers: **Informações**, **Valores**, **Localização**, **Detalhes**, **Fotos**.

- Keep the single `useState(form)` lifted in `PropertyForm` (parent). Because all tab contents are mounted as children of the same component and only their visibility changes, the `form` state survives tab switches automatically — no remount, no data loss.
- Use `forceMount` on each `<TabsContent>` and toggle visibility via CSS (`hidden`) so unmounted inputs do not lose focus/typing state.
- Form only resets on successful save (existing `navigate` away) or Cancel button (existing behavior).

## Bug 2 — Cover photo selector

In `PropertyImageUpload.tsx`:

- Add a Star icon button (lucide `Star`) in the hover overlay → "Definir como capa". Clicking it moves the selected image to index `0` of the `images` array.
- Keep the existing **Capa** badge on `images[0]`; also add a primary-colored border ring on the cover thumbnail.
- No schema change: cover = `images[0]`. Property cards already use `images[0]` as thumbnail (verified in `PropertyCard.tsx` pattern).

## Bug 3 — Watermark with agency logo

Apply client-side via Canvas before upload (no edge function needed).

- Create `src/lib/watermark.ts` exporting `applyWatermark(file: File, logoUrl: string): Promise<File>`:
  - Load image into an offscreen `<canvas>` at original dimensions.
  - Load logo (`@/assets/logo-transparent.png`) sized to 20% of image width (preserving aspect ratio).
  - Draw logo bottom-right with 24px padding, `globalAlpha = 0.6`.
  - Export as JPEG (`canvas.toBlob`, quality 0.9) and return a new `File` preserving the original name with `.jpg` extension.
- In `PropertyImageUpload.handleFiles`: pipe each file through `applyWatermark()` before `supabase.storage.upload`. Skip watermark for files already > 20MB after processing (safety).
- Applies to every image including the cover (cover is just `images[0]`, no special path).

## Bug 4 — Status constraint mismatch

Current DB constraint allows only: `draft`, `published`, `archived`, `sold`, `rented`.
Current UI `PROPERTY_STATUS_OPTIONS` saves: `captacao`, `aguardando_documentacao`, `published`, `reserved`, `em_proposta`, `sold`, `rented`, `paused`.

Fix by **extending the DB constraint** (the richer workflow is intentional) via migration:

```sql
ALTER TABLE public.properties DROP CONSTRAINT properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check
  CHECK (status = ANY (ARRAY[
    'draft','published','archived','sold','rented',
    'captacao','aguardando_documentacao','reserved','em_proposta','paused'
  ]));
```

No UI value changes — labels remain in Portuguese, saved values stay as the DB-allowed strings.

## Files touched

- `src/pages/admin/PropertyForm.tsx` — wrap sections in Tabs
- `src/components/admin/PropertyImageUpload.tsx` — cover button + watermark integration
- `src/lib/watermark.ts` — new helper
- Migration — extend `properties_status_check`

No visual redesign; no changes to unrelated features.  
