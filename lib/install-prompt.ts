"use client"

import { useSyncExternalStore } from "react"

/** Chromium's install prompt event; not in the DOM typings. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/**
 * - `available`: the browser offered an install prompt we can show.
 * - `installed`: running as the installed app, or just installed.
 * - `ios`: Safari on iOS, which only installs via Share > Add to Home Screen.
 * - `unsupported`: no prompt (yet); install from the browser menu, if at all.
 * - `pending`: server render, before the client state is known.
 */
export type InstallState =
  "available" | "installed" | "ios" | "unsupported" | "pending"

const listeners = new Set<() => void>()
let deferredPrompt: BeforeInstallPromptEvent | null = null
let justInstalled = false
let capturing = false

function emit() {
  listeners.forEach((listener) => listener())
}

/**
 * Start listening for the browser's install prompt. Call once on app start:
 * the event fires early, often before the Settings page is open.
 */
export function captureInstallPrompt() {
  if (capturing) return
  capturing = true
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null
    justInstalled = true
    emit()
  })
}

function getState(): InstallState {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  if (standalone || justInstalled) return "installed"
  if (deferredPrompt) return "available"
  // iPadOS reports itself as a Mac; touch support tells them apart.
  const ios =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  return ios ? "ios" : "unsupported"
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useInstallState() {
  return useSyncExternalStore(subscribe, getState, () => "pending" as const)
}

/** Show the browser's install prompt. Each prompt can only be used once. */
export async function promptInstall() {
  const prompt = deferredPrompt
  if (!prompt) return
  deferredPrompt = null
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === "accepted") justInstalled = true
  emit()
}
