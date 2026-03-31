import { ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <HelmetProvider>
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  </HelmetProvider>
);

export default Layout;
