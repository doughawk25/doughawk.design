"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon, ListIcon, LayoutGridIcon } from "lucide-react"
import { PageHeader } from "@/components/docs/page-header"
import { TokenTable } from "@/components/docs/token-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { shadowTokens, blurTokens } from "@/lib/tokens"
import { transitions } from "@/lib/motion"

const blurEntries = Object.entries(blurTokens)
const slideDistance = 48
const swipeThreshold = 50

function BlurCarouselCards({
  index,
  direction,
  onPrev,
  onNext,
}: {
  index: number
  direction: number
  onPrev: () => void
  onNext: () => void
}) {
  const token = blurEntries[index]![1]
  const [blurReady, setBlurReady] = useState(false)
  const [swipeStart, setSwipeStart] = useState<number | null>(null)
  const wheelAccumulator = useRef(0)
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelCooldown = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const gestureEndMs = 250
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return
      e.preventDefault()
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current)
      wheelTimeout.current = setTimeout(() => {
        wheelAccumulator.current = 0
        wheelCooldown.current = false
        wheelTimeout.current = null
      }, gestureEndMs)
      if (wheelCooldown.current) return
      wheelAccumulator.current += e.deltaX
      if (wheelAccumulator.current > swipeThreshold) {
        wheelAccumulator.current = 0
        wheelCooldown.current = true
        onNext()
      } else if (wheelAccumulator.current < -swipeThreshold) {
        wheelAccumulator.current = 0
        wheelCooldown.current = true
        onPrev()
      }
    }
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [onPrev, onNext])

  useEffect(() => {
    if (swipeStart === null) return
    const handlePointerUp = (e: PointerEvent) => {
      const delta = e.clientX - swipeStart
      if (delta > swipeThreshold) onPrev()
      else if (delta < -swipeThreshold) onNext()
      setSwipeStart(null)
      document.removeEventListener("pointerup", handlePointerUp)
      document.removeEventListener("pointercancel", handlePointerUp)
    }
    document.addEventListener("pointerup", handlePointerUp)
    document.addEventListener("pointercancel", handlePointerUp)
    return () => {
      document.removeEventListener("pointerup", handlePointerUp)
      document.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [swipeStart, onPrev, onNext])

  useEffect(() => {
    setBlurReady(false)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBlurReady(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [index])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border border-border h-[448px] touch-none select-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => e.button === 0 && setSwipeStart(e.clientX)}
      style={{ overscrollBehavior: "none" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/example-bg.png)",
        }}
      />
      <div className="relative z-10 size-full flex items-center justify-center overflow-hidden px-12">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={blurEntries[index]![0]}
            custom={direction}
            initial={{ x: slideDistance * direction, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: transitions.normal }}
            exit={{ x: -slideDistance * direction, opacity: 0, transition: transitions.fast }}
            className="absolute flex items-center justify-center w-full"
          >
            <div
              className="w-64 rounded-lg border border-border bg-background/70 px-6 py-5 shadow-sm"
              style={{
                backdropFilter: blurReady ? `blur(${token.value})` : "blur(0px)",
                transition: `backdrop-filter ${transitions.slower.duration}s cubic-bezier(0, 0, 0.2, 1)`,
              }}
            >
              <p className="text-lg font-semibold">{token.label}</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {token.tailwind}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function BlurSection({ blurRows }: { blurRows: { name: string; values: Record<string, string>; raw: unknown }[] }) {
  const [blurView, setBlurView] = useState("cards")
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const goPrev = () => {
    if (blurEntries.length <= 1) return
    setDirection(-1)
    setIndex((i) => (i - 1 + blurEntries.length) % blurEntries.length)
  }
  const goNext = () => {
    if (blurEntries.length <= 1) return
    setDirection(1)
    setIndex((i) => (i + 1) % blurEntries.length)
  }
  const canPrev = blurEntries.length > 1
  const canNext = blurEntries.length > 1

  return (
    <div>
      <Tabs value={blurView} onValueChange={setBlurView} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Backdrop Blur</h2>
          <div className="flex items-center gap-2">
            {blurView === "cards" && (
              <>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full shrink-0"
                  disabled={!canPrev}
                  onClick={goPrev}
                >
                  <ChevronLeftIcon className="size-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full shrink-0"
                  disabled={!canNext}
                  onClick={goNext}
                >
                  <ChevronRightIcon className="size-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </>
            )}
            <TabsList>
              <TabsTrigger value="table">
                <ListIcon className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="cards">
                <LayoutGridIcon className="size-4" />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <div className="min-h-[448px]">
        <TabsContent value="table" className="mt-0">
          <TokenTable
            tokens={blurRows}
            columns={[
              { key: "value", label: "Value" },
              { key: "tailwind", label: "Tailwind" },
              { key: "description", label: "Usage" },
              {
                key: "example",
                label: "Example",
                render: (row) => {
                  const token = row.raw as (typeof blurTokens)[keyof typeof blurTokens]
                  if (!token) return null
                  return (
                    <div
                      className="relative overflow-hidden rounded h-8 w-24 border border-border bg-cover bg-center"
                      style={{
                        backgroundImage: "url(/example-bg.png)",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-background/50"
                        style={{ backdropFilter: `blur(${token.value})` }}
                      />
                    </div>
                  )
                },
              },
            ]}
          />
        </TabsContent>
        <TabsContent value="cards" className="mt-0">
          <BlurCarouselCards
            index={index}
            direction={direction}
            onPrev={goPrev}
            onNext={goNext}
          />
        </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default function TokensEffectsPage() {
  const shadowRows = Object.entries(shadowTokens).map(([name, token]) => ({
    name,
    values: {
      value: token.value,
      tailwind: token.tailwind,
      description: token.description,
    },
    raw: token,
  }))

  const blurRows = Object.entries(blurTokens).map(([name, token]) => ({
    name,
    values: {
      value: token.value,
      tailwind: token.tailwind,
      description: token.description,
    },
    raw: token,
  }))

  return (
    <>
      <PageHeader
        title="Effects Tokens"
        description="Shadow and backdrop blur values using Tailwind v4 defaults."
      />

      <section className="space-y-8">
        <BlurSection blurRows={blurRows} />

        <div>
          <Tabs defaultValue="table" className="w-full">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">Shadow</h2>
              <TabsList>
                <TabsTrigger value="table">
                  <ListIcon className="size-4" />
                </TabsTrigger>
                <TabsTrigger value="cards">
                  <LayoutGridIcon className="size-4" />
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="min-h-[420px]">
              <TabsContent value="table" className="mt-0">
                <TokenTable
                  tokens={shadowRows}
                  columns={[
                    { key: "value", label: "Value" },
                    { key: "tailwind", label: "Tailwind" },
                    { key: "description", label: "Usage" },
                    {
                      key: "example",
                      label: "Example",
                      render: (row) => {
                        const token = row.raw as (typeof shadowTokens)[keyof typeof shadowTokens]
                        if (!token) return null
                        return (
                          <div
                            className="h-8 w-24 rounded border border-border bg-card"
                            style={{ boxShadow: token.value }}
                          />
                        )
                      },
                    },
                  ]}
                />
              </TabsContent>
              <TabsContent value="cards" className="mt-0">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {Object.entries(shadowTokens).map(([key, token]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border bg-card p-6 min-h-[120px]"
                      style={{ boxShadow: token.value }}
                    >
                      <p className="text-base font-medium">{token.label}</p>
                      <p className="text-sm text-muted-foreground font-mono mt-2">
                        {token.tailwind}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  )
}
