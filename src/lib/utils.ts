import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes leading and trailing quotation marks from a string if present
 * @param text - The text to clean
 * @returns The text without leading/trailing quotes
 */
export function removeQuotes(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }
  
  let cleaned = text.trim();
  
  // Remove surrounding quotes if present (both single and double quotes)
  if (cleaned.length > 1 && 
      ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
       (cleaned.startsWith("'") && cleaned.endsWith("'")))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  return cleaned;
}
