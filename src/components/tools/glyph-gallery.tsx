"use client"

import { useState, useCallback, useEffect, useMemo, useRef, memo } from "react"
import { Download, ChevronLeft, ChevronRight, Plus, Check } from "lucide-react"
import { GLYPH_ALPHABET } from "@/lib/glyph-alphabet"
import { connectionKey, isAdjacent } from "./use-form-state"
import { MetaballSVG, nodePosFromIndex, PAD, CELL } from "./form-canvas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const GRID_SIZE = 3
const BLUR = 4

/** Compute active nodes: connected nodes always active, unconnected have seeded chance of being off */
function computeActiveNodes(connections: string[], seed: number): Set<number> {
  const connectedNodes = new Set<number>()
  for (const key of connections) {
    const [a, b] = key.split("_").map(Number)
    connectedNodes.add(a)
    connectedNodes.add(b)
  }
  const active = new Set<number>()
  // Simple seeded pseudo-random
  let s = seed
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return (s >> 16) / 32768
  }
  for (let i = 0; i < 9; i++) {
    if (connectedNodes.has(i)) {
      active.add(i)
    } else if (rand() > 0.35) {
      active.add(i)
    }
  }
  return active
}

/** Generate a random glyph variant (12 connection patterns) for a 3x3 grid */
function generateRandomRow(): string[][] {
  const N = GRID_SIZE
  // All possible adjacent pairs
  const allPairs: string[] = []
  for (let i = 0; i < N * N; i++) {
    for (let j = i + 1; j < N * N; j++) {
      if (isAdjacent(i, j, N)) allPairs.push(connectionKey(i, j))
    }
  }

  const variants: string[][] = []
  for (let v = 0; v < 12; v++) {
    // Pick 2-6 random connections
    const count = 2 + Math.floor(Math.random() * 5)
    const shuffled = [...allPairs].sort(() => Math.random() - 0.5)
    variants.push(shuffled.slice(0, count))
  }
  return variants
}

interface GlyphGalleryProps {
  nodeRadius?: number
  cornerRadius?: number
  neckWidth?: number
  threshold?: number
  onAddToFolder?: (connections: string[], activeNodes: number[]) => void
}

interface FlatEntry {
  glyphIndex: number
  variantIndex: number
  label: string
  connections: string[]
}

/** Add-to-folder button with confirmation animation */
function AddButton({ onAdd }: { onAdd: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onAdd()
      setConfirmed(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setConfirmed(false), 1200)
    },
    [onAdd]
  )

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute top-1 right-1 size-5 rounded-full flex items-center justify-center opacity-0 group-hover/glyph:opacity-100 transition-all duration-300 ease-in-out hover:scale-110"
      style={{
        backgroundColor: confirmed ? "var(--color-green-500, #22c55e)" : "var(--color-muted, rgba(0,0,0,0.08))",
        transition: "opacity 300ms ease-in-out, transform 200ms ease-out, background-color 300ms ease-in-out",
      }}
      title="Add to folder"
    >
      {confirmed ? (
        <Check className="size-3 text-white" strokeWidth={3} />
      ) : (
        <Plus className="size-3 text-muted-foreground" strokeWidth={2.5} />
      )}
    </button>
  )
}

/** Memoized glyph cell — keeps activeNodes stable across renders */
const GlyphCell = memo(function GlyphCell({
  connections,
  seed,
  nodeRadius,
  cornerRadius,
  neckWidth,
  threshold,
  svgId,
  glyphIndex,
  variantIndex,
  onOpen,
  onAdd,
}: {
  connections: string[]
  seed: number
  nodeRadius: number
  cornerRadius: number
  neckWidth: number
  threshold: number
  svgId: string
  glyphIndex: number
  variantIndex: number
  onOpen: (gi: number, vi: number) => void
  onAdd?: (connections: string[], activeNodes: number[]) => void
}) {
  const activeNodes = useMemo(
    () => computeActiveNodes(connections, seed),
    [connections, seed]
  )

  return (
    <div className="relative group/glyph aspect-square">
      <button
        type="button"
        className="w-full h-full overflow-hidden rounded-md text-foreground hover:text-indigo-500 transition-colors cursor-pointer"
        onClick={() => onOpen(glyphIndex, variantIndex)}
      >
        <MetaballSVG
          gridSize={GRID_SIZE}
          activeNodes={activeNodes}
          nodeRadius={nodeRadius}
          cornerRadius={cornerRadius}
          neckWidth={neckWidth}
          blur={BLUR}
          threshold={threshold}
          connections={connections}
          id={svgId}
        />
      </button>
      {onAdd && <AddButton onAdd={() => onAdd(connections, Array.from(activeNodes))} />}
    </div>
  )
})

