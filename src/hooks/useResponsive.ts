import { useState, useEffect } from 'react';
import { throttle } from '../lib/utils';

// Breakpoint values matching Tailwind config
const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface ResponsiveState {
  width: number;
  height: number;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  is3Xl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * Custom hook for responsive design
 * Provides screen size information and breakpoint checks
 * 
 * @returns ResponsiveState object with screen information
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, width } = useResponsive();
 * 
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * 
 * return <DesktopView />;
 * ```
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return getDefaultState();
    }
    return calculateState();
  });

  useEffect(() => {
    // Throttled resize handler for better performance
    const handleResize = throttle(() => {
      setState(calculateState());
    }, 150);

    // Initial calculation
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}

/**
 * Hook to check if current screen matches a specific breakpoint
 * 
 * @param breakpoint - Breakpoint to check
 * @returns True if screen width is >= breakpoint
 * 
 * @example
 * ```tsx
 * const isLargeScreen = useBreakpoint('lg');
 * ```
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook to check if screen is within a range of breakpoints
 * 
 * @param min - Minimum breakpoint
 * @param max - Maximum breakpoint (optional)
 * @returns True if screen is within range
 * 
 * @example
 * ```tsx
 * const isTabletRange = useBreakpointRange('md', 'lg');
 * ```
 */
export function useBreakpointRange(min: Breakpoint, max?: Breakpoint): boolean {
  const { width } = useResponsive();
  const minWidth = BREAKPOINTS[min];
  const maxWidth = max ? BREAKPOINTS[max] : Infinity;
  
  return width >= minWidth && width < maxWidth;
}

/**
 * Hook to get current orientation
 * 
 * @returns Current screen orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { orientation } = useResponsive();
  return orientation;
}

/**
 * Hook to detect touch device
 * 
 * @returns True if device supports touch
 */
export function useTouchDevice(): boolean {
  const { isTouch } = useResponsive();
  return isTouch;
}

// Helper functions

function calculateState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Check if device supports touch
  const isTouch = 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;

  // Determine orientation
  const orientation = width > height ? 'landscape' : 'portrait';

  // Breakpoint checks
  const isXs = width >= BREAKPOINTS.xs;
  const isSm = width >= BREAKPOINTS.sm;
  const isMd = width >= BREAKPOINTS.md;
  const isLg = width >= BREAKPOINTS.lg;
  const isXl = width >= BREAKPOINTS.xl;
  const is2Xl = width >= BREAKPOINTS['2xl'];
  const is3Xl = width >= BREAKPOINTS['3xl'];

  // Device type checks
  const isMobile = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  return {
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    is3Xl,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    orientation,
  };
}

function getDefaultState(): ResponsiveState {
  return {
    width: 1024,
    height: 768,
    isXs: true,
    isSm: true,
    isMd: true,
    isLg: true,
    isXl: false,
    is2Xl: false,
    is3Xl: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    orientation: 'landscape',
  };
}
