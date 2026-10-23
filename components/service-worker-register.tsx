"use client"

import * as React from "react"

function ServiceWorkerRegister() {
  React.useEffect(() => {
    // Skip in dev so the SW cache never serves stale HMR bundles.
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.error("Service worker registration failed:", error)
      })
  }, [])

  return null
}

export { ServiceWorkerRegister }