/** Lazy row — only renders MetaballSVGs when visible */
function GlyphRow({
  glyph,
  glyphIndex,
  nodeRadius,
  cornerRadius,
  neckWidth,
  threshold,
  onOpen,
  onAdd,
}: {
  glyph: (typeof GLYPH_ALPHABET)[number]
  glyphIndex: number
  nodeRadius: number
  cornerRadius: number
  neckWidth: number
  threshold: number
  onOpen: (gi: number, vi: number) => void
  onAdd?: (connections: string[], activeNodes: number[]) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`grid grid-cols-12 gap-1 transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{ minHeight: 60 }}
    >
      {visible
        ? glyph.variants.map((connections, vi) => (
            <GlyphCell
              key={vi}
              connections={connections}
              seed={glyphIndex * 100 + vi}
              nodeRadius={nodeRadius}
              cornerRadius={cornerRadius}
              neckWidth={neckWidth}
              threshold={threshold}
              svgId={`glyph-${glyph.label}-${vi}`}
              glyphIndex={glyphIndex}
              variantIndex={vi}
              onOpen={onOpen}
              onAdd={onAdd}
            />
          ))
        : null}
    </div>
  )
}

export function GlyphGallery({
  nodeRadius = 30,
  cornerRadius = 100,
  neckWidth = 16,
  threshold = 20,
  onAddToFolder,
}: GlyphGalleryProps) {
  const flatList = useMemo(() => {
    const list: FlatEntry[] = []
    GLYPH_ALPHABET.forEach((glyph, gi) => {
      glyph.variants.forEach((connections, vi) => {
        list.push({ glyphIndex: gi, variantIndex: vi, label: glyph.label, connections })
      })
    })
    return list
  }, [])

  const [flatIndex, setFlatIndex] = useState<number | null>(null)
  const current = flatIndex !== null ? flatList[flatIndex] : null

  const goNext = useCallback(() => {
    setFlatIndex((prev) => (prev !== null ? (prev + 1) % flatList.length : null))
  }, [flatList.length])

  const goPrev = useCallback(() => {
    setFlatIndex((prev) =>
      prev !== null ? (prev - 1 + flatList.length) % flatList.length : null
    )
  }, [flatList.length])

  useEffect(() => {
    if (flatIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [flatIndex, goNext, goPrev])

  const openGlyph = useCallback(
    (gi: number, vi: number) => {
      const idx = flatList.findIndex(
        (e) => e.glyphIndex === gi && e.variantIndex === vi
      )
      setFlatIndex(idx >= 0 ? idx : null)
    },
    [flatList]
  )

  const handleExport = useCallback(() => {
    if (!current) return
    const svgSize = PAD * 2 + GRID_SIZE * CELL
    const rx = (cornerRadius / 100) * nodeRadius

    const lines = current.connections
      .map((key) => {
        const [i, j] = key.split("_").map(Number)
        const a = nodePosFromIndex(i, GRID_SIZE)
        const b = nodePosFromIndex(j, GRID_SIZE)
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="currentColor" stroke-width="${neckWidth * 2}" stroke-linecap="round"/>`
      })
      .join("\n    ")

    const activeNodes = computeActiveNodes(current.connections, current.glyphIndex * 100 + current.variantIndex)
    const circles = Array.from(activeNodes)
      .map((i) => {
        const { x, y } = nodePosFromIndex(i, GRID_SIZE)
        return `<rect x="${x - nodeRadius}" y="${y - nodeRadius}" width="${nodeRadius * 2}" height="${nodeRadius * 2}" rx="${rx}" ry="${rx}" fill="currentColor"/>`
      })
      .join("\n    ")

    const svg = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="mb" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${BLUR}" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold} ${-(threshold * 0.42)}"/>
    </filter>
  </defs>
  <g filter="url(#mb)">
    ${lines}
    ${circles}
  </g>
</svg>`

    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `glyph-${current.label}-${current.variantIndex + 1}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [current, nodeRadius, cornerRadius, neckWidth, threshold])

  // Infinite scroll: generated random rows
  const [generatedRows, setGeneratedRows] = useState<string[][][]>([])
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGeneratedRows((prev) => {
            const batch: string[][][] = []
            for (let i = 0; i < 8; i++) batch.push(generateRandomRow())
            return [...prev, ...batch]
          })
        }
      },
      { rootMargin: "400px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="space-y-2">
        {GLYPH_ALPHABET.map((glyph, gi) => (
          <GlyphRow
            key={glyph.label}
            glyph={glyph}
            glyphIndex={gi}
            nodeRadius={nodeRadius}
            cornerRadius={cornerRadius}
            neckWidth={neckWidth}
            threshold={threshold}
            onOpen={openGlyph}
            onAdd={onAddToFolder}
          />
        ))}
        {/* Generated random rows */}
        {generatedRows.map((variants, ri) => (
          <GlyphRow
            key={`gen-${ri}`}
            glyph={{ label: `~${ri + 1}`, variants }}
            glyphIndex={GLYPH_ALPHABET.length + ri}
            nodeRadius={nodeRadius}
            cornerRadius={cornerRadius}
            neckWidth={neckWidth}
            threshold={threshold}
            onOpen={openGlyph}
            onAdd={onAddToFolder}
          />
        ))}
      </div>
      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {/* Carousel modal */}
      <Dialog
        open={flatIndex !== null}
        onOpenChange={(open) => {
          if (!open) setFlatIndex(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {current?.label}{" "}
              <span className="text-muted-foreground font-normal">
                — variant {current ? current.variantIndex + 1 : ""}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="shrink-0 size-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </Button>

            <div className="flex-1 aspect-square">
              {current && (
                <MetaballSVG
                  gridSize={GRID_SIZE}
                  activeNodes={computeActiveNodes(current.connections, current.glyphIndex * 100 + current.variantIndex)}
                  nodeRadius={nodeRadius}
                  cornerRadius={cornerRadius}
                  neckWidth={neckWidth}
                  blur={BLUR}
                  threshold={threshold}
                  connections={current.connections}
                  id="glyph-modal"
                />
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="shrink-0 size-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          <div className="text-center font-mono text-xs text-muted-foreground tabular-nums">
            {flatIndex !== null ? flatIndex + 1 : ""} / {flatList.length}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="font-mono text-xs"
            >
              <Download className="size-3.5 mr-1.5" />
              Export SVG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
