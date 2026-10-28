"use client"

import { usePrayers } from "@/lib/prayers"

function PrayerCount() {
  const prayers = usePrayers()
  const praying = prayers.filter((p) => p.answeredAt === undefined).length
  const answered = prayers.length - praying

  if (prayers.length === 0) return "Start your prayer list"
  return answered > 0
    ? `${praying} praying, ${answered} answered`
    : `${praying} ${praying === 1 ? "prayer" : "prayers"}`
}

export { PrayerCount }
