import { useState, useEffect } from 'react';

interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
}

const getBreakpoint = (width: number): Breakpoints => {
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024 && width < 1280;
  const isLarge = width >= 1280;

  let currentBreakpoint: Breakpoints['currentBreakpoint'] = 'mobile';
  if (isLarge) currentBreakpoint = 'large';
  else if (isDesktop) currentBreakpoint = 'desktop';
  else if (isTablet) currentBreakpoint = 'tablet';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    currentBreakpoint,
  };
};

export const useBreakpoint = (): Breakpoints => {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>(() => {
    // Safe check for SSR
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLarge: false,
        currentBreakpoint: 'desktop',
      };
    }
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpoints(getBreakpoint(window.innerWidth));
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};
