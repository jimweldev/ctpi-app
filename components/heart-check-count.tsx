"use client"

import { getSoil, useHeartChecks } from "@/lib/heart-checks"

function HeartCheckCount() {
  const latest = useHeartChecks().at(0)

  return (
    <span className="text-xs text-muted-foreground">
      {latest ? `Last: ${getSoil(latest.soil).label}` : "Check in"}
    </span>
  )
}

export { HeartCheckCount }
