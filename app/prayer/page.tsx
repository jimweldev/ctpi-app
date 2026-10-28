import type { Metadata } from "next"

import { PrayerList } from "@/components/prayer-list"

export const metadata: Metadata = {
  title: "Prayer",
}

export default function PrayerPage() {
  return <PrayerList />
}
