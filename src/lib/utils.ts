import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

export function parseFormattedNumber(str: string): number {
  // In vi-VN, dot is thousands separator and comma is decimal separator
  // We remove dots and replace comma with dot for JavaScript Number parsing
  const cleanStr = str.replace(/\./g, '').replace(/,/g, '.');
  return Number(cleanStr) || 0;
}
