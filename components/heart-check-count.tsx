"use client"

import { useHeartChecks } from "@/lib/heart-checks"

function HeartCheckCount() {
  const upcoming = useHeartChecks().filter(
    (check) => check.rating === undefined
  ).length

  return (
    <span className="text-xs text-muted-foreground">
      {upcoming === 0 ? "Schedule one" : `${upcoming} upcoming`}
    </span>
  )
}

export { HeartCheckCount }
