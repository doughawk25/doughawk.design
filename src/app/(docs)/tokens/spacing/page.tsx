"use client"

import { useState } from "react"
import { PageHeader } from "@/components/docs/page-header"
import { spacingTokens } from "@/lib/tokens"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "lucide-react"

export default function TokensSpacingPage() {
  const tokens = Object.entries(spacingTokens).map(([name, token]) => ({
    name: `spacing-${name}`,
    values: {
      rem: token.rem,
      px: token.value,
    },
    value: token.value,
  }))

  return (
    <>
      <PageHeader
        title="Spacing Tokens"
        description="Consistent spacing scale based on a 4px grid. Click any row to copy the token name."
      />

      <SpacingTable tokens={tokens} />
    </>
  )
}

function SpacingTable({
  tokens,
}: {
  tokens: { name: string; values: Record<string, string>; value: string }[]
}) {
  const { copy } = useCopyToClipboard()
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const handleCopy = (tokenName: string) => {
    copy(tokenName)
    setCopiedToken(tokenName)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Token</th>
            <th className="px-4 py-3 text-left font-medium">Value</th>
            <th className="px-4 py-3 text-left font-medium">Pixels</th>
            <th className="px-4 py-3 text-left font-medium">Example</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr
              key={token.name}
              onClick={() => handleCopy(token.name)}
              className="group cursor-pointer border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs font-medium">
                <span className="inline-flex items-center gap-2">
                  {token.name}
                  {copiedToken === token.name ? (
                    <CheckIcon className="h-3 w-3 text-green-600" />
                  ) : (
                    <CopyIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {token.values.rem}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {token.values.px}
              </td>
              <td className="px-4 py-3">
                <div
                  className="h-6 rounded-sm bg-primary transition-all"
                  style={{ width: token.value }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
