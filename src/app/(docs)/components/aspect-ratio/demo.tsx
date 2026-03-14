"use client"

import { useState } from "react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "lucide-react"

import { ComponentPreview } from "@/components/docs/component-preview"

const commonRatios = [
  { ratio: 16 / 9, label: "16:9", code: "16 / 9" },
  { ratio: 4 / 3, label: "4:3", code: "4 / 3" },
  { ratio: 1, label: "1:1", code: "1" },
  { ratio: 21 / 9, label: "21:9", code: "21 / 9" },
  { ratio: 3 / 2, label: "3:2", code: "3 / 2" },
  { ratio: 2, label: "2:1", code: "2" },
  { ratio: 9 / 16, label: "9:16", code: "9 / 16" },
] as const

function getAspectRatioCode(code: string) {
  return `<AspectRatio ratio={${code}}>
  <img src="..." alt="Photo" />
</AspectRatio>`
}

export function AspectRatioDemo() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const { copy } = useCopyToClipboard()

  const handleCopy = (code: string, label: string) => {
    copy(getAspectRatioCode(code))
    setCopiedLabel(label)
    setTimeout(() => setCopiedLabel(null), 2000)
  }

  return (
    <ComponentPreview
      name="Aspect Ratio"
      description="Displays content within a desired ratio."
      code={`<AspectRatio ratio={16 / 9}>
  <img src="..." alt="Photo" />
</AspectRatio>`}
    >
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 [&>button]:min-w-0">
        {commonRatios.map(({ ratio, label, code }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleCopy(code, label)}
            className="group block w-full text-left"
            aria-label={`Copy ${label} aspect ratio code`}
          >
            <AspectRatio
              ratio={ratio}
              className="relative min-w-0 bg-muted rounded-lg flex items-center justify-center"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="absolute top-2 right-2">
                {copiedLabel === label ? (
                  <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </span>
            </AspectRatio>
          </button>
        ))}
      </div>
    </ComponentPreview>
  )
}
