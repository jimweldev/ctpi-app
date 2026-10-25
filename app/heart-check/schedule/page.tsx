import type { Metadata } from "next"

import { HeartCheckScheduleList } from "@/components/heart-check-schedules"

export const metadata: Metadata = {
  title: "Heart Check Schedule",
}

export default function HeartCheckSchedulesPage() {
  return <HeartCheckScheduleList />
}
