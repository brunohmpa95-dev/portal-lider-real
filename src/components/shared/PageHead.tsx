import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

const PageHead = ({ title, description }: PageHeadProps) => (
  <Helmet>
    <title>{title} | Líder Imóveis Itaúna</title>
    {description && <meta name="description" content={description} />}
  </Helmet>
);

export default PageHead;
