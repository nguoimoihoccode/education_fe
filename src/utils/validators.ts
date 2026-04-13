// Validation utilities

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): { 
  isValid: boolean; 
  message?: string 
} => {
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  return { isValid: true };
};

/**
 * Validate stock symbol
 */
export const isValidStockSymbol = (symbol: string): boolean => {
  // Vietnamese stock symbols are typically 3 uppercase letters
  const symbolRegex = /^[A-Z]{3}$/;
  return symbolRegex.test(symbol);
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Validate number in range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};
