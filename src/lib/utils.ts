import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as currency (VND)
 * @param value - Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

/**
 * Format number with compact notation (K, M, B)
 * @param value - Number to format
 * @returns Compact formatted string
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Format percentage
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Get color class based on value (for stock price changes)
 * @param value - Number value
 * @returns Tailwind color class
 */
export function getColorClass(value: number): string {
  if (value > 0) return 'text-trade-up';
  if (value < 0) return 'text-trade-down';
  return 'text-trade-neutral';
}

/**
 * Get background color class based on value
 * @param value - Number value
 * @returns Tailwind background color class
 */
export function getBgColorClass(value: number): string {
  if (value > 0) return 'bg-trade-up/10';
  if (value < 0) return 'bg-trade-down/10';
  return 'bg-trade-neutral/10';
}

/**
 * Get neon glow class based on value
 * @param value - Number value
 * @returns Tailwind shadow class
 */
export function getGlowClass(value: number): string {
  if (value > 0) return 'shadow-neon-green';
  if (value < 0) return 'shadow-neon-red';
  return 'shadow-neon-purple';
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Clamp a number between min and max
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate random ID
 * @param prefix - Optional prefix
 * @returns Random ID string
 */
export function generateId(prefix: string = ''): string {
  const random = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${random}` : random;
}

/**
 * Sleep/delay function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if value is within range
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if value is in range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Calculate percentage change
 * @param oldValue - Old value
 * @param newValue - New value
 * @returns Percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Safe JSON parse with fallback
 * @param str - JSON string to parse
 * @param fallback - Fallback value if parse fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
