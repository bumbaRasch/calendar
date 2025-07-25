// Animation utilities and constants for the calendar application

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  verySlow: 500,
} as const;

// Easing functions
export const EASING = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  bounceIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounceOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Predefined animation classes
export const ANIMATION_CLASSES = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInLeft: 'animate-fade-in-left',
  fadeInRight: 'animate-fade-in-right',

  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',

  // Slide animations
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  slideOutUp: 'animate-slide-out-up',
  slideOutDown: 'animate-slide-out-down',
  slideOutLeft: 'animate-slide-out-left',
  slideOutRight: 'animate-slide-out-right',

  // Rotation animations
  spin: 'animate-spin',
  spinSlow: 'animate-spin-slow',

  // Special effects
  wiggle: 'animate-wiggle',
  shake: 'animate-shake',
  ping: 'animate-ping',

  // Loading animations
  skeleton: 'animate-skeleton',
  shimmer: 'animate-shimmer',
} as const;

// Animation utility functions
export const createTransition = (
  property: string = 'all',
  duration: number = ANIMATION_DURATIONS.normal,
  easing: string = EASING.smooth,
  delay: number = 0,
): string => {
  const delayStr = delay > 0 ? ` ${delay}ms` : '';
  return `${property} ${duration}ms ${easing}${delayStr}`;
};

// CSS-in-JS animation styles
export const animationStyles = {
  fadeIn: {
    animation: `fadeIn ${ANIMATION_DURATIONS.normal}ms ${EASING.smooth}`,
  },
  fadeOut: {
    animation: `fadeOut ${ANIMATION_DURATIONS.normal}ms ${EASING.smooth}`,
  },
  scaleIn: {
    animation: `scaleIn ${ANIMATION_DURATIONS.fast}ms ${EASING.bounceOut}`,
  },
  scaleOut: {
    animation: `scaleOut ${ANIMATION_DURATIONS.fast}ms ${EASING.easeIn}`,
  },
  slideInUp: {
    animation: `slideInUp ${ANIMATION_DURATIONS.normal}ms ${EASING.smooth}`,
  },
  slideOutDown: {
    animation: `slideOutDown ${ANIMATION_DURATIONS.normal}ms ${EASING.smooth}`,
  },
  shimmer: {
    animation: `shimmer 2s infinite ${EASING.linear}`,
  },
  pulse: {
    animation: `pulse 2s infinite ${EASING.easeInOut}`,
  },
  bounce: {
    animation: `bounce 1s infinite`,
  },
  spin: {
    animation: `spin 1s linear infinite`,
  },
  wiggle: {
    animation: `wiggle 0.5s ${EASING.easeInOut}`,
  },
  shake: {
    animation: `shake 0.5s ${EASING.easeInOut}`,
  },
};

// Keyframe definitions (to be added to CSS)
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes scaleOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
  
  @keyframes slideInUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutUp {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-100%);
    }
  }
  
  @keyframes slideOutDown {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }
  
  @keyframes slideOutLeft {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  @keyframes skeleton {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
  
  @keyframes wiggle {
    0%, 7% {
      transform: rotateZ(0);
    }
    15% {
      transform: rotateZ(-15deg);
    }
    20% {
      transform: rotateZ(10deg);
    }
    25% {
      transform: rotateZ(-10deg);
    }
    30% {
      transform: rotateZ(6deg);
    }
    35% {
      transform: rotateZ(-4deg);
    }
    40%, 100% {
      transform: rotateZ(0);
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-10px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(10px);
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

// Helper to inject keyframes into document
export const injectKeyframes = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'calendar-animations';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.type = 'text/css';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = keyframes;
  }
};

// React hook for animations
export const useAnimations = (enabled: boolean = true) => {
  const getAnimationClass = (animationType: keyof typeof ANIMATION_CLASSES) => {
    return enabled ? ANIMATION_CLASSES[animationType] : '';
  };

  const getTransition = (
    property?: string,
    duration?: number,
    easing?: string,
    delay?: number,
  ) => {
    return enabled
      ? createTransition(property, duration, easing, delay)
      : 'none';
  };

  const getAnimationStyle = (animationType: keyof typeof animationStyles) => {
    return enabled ? animationStyles[animationType] : {};
  };

  return {
    enabled,
    getAnimationClass,
    getTransition,
    getAnimationStyle,
    DURATIONS: ANIMATION_DURATIONS,
    EASING,
  };
};

// Performance utilities
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const respectMotionPreferences = <T>(
  normalValue: T,
  reducedValue: T,
): T => {
  return shouldReduceMotion() ? reducedValue : normalValue;
};
