"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSystemAuth } from "@/components/docs/system-auth-provider"

const items = [
  { label: "About", href: "/about", locked: true },
  { label: "Contact", href: "/contact", locked: true },
  { label: "Work", href: "/work", locked: true },
  { label: "Archive", href: "/archive", locked: true },
  { label: "System", href: "/system", locked: false },
] as const

export function HomeNav() {
  const pathname = usePathname()
  const auth = useSystemAuth()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <nav
      className="flex w-48 flex-col gap-1"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {items.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={
            item.locked && auth
              ? (e) => {
                  e.preventDefault()
                  auth.openModalForRedirect(item.href)
                }
              : undefined
          }
          className={cn(
            "flex h-9 w-full items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
            (hoveredIndex === null || hoveredIndex === i) ? "text-primary" : "text-muted-foreground"
          )}
          onMouseEnter={() => setHoveredIndex(i)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
