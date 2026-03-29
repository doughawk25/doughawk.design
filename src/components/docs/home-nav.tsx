"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSystemAuth } from "@/components/docs/system-auth-provider"
import { transitions } from "@/lib/motion"

const items = [
  { label: "Work", href: "/work", locked: true },
  { label: "Contact", href: "/contact", locked: true },
  { label: "About", href: "/about", locked: true },
  { label: "Archive", href: "/archive", locked: true },
  { label: "Tools", href: "/tools", locked: false },
  { label: "System", href: "/system", locked: false },
] as const

const container = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
}

const navItem = {
  initial: { x: -12, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: transitions.normal },
  exit: { x: -12, opacity: 0, transition: transitions.fast },
}

export function HomeNav() {
  const pathname = usePathname()
  const auth = useSystemAuth()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.nav
      className="relative flex w-48 flex-col gap-1 items-start text-left"
      onMouseLeave={() => setHoveredIndex(null)}
      variants={container}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {items.map((item, i) => (
        <motion.div key={item.href} variants={navItem}>
          <motion.div
            animate={{ x: hoveredIndex === i ? 6 : 0 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          >
            <Link
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
                "relative z-10 flex w-full items-center justify-start rounded-lg text-base font-medium transition-colors duration-400 ease-out",
                (hoveredIndex === null || hoveredIndex === i) ? "text-primary" : "text-muted-foreground/50"
              )}
              onMouseEnter={() => setHoveredIndex(i)}
            >
              {item.label}
            </Link>
          </motion.div>
        </motion.div>
      ))}
    </motion.nav>
  )
}
