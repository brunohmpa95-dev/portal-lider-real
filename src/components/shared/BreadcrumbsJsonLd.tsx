import { Helmet } from 'react-helmet-async';

interface Crumb {
  name: string;
  path?: string;
}

interface BreadcrumbsJsonLdProps {
  items: Crumb[];
  baseUrl?: string;
}

const BreadcrumbsJsonLd = ({ items, baseUrl = 'https://portal-lider-real.lovable.app' }: BreadcrumbsJsonLdProps) => {
  const list = [{ name: 'Início', path: '/' }, ...items];
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: list.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          ...(c.path ? { item: `${baseUrl}${c.path}` } : {}),
        })),
      })}</script>
    </Helmet>
  );
};

export default BreadcrumbsJsonLd;
