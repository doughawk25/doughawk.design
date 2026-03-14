"use client"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "lucide-react"

export function ColorSwatch({
  name,
  value,
  description,
  className,
}: {
  name: string
  value: string
  description?: string
  className?: string
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      onClick={() => copy(value)}
      className={`group text-left ${className ?? ""}`}
    >
      <div
        className="h-16 w-full rounded-lg border border-border transition-shadow duration-[400ms] group-hover:shadow-md"
        style={{ backgroundColor: value }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <span className="text-xs text-muted-foreground font-mono">{value}</span>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </button>
  )
}
