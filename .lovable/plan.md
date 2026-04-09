

## Enhanced hover animations for property cards

### Current state
- Image: `scale(1.05)` on hover, 500ms
- Card: `shadow-lg` on hover, 300ms
- Title: color changes to primary on hover

### Enhancements

**1 file: `src/components/property/PropertyCard.tsx`**

Upgrade the card with layered, premium hover effects using framer-motion's `whileHover`:

1. **Card lift** — use `motion.div` with `whileHover={{ y: -6 }}` for a subtle float effect, combined with enhanced shadow (`shadow-xl`)
2. **Image zoom** — increase scale to `1.08` with slower `duration-700` for cinematic feel
3. **Gradient overlay** — add a subtle dark overlay on the image that fades in on hover (CSS `opacity-0 group-hover:opacity-100`) for depth
4. **Price highlight** — price bar gets slightly more opaque background on hover (`from-black/70`)
5. **"Ver detalhes" indicator** — add a small arrow/text that appears on hover at the bottom-right of the image, signaling interactivity
6. **Border accent** — change border color to `primary/30` on hover for a subtle brand touch

All transitions use CSS `transition-all duration-300` or framer-motion for smooth, hardware-accelerated animation. No new dependencies needed.

