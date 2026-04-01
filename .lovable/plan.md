

## Change: Global background from white to light gray (#f3f4f6)

**#f3f4f6 in HSL** ≈ `220 14% 96%`

### What changes

**1 file: `src/index.css`**

- Change `--background: 0 0% 100%` → `--background: 220 14% 96%` (the HSL equivalent of #f3f4f6)
- Keep `--card: 0 0% 100%` as-is (white cards preserved)
- Keep `--popover`, `--sidebar-background`, `--surface-elevated` white/near-white for contrast
- Verify `--secondary` (currently `0 0% 96%`) — bump slightly to `0 0% 100%` so secondary sections (which use `bg-secondary/50`) remain visibly white against the new gray background

This single CSS variable change propagates everywhere `bg-background` is used (body, layout, pages), while cards, header, popovers, and dialogs stay white.

### Review for "washed out" sections

- The `bg-secondary/50` sections (Featured for Sale, Institutional) currently resolve to ~96% lightness at 50% opacity over white. Over the new gray background they'll blend more. Fix: change `--secondary` to `0 0% 100%` so those alternating sections read as white bands against gray.
- The `--surface-sunken` variable (used in client area) is already `0 0% 97%` — close to the new background. Change to `220 14% 93%` so it remains visibly darker than the main background.

