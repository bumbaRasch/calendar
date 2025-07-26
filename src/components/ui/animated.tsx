import React, {
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { cn } from '../../lib/utils';
import {
  useAnimations,
  ANIMATION_DURATIONS,
  EASING,
} from '../../lib/animations';

// Base animated component props
interface AnimatedProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  animation?:
    | 'fadeIn'
    | 'fadeOut'
    | 'scaleIn'
    | 'scaleOut'
    | 'slideInUp'
    | 'slideInDown'
    | 'slideInLeft'
    | 'slideInRight'
    | 'fadeInUp'
    | 'fadeInDown'
    | 'fadeInLeft'
    | 'fadeInRight';
  duration?: number;
  delay?: number;
  easing?: string;
  onAnimationEnd?: () => void;
  trigger?: boolean;
  disabled?: boolean;
}

// Generic animated wrapper component
export const Animated: React.FC<AnimatedProps> = ({
  children,
  className,
  style,
  animation = 'fadeIn',
  duration = ANIMATION_DURATIONS.normal,
  delay = 0,
  easing = EASING.smooth,
  onAnimationEnd,
  trigger = true,
  disabled = false,
}) => {
  const { enabled, getTransition } = useAnimations(!disabled);
  const [isVisible, setIsVisible] = useState(!trigger);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (trigger && enabled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setShouldAnimate(true);
      }, delay);

      return () => clearTimeout(timer);
    } else if (trigger) {
      setIsVisible(true);
    }
  }, [trigger, enabled, delay]);

  const handleAnimationEnd = () => {
    setShouldAnimate(false);
    onAnimationEnd?.();
  };

  if (!isVisible && enabled) {
    return null;
  }

  const animationStyles: CSSProperties = enabled
    ? {
        opacity: shouldAnimate ? 1 : animation.includes('fade') ? 0 : 1,
        transform: getAnimationTransform(animation, shouldAnimate),
        transition: getTransition('all', duration, easing),
      }
    : {};

  return (
    <div
      className={cn('animated-wrapper', className)}
      style={{
        ...animationStyles,
        ...style,
      }}
      onTransitionEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

// Helper function to get transform values
const getAnimationTransform = (
  animation: string,
  shouldAnimate: boolean,
): string => {
  if (!shouldAnimate) {
    switch (animation) {
      case 'scaleIn':
        return 'scale(0.8)';
      case 'scaleOut':
        return 'scale(1.2)';
      case 'slideInUp':
      case 'fadeInUp':
        return 'translateY(20px)';
      case 'slideInDown':
      case 'fadeInDown':
        return 'translateY(-20px)';
      case 'slideInLeft':
      case 'fadeInLeft':
        return 'translateX(-20px)';
      case 'slideInRight':
      case 'fadeInRight':
        return 'translateX(20px)';
      default:
        return 'none';
    }
  }
  return 'none';
};

// Specialized animated components
interface FadeInProps extends Omit<AnimatedProps, 'animation'> {
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({
  direction = 'none',
  ...props
}) => {
  const animationMap = {
    none: 'fadeIn' as const,
    up: 'fadeInUp' as const,
    down: 'fadeInDown' as const,
    left: 'fadeInLeft' as const,
    right: 'fadeInRight' as const,
  };

  return <Animated {...props} animation={animationMap[direction]} />;
};

interface SlideInProps extends Omit<AnimatedProps, 'animation'> {
  direction: 'up' | 'down' | 'left' | 'right';
}

export const SlideIn: React.FC<SlideInProps> = ({ direction, ...props }) => {
  const animationMap = {
    up: 'slideInUp' as const,
    down: 'slideInDown' as const,
    left: 'slideInLeft' as const,
    right: 'slideInRight' as const,
  };

  return <Animated {...props} animation={animationMap[direction]} />;
};

interface ScaleInProps extends Omit<AnimatedProps, 'animation'> {
  reverse?: boolean;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  reverse = false,
  ...props
}) => {
  return (
    <Animated
      {...props}
      animation={reverse ? 'scaleOut' : 'scaleIn'}
      easing={EASING.bounceOut}
    />
  );
};

// Staggered animation wrapper
interface StaggeredProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  animation?: AnimatedProps['animation'];
  disabled?: boolean;
}

export const Staggered: React.FC<StaggeredProps> = ({
  children,
  staggerDelay = 100,
  className,
  animation = 'fadeIn',
  disabled = false,
}) => {
  return (
    <div className={cn('staggered-container', className)}>
      {children.map((child, index) => (
        <Animated
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          disabled={disabled}
        >
          {child}
        </Animated>
      ))}
    </div>
  );
};

// Loading animation component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'currentColor',
}) => {
  const { enabled } = useAnimations();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent',
        sizeClasses[size],
        className,
      )}
      style={{
        borderTopColor: color,
        borderRightColor: color,
        animationDuration: enabled ? '1s' : '0s',
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton loading animation
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'text',
  animation = true,
}) => {
  const { enabled } = useAnimations(animation);

  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = enabled ? 'animate-pulse' : '';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const style: CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        className,
      )}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Pulse animation for highlighting elements
interface PulseProps {
  children: ReactNode;
  className?: string;
  color?: string;
  duration?: number;
  disabled?: boolean;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  className,
  color = 'rgb(59 130 246 / 0.5)', // blue-500 with opacity
  duration = 2000,
  disabled = false,
}) => {
  const { enabled } = useAnimations(!disabled);

  return (
    <div
      className={cn('relative', className)}
      style={{
        animation: enabled
          ? `pulse ${duration}ms infinite ease-in-out`
          : 'none',
      }}
    >
      {children}
      {enabled && (
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            backgroundColor: color,
            animation: `pulse ${duration}ms infinite ease-in-out`,
          }}
        />
      )}
    </div>
  );
};

// Bounce animation for interactive elements
interface BounceProps {
  children: ReactNode;
  className?: string;
  trigger?: boolean;
  disabled?: boolean;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  className,
  trigger = false,
  disabled = false,
}) => {
  const { enabled } = useAnimations(!disabled);
  const [shouldBounce, setShouldBounce] = useState(false);

  useEffect(() => {
    if (trigger && enabled) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger, enabled]);

  return (
    <div className={cn(shouldBounce ? 'animate-bounce' : '', className)}>
      {children}
    </div>
  );
};
