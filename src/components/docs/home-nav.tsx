"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
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
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (hoveredIndex !== null) setLastHoveredIndex(hoveredIndex)
  }, [hoveredIndex])

  const isSystemPage =
    pathname === "/system" ||
    pathname.startsWith("/foundation") ||
    pathname.startsWith("/tokens") ||
    pathname.startsWith("/components") ||
    pathname === "/motion"

  const activeIndex = items.findIndex((item) => {
    if (item.href === "/system") return isSystemPage
    return pathname === item.href || pathname.startsWith(item.href + "/")
  })

  return (
    <nav
      className="relative flex w-48 flex-col gap-1"
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
            "relative z-10 flex h-9 w-full items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
            (hoveredIndex === null || hoveredIndex === i) ? "text-primary" : "text-muted-foreground"
          )}
          onMouseEnter={() => setHoveredIndex(i)}
        >
          {item.label}
        </Link>
      ))}
      <motion.div
        className="pointer-events-none absolute inset-x-8 z-0 h-9 rounded-lg bg-muted"
        initial={false}
        animate={{
          opacity: hoveredIndex !== null ? 1 : 0,
          top: (hoveredIndex ?? lastHoveredIndex ?? activeIndex) * 40,
        }}
        transition={{
          opacity: { duration: 0.2 },
          top: { type: "spring", stiffness: 400, damping: 30 },
        }}
      />
    </nav>
  )
}

