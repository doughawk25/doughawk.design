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
import { cn } from "@/lib/utils"
import { DocsSidebar } from "@/components/docs/sidebar-nav"
import { motion } from "framer-motion"
import { transitions } from "@/lib/motion"
import { Logo } from "@/components/docs/logo"
import { SystemAuthProvider } from "@/components/docs/system-auth-provider"
import { DrawingProvider, useDrawingContext } from "@/context/drawing-context"

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

function HomeLogo({ isHome }: { isHome: boolean }) {
  const { mode } = useDrawingContext()
  const isSmall = !isHome || mode === 'pen'
  return (
    <Link
      href="/"
      className="fixed top-3 right-6 z-50"
      aria-label="Monad home"
    >
      <motion.div
        animate={{ height: isSmall ? 32 : 96 }}
        transition={transitions.fast}
      >
        <Logo className="h-full w-auto text-foreground" aria-hidden />
      </motion.div>
    </Link>
  )
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
  const [localTime, setLocalTime] = useState("")

  useEffect(() => {
    const update = () => {
      setLocalTime(new Date().toLocaleTimeString(undefined, { timeStyle: "short" }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDesignSystemPage =
    pathname === "/system" ||
    pathname.startsWith("/foundation") ||
    pathname.startsWith("/tokens") ||
    pathname.startsWith("/components") ||
    pathname === "/motion"

  return (
    <DrawingProvider>
    <SystemAuthProvider pathname={pathname}>
    <TooltipProvider>
      <SidebarProvider className="h-dvh overflow-hidden">
        <SidebarOpenOnSystemNav />
        {isDesignSystemPage && <DocsSidebar />}
        <SidebarInset
          className={cn(
            isDesignSystemPage ? "min-h-dvh" : "min-h-0",
            pathname.startsWith("/tools") && "bg-transparent"
          )}
        >
          <header
            className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-2 px-4"
          >
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
            <HomeLogo isHome={pathname === "/"} />
          </header>
          {pathname.startsWith("/tools") ? (
            <div className="min-h-0 flex-1 overflow-auto">
              {children}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto pt-14">
              <div
                className={
                  pathname === "/"
                    ? "flex min-h-full w-full max-w-none flex-col items-center justify-center px-4 py-8"
                    : pathname === "/gallery"
                    ? "w-full px-6 py-8"
                    : "mx-auto max-w-4xl px-6 py-8"
                }
              >
                {children}
              </div>
            </div>
          )}
          <footer
            className={cn(
              "shrink-0 px-6 py-4 font-mono text-xs text-muted-foreground",
              pathname.startsWith("/tools") && "hidden"
            )}
          >
            {/* Desktop: single row */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-primary font-medium">{localTime}</span>
                <span className="opacity-50">·</span>
                <a href="https://www.instagram.com/_d0u9/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">Instagram</a>
                <a href="https://www.linkedin.com/in/doughawk25/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">LinkedIn</a>
                <a href="https://github.com/doughawk25" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
                <a href="https://www.youtube.com/playlist?list=PLeRINMiW66O7u5E6y8MXTRd9VFbxGI7Jo" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">YouTube</a>
                <span className="opacity-50">·</span>
                <a href="/doom" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">Doom</a>
              </div>
              <div className="flex items-center gap-4">
                {mounted && (
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
                )}
                <span>© {new Date().getFullYear()}</span>
              </div>
            </div>

            {/* Mobile: stacked rows */}
            <div className="flex flex-col gap-2 md:hidden">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a href="https://www.instagram.com/_d0u9/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">Instagram</a>
                <a href="https://www.linkedin.com/in/doughawk25/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">LinkedIn</a>
                <a href="https://github.com/doughawk25" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
                <a href="https://www.youtube.com/playlist?list=PLeRINMiW66O7u5E6y8MXTRd9VFbxGI7Jo" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">YouTube</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary font-medium">{localTime}</span>
                <div className="flex items-center gap-1">
                  {mounted && (["light", "dark", "system"] as const).map((t, i) => (
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
                  <span className="opacity-50 ml-1">·</span>
                  <span className="ml-1">© {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
    </SystemAuthProvider>
    </DrawingProvider>
  )
}
