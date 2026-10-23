"use client"

import { getHeartLevel, useHeartChecks } from "@/lib/heart-checks"

function HeartCheckCount() {
  const latest = useHeartChecks().at(0)

  return (
    <span className="text-xs text-muted-foreground">
      {latest ? `Last: ${getHeartLevel(latest.level).label}` : "Check in"}
    </span>
  )
}

export { HeartCheckCount }
