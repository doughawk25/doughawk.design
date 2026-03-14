"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/motion"
import { pageNumberByPath } from "@/lib/tokens"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const pathname = usePathname()
  const pageNumber = pageNumberByPath[pathname]
  const displayTitle =
    title.endsWith(" Tokens")
      ? title.slice(0, -" Tokens".length)
      : title

  return (
    <motion.div
      className="mb-4 grid w-full grid-cols-[1fr_auto_1fr] items-start gap-x-4 gap-y-1 pb-6"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      {pageNumber != null && (
        <span className="col-start-1 font-mono text-xs text-muted-foreground">
          {pageNumber}
        </span>
      )}
      <h1 className="col-start-2 w-fit justify-self-center text-center text-3xl font-bold tracking-tight">
        {displayTitle}
      </h1>
      <p className="col-start-3 min-w-0 max-w-[232px] justify-self-end text-right text-xs text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}
