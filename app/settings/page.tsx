import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import {
  BackupControls,
  ClearDataButton,
  FontSizeSelector,
  InstallAppButton,
  ThemeSelector,
} from "@/components/settings-controls"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabClassName = "flex flex-col gap-8 text-base"

export const metadata: Metadata = {
  title: "Settings",
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-4">
        <Tabs defaultValue="appearance" className="gap-6">
          <TabsList className="h-10! w-full">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className={tabClassName}>
            <SettingsSection title="Theme">
              <ThemeSelector />
            </SettingsSection>

            <SettingsSection title="Font size">
              <FontSizeSelector />
            </SettingsSection>
          </TabsContent>

          <TabsContent value="data" className={tabClassName}>
            <SettingsSection
              title="Backup"
              description="Export a backup to move your data to another phone. Importing adds what isn't there yet; nothing is overwritten."
            >
              <BackupControls />
            </SettingsSection>

            <SettingsSection
              title="Clear"
              description="Memory verses, heart checks and alarms are stored on this device only."
            >
              <ClearDataButton />
            </SettingsSection>
          </TabsContent>

          <TabsContent value="about" className={tabClassName}>
            <SettingsSection
              title="App"
              description="Install for quick access from your home screen."
            >
              <InstallAppButton />
            </SettingsSection>

            <SettingsSection title="Copyright">
              <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 text-xs leading-relaxed text-muted-foreground ring-1 ring-foreground/8">
                <p className="text-sm font-medium text-foreground">
                  Calvary Temple Philippines Inc.
                </p>
                <p>
                  Scripture quotations marked NIV are taken from the Holy Bible,
                  New International Version®, NIV®. Copyright © 1973, 1978,
                  1984, 2011 by Biblica, Inc.™ Used by permission. All rights
                  reserved worldwide.
                </p>
                <p>
                  Scripture quotations marked NLT are taken from the Holy Bible,
                  New Living Translation, copyright © 1996, 2004, 2015 by
                  Tyndale House Foundation. Used by permission of Tyndale House
                  Publishers, Carol Stream, Illinois 60188. All rights reserved.
                </p>
                <p>
                  Scripture quotations marked CEV are from the Contemporary
                  English Version, copyright © 1991, 1992, 1995 by American
                  Bible Society. Used by permission.
                </p>
              </div>
            </SettingsSection>
          </TabsContent>
        </Tabs>
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
