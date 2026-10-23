import type { Metadata } from "next"

import { HeartCheckAlarmList } from "@/components/heart-check-alarms"

export const metadata: Metadata = {
  title: "Heart Check Alarms",
}

export default function HeartCheckAlarmsPage() {
  return <HeartCheckAlarmList />
}
