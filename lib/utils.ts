import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { Question } from "./questions"

export const getUniqueValues = (arr: Question[], key: keyof Question): string[] => {
  return Array.from(new Set(arr.map(item => String(item[key]))))
}
