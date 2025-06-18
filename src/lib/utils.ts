import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobile() {
  return window.innerWidth < 768;
}

export function isApple() {
  return (
    navigator.userAgent.includes("Mac") ||
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPad")
  );
}
