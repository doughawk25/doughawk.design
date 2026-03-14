"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DocsSidebar } from "@/components/docs/sidebar-nav"
import { Logo } from "@/components/docs/logo"

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// Section segments that don't have their own page — skip in breadcrumbs
const SECTION_ONLY_SEGMENTS = ["foundation", "tokens"]

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const timeZones = [
    { label: "Local", tz: undefined },
    { label: "ET", tz: "America/New_York" },
    { label: "PT", tz: "America/Los_Angeles" },
    { label: "GMT", tz: "Europe/London" },
    { label: "JST", tz: "Asia/Tokyo" },
  ]
  const [times, setTimes] = useState<{ time: string; label: string }[]>([])

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTimes(
        timeZones.map(({ label, tz }) => ({
          time: now.toLocaleTimeString(undefined, {
            timeStyle: "short",
            timeZone: tz,
          }),
          label,
        }))
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const isDesignSystemPage =
    pathname.startsWith("/foundation") ||
    pathname.startsWith("/tokens") ||
    pathname.startsWith("/components") ||
    pathname === "/motion"

  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh overflow-hidden">
        {isDesignSystemPage && <DocsSidebar />}
        <SidebarInset
          className={isDesignSystemPage ? "min-h-dvh" : "min-h-0"}
        >
          <header className="flex h-14 items-center gap-2 px-4">
            {isDesignSystemPage && <SidebarTrigger />}
            {pathname !== "/" && (
              <Breadcrumb className="flex-1 min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname
                    .split("/")
                    .filter(Boolean)
                    .filter((segment) => !SECTION_ONLY_SEGMENTS.includes(segment))
                    .map((segment, i, segments) => {
                      const fullSegments = pathname.split("/").filter(Boolean)
                      const segmentIndex = fullSegments.indexOf(segment)
                      const href =
                        "/" +
                        fullSegments.slice(0, segmentIndex + 1).join("/")
                      const label = formatSegment(segment)
                      const isLast = i === segments.length - 1
                      return (
                        <React.Fragment key={href}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink render={<Link href={href} />}>
                                {label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      )
                    })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            <Link
              href="/"
              className={pathname === "/" ? "ml-auto" : ""}
              aria-label="Monad home"
            >
              <Logo className="h-8 w-auto text-foreground" aria-hidden />
            </Link>
          </header>
          <div className="min-h-0 flex-1 overflow-auto">
            <div
              className={
                pathname === "/"
                  ? "flex min-h-full w-full max-w-none flex-col items-center justify-center px-6 py-8"
                  : "mx-auto max-w-4xl px-6 py-8"
              }
            >
              {children}
            </div>
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {times.map(({ time, label }) => `${time} ${label}`).join(" - ")}
            </div>
            <div>© {new Date().getFullYear()}</div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
