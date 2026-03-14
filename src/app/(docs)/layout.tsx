"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useTheme } from "next-themes"
import { DocsSidebar } from "@/components/docs/sidebar-nav"
import { Logo } from "@/components/docs/logo"
import { SystemAuthProvider } from "@/components/docs/system-auth-provider"

function SidebarOpenOnSystemNav() {
  const pathname = usePathname()
  const prevPathnameRef = React.useRef<string | null>(null)
  const { setOpen, setOpenMobile, isMobile } = useSidebar()

  React.useEffect(() => {
    const prev = prevPathnameRef.current
    prevPathnameRef.current = pathname

    const isDesignSystemPage =
      pathname === "/system" ||
      pathname.startsWith("/foundation") ||
      pathname.startsWith("/tokens") ||
      pathname.startsWith("/components") ||
      pathname === "/motion"

    if (prev === "/" && isDesignSystemPage) {
      if (isMobile) {
        setOpenMobile(true)
      } else {
        setOpen(true)
      }
    }
  }, [pathname, isMobile, setOpen, setOpenMobile])

  return null
}

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const timeZones = [
    { label: "ET", tz: "America/New_York" },
    { label: "CT", tz: "America/Chicago" },
    { label: "MT", tz: "America/Denver" },
    { label: "PT", tz: "America/Los_Angeles" },
    { label: "AKT", tz: "America/Anchorage" },
    { label: "HT", tz: "Pacific/Honolulu" },
  ]
  const tzToLabel: Record<string, string> = {
    "America/New_York": "ET",
    "America/Toronto": "ET",
    "America/Montreal": "ET",
    "America/Detroit": "ET",
    "America/Indiana/Indianapolis": "ET",
    "America/Chicago": "CT",
    "America/Mexico_City": "CT",
    "America/Denver": "MT",
    "America/Phoenix": "MT",
    "America/Boise": "MT",
    "America/Los_Angeles": "PT",
    "America/Vancouver": "PT",
    "America/San_Francisco": "PT",
    "America/Seattle": "PT",
    "America/Anchorage": "AKT",
    "America/Juneau": "AKT",
    "Pacific/Honolulu": "HT",
    "Pacific/Johnston": "HT",
  }
  const [times, setTimes] = useState<{ time: string; label: string }[]>([])
  const [primaryTzLabel, setPrimaryTzLabel] = useState<string | null>(null)

  useEffect(() => {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setPrimaryTzLabel(tzToLabel[userTz] ?? null)
  }, [])

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

  const { theme, setTheme } = useTheme()
  const isDesignSystemPage =
    pathname === "/system" ||
    pathname.startsWith("/foundation") ||
    pathname.startsWith("/tokens") ||
    pathname.startsWith("/components") ||
    pathname === "/motion"

  return (
    <SystemAuthProvider pathname={pathname}>
    <TooltipProvider>
      <SidebarProvider className="h-dvh overflow-hidden">
        <SidebarOpenOnSystemNav />
        {isDesignSystemPage && <DocsSidebar />}
        <SidebarInset
          className={isDesignSystemPage ? "min-h-dvh" : "min-h-0"}
        >
          <header className="flex h-14 items-center gap-2 px-4 bg-transparent backdrop-blur-md">
            {isDesignSystemPage && <SidebarTrigger />}
            {pathname !== "/" && (
              <Breadcrumb className="flex-1 min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  {(isDesignSystemPage && pathname !== "/system"
                    ? ["system", ...pathname.split("/").filter(Boolean)]
                    : pathname.split("/").filter(Boolean)
                  ).map((segment, i, fullSegments) => {
                      const href =
                        "/" + fullSegments.slice(0, i + 1).join("/")
                      const label = formatSegment(segment)
                      const isLast = i === fullSegments.length - 1
                      const isLocked =
                        (segment === "tokens" || segment === "foundation") &&
                        !isLast
                      return (
                        <React.Fragment key={href}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : isLocked ? (
                              <span className="cursor-default text-muted-foreground">
                                {label}
                              </span>
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
              {times.map(({ time, label }, i) => (
                <span key={label}>
                  {i > 0 && <span className="opacity-50"> · </span>}
                  <span className={primaryTzLabel === label ? "text-primary font-medium" : ""}>
                    {time} {label}
                  </span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                {(["light", "dark", "system"] as const).map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span className="opacity-50">·</span>}
                    <button
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`capitalize transition-colors hover:text-foreground ${
                        (theme ?? "system") === t ? "text-foreground font-medium" : ""
                      }`}
                    >
                      {t}
                    </button>
                  </React.Fragment>
                ))}
              </span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
    </SystemAuthProvider>
  )
}
