"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ColorSwatch } from "@/components/docs/color-swatch"
import { colorTokens, tailwindColorRamps } from "@/lib/tokens"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

export default function TokensColorPage() {
  return (
    <>
      <PageHeader
        title="Color Tokens"
        description="Full technical reference: all system tokens and Tailwind ramps. Click any swatch to copy."
      />

      {/* System tokens */}
      {Object.entries(colorTokens).map(([category, tokens]) => (
        <section key={category} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 capitalize">{category}</h2>
          <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(tokens).map(([name, token]) => (
              <ColorSwatch
                key={name}
                name={name}
                value={token.value}
                description={token.description}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Full Tailwind color ramps */}
      <div className="mt-12 mb-4">
        <h2 className="text-xl font-semibold">Tailwind Color Ramps</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Full color scales available via Tailwind utility classes (e.g. <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">bg-blue-500</code>).
        </p>
      </div>

      {Object.entries(tailwindColorRamps).map(([rampName, steps]) => (
        <ColorRamp key={rampName} name={rampName} steps={steps} />
      ))}
    </>
  )
}

function ColorRamp({
  name,
  steps,
}: {
  name: string
  steps: Record<string, { value: string; hex: string }>
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <section className="mb-6">
      <h3 className="text-sm font-semibold mb-2 capitalize">{name}</h3>
      <div className="flex gap-0 rounded-lg overflow-hidden border border-border">
        {Object.entries(steps).map(([step, color]) => (
          <button
            key={step}
            onClick={() => copy(color.hex)}
            className="group flex-1 relative"
            title={`${name}-${step}: ${color.hex}`}
          >
            <div
              className="h-12 w-full transition-transform group-hover:scale-110 group-hover:z-10 group-hover:shadow-lg group-hover:rounded-sm"
              style={{ backgroundColor: color.hex }}
            />
            <div className="text-center py-1">
              <span className="text-[10px] font-mono text-muted-foreground block">{step}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
