"use client"

import { useSyncExternalStore } from "react"

/**
 * A list persisted in `localStorage` under `key`, shared by every component
 * that reads it and kept in sync across tabs.
 */
export function createLocalList<T extends { id: string }>(key: string) {
  const empty: T[] = []
  const listeners = new Set<() => void>()
  let cache: T[] | null = null

  function read(): T[] {
    if (cache) return cache
    try {
      cache = JSON.parse(localStorage.getItem(key) ?? "[]")
    } catch {
      cache = []
    }
    return cache ?? empty
  }

  function write(next: T[]) {
    cache = next
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Storage full or blocked: keep the in-memory copy for this session.
    }
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    // Another tab changed the list: drop the cache and re-read.
    function onStorage(event: StorageEvent) {
      if (event.key !== key) return
      cache = null
      listener()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener("storage", onStorage)
    }
  }

  function useList() {
    return useSyncExternalStore(subscribe, read, () => empty)
  }

  /** Add items whose id isn't saved yet; returns how many were added. */
  function merge(items: T[]) {
    const ids = new Set(read().map((item) => item.id))
    const added = items.filter((item) => !ids.has(item.id))
    if (added.length > 0) write([...read(), ...added])
    return added.length
  }

  return { read, write, merge, useList }
}
