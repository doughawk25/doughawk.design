"use client"

import type { ReactNode } from "react"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "lucide-react"

export function TokenTable({
  tokens,
  columns,
  rowClassName,
}: {
  tokens: { name: string; values: Record<string, string>; raw?: unknown }[]
  columns: { key: string; label: string; render?: (token: { name: string; values: Record<string, string>; raw?: unknown }) => ReactNode }[]
  rowClassName?: string
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Token</th>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr
              key={token.name}
              className={["border-b border-border last:border-0 hover:bg-muted/30 transition-colors", rowClassName].filter(Boolean).join(" ")}
            >
              <td className="px-4 py-3 font-mono text-xs font-medium">
                <button
                  onClick={() => copy(token.values[columns[0]?.key ?? "value"] ?? "")}
                  className="group inline-flex items-center gap-2"
                >
                  {token.name}
                  {copied ? (
                    <CheckIcon className="h-3 w-3 text-green-600" />
                  ) : (
                    <CopyIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? (
                    col.render(token)
                  ) : (
                    <span className="font-mono text-xs">
                      {token.values[col.key]}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
