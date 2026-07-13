import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts any Firestore Timestamp, JS Date, ISO string, milliseconds number,
 * or plain {seconds, nanoseconds} object to a JS Date.
 */
export function safeConvertToDate(value: any): Date | null {
  if (value === null || value === undefined) return null;
  
  // 1. If it's a Firestore Timestamp (has toDate method)
  if (typeof value.toDate === "function") {
    try {
      return value.toDate();
    } catch (e) {
      console.error("Error calling toDate() on timestamp:", e);
    }
  }
  
  // 2. If it's a plain object with seconds (e.g. from JSON serialization or offline cache)
  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1000000);
  }
  
  // 3. If it's a JS Date object
  if (value instanceof Date) {
    return value;
  }
  
  // 4. If it's a millisecond number
  if (typeof value === "number") {
    return new Date(value);
  }
  
  // 5. If it's a string (e.g. ISO string)
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return null;
}

/**
 * Safely gets the milliseconds since epoch for any Timestamp, Date, string, or number,
 * returning a fallback (default 0 or current time) if invalid.
 * Handles placeholders like FieldValue serverTimestamp() on client.
 */
export function safeGetMillis(value: any, fallback: number = 0): number {
  const date = safeConvertToDate(value);
  if (date) {
    const time = date.getTime();
    return isNaN(time) ? fallback : time;
  }
  
  // If value is a Firestore serverTimestamp() placeholder on client (object with no seconds/toDate)
  // we fallback to the current time so it is sorted as the newest request!
  if (value && typeof value === "object") {
    return Date.now();
  }
  
  return fallback;
}

/**
 * Returns a human-readable relative time string (e.g., '1m ago', '1D ago', '1month ago')
 */
export function getTimeAgo(timestamp: any): string {
  const date = safeConvertToDate(timestamp);
  if (!date) return "just now";

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  switch (true) {
    case (seconds < 60):
      return "just now";
    case (seconds < 3600):
      return `${Math.floor(seconds / 60)}m ago`;
    case (seconds < 86400):
      return `${Math.floor(seconds / 3600)}h ago`;
    case (seconds < 604800):
      return `${Math.floor(seconds / 86400)}D ago`;
    case (seconds < 2592000): {
      const weeks = Math.floor(seconds / 604800);
      return `${weeks}week${weeks > 1 ? 's' : ''} ago`;
    }
    case (seconds < 31536000): {
      const months = Math.floor(seconds / 2592000);
      return `${months}month${months > 1 ? 's' : ''} ago`;
    }
    default: {
      const years = Math.floor(seconds / 31536000);
      return `${years}year${years > 1 ? 's' : ''} ago`;
    }
  }
}
