import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ErrorStatus } from './ErrorStatus';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />

      {/* Error status overlay - shows critical errors */}
      <ErrorStatus />
    </div>
  );
}
