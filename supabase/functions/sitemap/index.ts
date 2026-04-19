import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SITE = 'https://portal-lider-real.lovable.app';

const STATIC_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/comprar', priority: '0.9', changefreq: 'daily' },
  { path: '/alugar', priority: '0.9', changefreq: 'daily' },
  { path: '/financiamento', priority: '0.7', changefreq: 'monthly' },
  { path: '/anuncie', priority: '0.7', changefreq: 'monthly' },
  { path: '/sobre', priority: '0.5', changefreq: 'monthly' },
  { path: '/contato', priority: '0.5', changefreq: 'monthly' },
  { path: '/ouvidoria', priority: '0.3', changefreq: 'yearly' },
  { path: '/trabalhe-conosco', priority: '0.4', changefreq: 'monthly' },
  { path: '/privacidade', priority: '0.3', changefreq: 'yearly' },
];

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: properties } = await supabase
      .from('properties')
      .select('id, updated_at, status')
      .in('status', ['available', 'publicado', 'active'])
      .order('updated_at', { ascending: false })
      .limit(5000);

    const today = new Date().toISOString().split('T')[0];
    const urls: string[] = [];

    for (const s of STATIC_PATHS) {
      urls.push(
        `<url><loc>${SITE}${s.path}</loc><lastmod>${today}</lastmod><changefreq>${s.changefreq}</changefreq><priority>${s.priority}</priority></url>`,
      );
    }

    for (const p of properties ?? []) {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : today;
      urls.push(
        `<url><loc>${SITE}/imovel/${xmlEscape(p.id)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('sitemap error', err);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
});
