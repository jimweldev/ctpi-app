// Bump CACHE_VERSION to drop old caches after changing what gets precached.
const CACHE_VERSION = "v6"
const CACHE_NAME = `ctpi-${CACHE_VERSION}`
const OFFLINE_URL = "/offline.html"
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/logo.png",
  "/logo-wide.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]
// App pages cached on install so they open offline even if never visited.
const PRECACHE_PAGES = [
  "/",
  "/sermons",
  "/memory-verses",
  "/heart-check",
  "/heart-check/schedule",
  "/prayer",
  "/settings",
]

// Pull build assets and sermon links out of a page so they get cached too.
function extractUrls(html) {
  const urls = new Set()
  for (const match of html.matchAll(/\/_next\/static\/[^"'\s\\)]+/g)) {
    urls.add(match[0])
  }
  for (const match of html.matchAll(/\/_next\/image\?[^"\s,]+/g)) {
    urls.add(match[0].replaceAll("&amp;", "&"))
  }
  for (const match of html.matchAll(/href="(\/sermons\/[^"#?]+)"/g)) {
    urls.add(match[1])
  }
  return urls
}

async function precache() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(PRECACHE_URLS)

  const extra = new Set()
  await Promise.all(
    PRECACHE_PAGES.map(async (page) => {
      const response = await fetch(page, { cache: "no-cache" })
      if (!response.ok) return
      await cache.put(page, response.clone())
      extractUrls(await response.text()).forEach((url) => extra.add(url))
    })
  )

  // Sermon pages link to more assets; collect those in a second pass.
  const sermonPages = [...extra].filter((url) => url.startsWith("/sermons/"))
  await Promise.all(
    sermonPages.map(async (page) => {
      const response = await fetch(page, { cache: "no-cache" })
      if (!response.ok) return
      await cache.put(page, response.clone())
      extractUrls(await response.text()).forEach((url) => extra.add(url))
    })
  )

  const assets = [...extra].filter((url) => url.startsWith("/_next/"))
  await Promise.all(
    assets.map((url) =>
      cache.add(url).catch(() => {
        // A missing chunk should not block install.
      })
    )
  )
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache())
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ctpi-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

function putInCache(request, response) {
  if (response.ok && response.type === "basic") {
    const copy = response.clone()
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
  }
  return response
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Pages: network first so content stays fresh, cached copy when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache(url.pathname, response))
        .catch(async () => {
          const cached = await caches.match(url.pathname)
          return cached || caches.match(OFFLINE_URL)
        })
    )
    return
  }

  // RSC payloads for client-side navigation vary by router headers, so they
  // are not cached. When offline the fetch fails and Next.js falls back to a
  // full page load, which the navigate handler above serves from cache.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return

  // Hashed build assets, optimized images and icons never change at the same
  // URL.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches
        .match(request)
        .then(
          (cached) =>
            cached || fetch(request).then((r) => putInCache(request, r))
        )
    )
  }
})
