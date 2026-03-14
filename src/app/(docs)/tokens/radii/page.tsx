"use client"

import { PageHeader } from "@/components/docs/page-header"
import { Card } from "@/components/ui/card"
import { radiiTokens } from "@/lib/tokens"

export default function TokensRadiiPage() {
  return (
    <>
      <PageHeader
        title="Radii"
        description="Border radius values used across all components."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(radiiTokens).map(([key, token]) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-center mb-3">
              <div
                className="h-16 w-16 bg-primary"
                style={{ borderRadius: token.value }}
              />
            </div>
            <p className="text-sm font-medium text-center">{token.label}</p>
            <p className="text-xs text-muted-foreground text-center font-mono">
              {token.tailwind}
            </p>
            <p className="text-xs text-muted-foreground text-center font-mono">
              {token.value}
            </p>
          </Card>
        ))}
      </div>
    </>
  )
}
