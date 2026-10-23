import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import {
  ClearDataButton,
  InstallAppButton,
  ThemeSelector,
} from "@/components/settings-controls"

export const metadata: Metadata = {
  title: "Settings",
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
        <SettingsSection title="Appearance">
          <ThemeSelector />
        </SettingsSection>

        <SettingsSection
          title="App"
          description="Install for quick access from your home screen."
        >
          <InstallAppButton />
        </SettingsSection>

        <SettingsSection
          title="Data"
          description="Memory verses, heart checks and alarms are stored on this device only."
        >
          <ClearDataButton />
        </SettingsSection>

        <SettingsSection title="About">
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 text-xs leading-relaxed text-muted-foreground ring-1 ring-foreground/8">
            <p className="text-sm font-medium text-foreground">
              Calvary Temple Philippines Inc.
            </p>
            <p>
              Scripture quotations marked NIV are taken from the Holy Bible, New
              International Version®, NIV®. Copyright © 1973, 1978, 1984, 2011
              by Biblica, Inc.™ Used by permission. All rights reserved
              worldwide.
            </p>
            <p>
              Scripture quotations marked NLT are taken from the Holy Bible, New
              Living Translation, copyright © 1996, 2004, 2015 by Tyndale House
              Foundation. Used by permission of Tyndale House Publishers, Carol
              Stream, Illinois 60188. All rights reserved.
            </p>
            <p>
              Scripture quotations marked CEV are from the Contemporary English
              Version, copyright © 1991, 1992, 1995 by American Bible Society.
              Used by permission.
            </p>
          </div>
        </SettingsSection>
      </main>
    </>
  )
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
      {description && (
        <p className="px-1 text-xs text-muted-foreground">{description}</p>
      )}
    </section>
  )
}
