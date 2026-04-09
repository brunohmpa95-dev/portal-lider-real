

## Add "Simular financiamento na CAIXA" button to the homepage

### Placement
Insert a new section between the "Imóveis para Locação" section and the "Institutional" section on the homepage. This is a natural location — after property listings, before institutional content.

### Design
- Centered layout with a prominent button styled with the CAIXA blue (`#005CA9`) for brand recognition
- `ExternalLink` icon from lucide-react beside the button text
- Small muted disclaimer text below: "Você será redirecionado para o simulador oficial da CAIXA."
- Wrapped in `AnimatedSection` for consistency with the rest of the page
- Fully responsive — works on all screen sizes

### Changes

**1 file: `src/pages/Index.tsx`**

- Import `ExternalLink` from lucide-react
- Add a new `<AnimatedSection>` block between lines 144 and 146 containing:
  - A centered container with a styled `<a>` button using `target="_blank"` and `rel="noopener noreferrer"`
  - Link: `https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso`
  - Disclaimer text below in `text-muted-foreground text-sm`

No iframes, no simulator recreation — just a clean external link button.

