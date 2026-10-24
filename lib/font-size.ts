"use client"

import { useSyncExternalStore } from "react"

import { FONT_SIZE_KEY as STORAGE_KEY } from "@/lib/font-size-script"

export const FONT_SIZES = [
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra large" },
] as const

export type FontSize = (typeof FONT_SIZES)[number]["value"]

const listeners = new Set<() => void>()

function read(): FontSize {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (FONT_SIZES.some((size) => size.value === stored)) {
      return stored as FontSize
    }
  } catch {
    // Storage blocked: fall back to the default size.
  }
  return "default"
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return
    document.documentElement.dataset.fontSize = read()
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** The chosen font size; null during server render. */
export function useFontSize() {
  return useSyncExternalStore(subscribe, read, () => null)
}

export function setFontSize(size: FontSize) {
  try {
    localStorage.setItem(STORAGE_KEY, size)
  } catch {
    // Storage blocked: still apply it for this visit.
  }
  document.documentElement.dataset.fontSize = size
  listeners.forEach((listener) => listener())
}
