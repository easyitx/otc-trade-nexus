
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe parsing function to prevent errors with undefined values
export function safeParseFloat(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  // Handle string values that might contain commas
  if (typeof value === 'string') {
    const sanitized = value.replace(/,/g, '');
    return isNaN(parseFloat(sanitized)) ? 0 : parseFloat(sanitized);
  }
  return typeof value === 'number' ? value : 0;
}
