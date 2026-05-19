import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE = 'https://portal-lider-real.lovable.app';

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(price: number, purpose: string): string {
  const v = Number(price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  return purpose === 'rent' ? `${v}/mês` : v;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    // path: /og-property/:id  OR  ?id=
    const parts = url.pathname.split('/').filter(Boolean);
    const id = url.searchParams.get('id') || parts[parts.length - 1];
    const canonical = `${SITE}/imovel/${id}`;

    if (!id || id === 'og-property') {
      return new Response('Missing id', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: p } = await supabase
      .from('properties')
      .select('id, code, title, type, purpose, price, rent_price, neighborhood, city, state, bedrooms, bathrooms, parking_spots, area, description, images')
      .eq('id', id)
      .maybeSingle();

    if (!p) {
      return new Response('Not found', { status: 404 });
    }

    const priceNum = p.purpose === 'rent' ? (p.rent_price || p.price) : p.price;
    const price = formatPrice(priceNum, p.purpose);
    const title = `${p.title} — ${price}`;
    const loc = [p.neighborhood, p.city, p.state].filter(Boolean).join(', ');
    const specs = [
      p.bedrooms ? `${p.bedrooms} quarto(s)` : null,
      p.bathrooms ? `${p.bathrooms} banheiro(s)` : null,
      p.parking_spots ? `${p.parking_spots} vaga(s)` : null,
      p.area ? `${p.area}m²` : null,
    ].filter(Boolean).join(' · ');
    const desc = [loc, specs, p.description ? String(p.description).slice(0, 160) : null]
      .filter(Boolean).join(' — ').slice(0, 300);
    const image = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Líder Imóveis" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(desc)}" />
<meta property="og:url" content="${canonical}" />
${image ? `<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:alt" content="${escapeHtml(p.title)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(desc)}" />
<meta http-equiv="refresh" content="0; url=${canonical}" />
</head>
<body>
<p>Redirecionando para <a href="${canonical}">${escapeHtml(p.title)}</a>…</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (err) {
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }
});
