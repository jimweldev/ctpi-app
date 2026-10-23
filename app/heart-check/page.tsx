import type { Metadata } from "next"

import { HeartCheckList } from "@/components/heart-check-list"

export const metadata: Metadata = {
  title: "Heart Check",
}

export default function HeartCheckPage() {
  return <HeartCheckList />
}
