import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { useAccessibilitySetup } from '../hooks/useAccessibility';
import Header from './Header';
import Footer from './Footer';
import { ErrorStatus } from './ErrorStatus';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  useAccessibilitySetup();

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col transition-colors duration-200">
        <Header />

        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>

        <Footer />

        {/* Error status overlay - shows critical errors */}
        <ErrorStatus />
      </div>
    </ThemeProvider>
  );
}
