import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  children?: ReactNode;
}

const SITE = 'https://portal-lider-real.lovable.app';

const PageHead = ({ title, description, keywords, canonical, children }: PageHeadProps) => {
  const fullTitle = `${title} | Líder Imóveis Itaúna`;
  const canonicalUrl = canonical ? (canonical.startsWith('http') ? canonical : `${SITE}${canonical}`) : undefined;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {children}
    </Helmet>
  );
};

export default PageHead;
