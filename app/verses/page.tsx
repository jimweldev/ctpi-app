import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { VerseLibrary } from "@/components/verse-library"
import { getAllTags, getAllVerses } from "@/lib/verses"

export const metadata: Metadata = {
  title: "Verses",
}

export default function VersesPage() {
  return (
    <>
      <PageHeader title="Verses" back={{ href: "/", label: "Home" }} />
      <VerseLibrary verses={getAllVerses()} tags={getAllTags()} />
    </>
  )
}
