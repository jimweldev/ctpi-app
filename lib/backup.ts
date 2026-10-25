"use client"

import {
  getHeartCheckSchedules,
  importHeartCheckSchedules,
} from "@/lib/heart-check-schedules"
import { getHeartChecks, importHeartChecks } from "@/lib/heart-checks"
import { getMemoryVerses, importMemoryVerses } from "@/lib/memory-verses"

/** Marks a file as a backup from this app; bump `version` on format changes. */
const APP = "ctpi"
const VERSION = 1

/** Download every list stored on this device as one JSON file. */
export function downloadBackup() {
  const backup = {
    app: APP,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    memoryVerses: getMemoryVerses(),
    heartChecks: getHeartChecks(),
    heartCheckSchedules: getHeartCheckSchedules(),
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `calvary-temple-backup-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Add the items in a backup file that aren't on this device yet; nothing
 * is overwritten. Throws if the file isn't a backup from this app.
 */
export async function restoreBackup(file: File) {
  let backup: Record<string, unknown>
  try {
    backup = JSON.parse(await file.text())
  } catch {
    throw new Error("That file isn't a backup from this app.")
  }
  if (backup?.app !== APP) {
    throw new Error("That file isn't a backup from this app.")
  }
  const list = (value: unknown) => (Array.isArray(value) ? value : [])
  return {
    memoryVerses: importMemoryVerses(list(backup.memoryVerses)),
    heartChecks: importHeartChecks(list(backup.heartChecks)),
    heartCheckSchedules: importHeartCheckSchedules(
      // Backups made before the rename call these alarms.
      list(backup.heartCheckSchedules ?? backup.heartCheckAlarms)
    ),
  }
}
