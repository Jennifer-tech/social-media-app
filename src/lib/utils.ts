import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {format, formatDistanceToNowStrict} from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  console.log('currentDate', currentDate)
  console.log("currentDate.getTime", currentDate.getTime())
  if(currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true})
  } else {
    if(currentDate.getFullYear() === from.getFullYear()) {
      return format(from, "MMM d");
    } else {
      return format(from, "MMM d, yyyy")
    }
  }
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}
