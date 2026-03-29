"use client"

import { useCallback } from "react"
import { Download, X } from "lucide-react"
import { MetaballSVG, nodePosFromIndex, PAD, CELL } from "./form-canvas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SavedGlyph } from "./form-builder"

const GRID_SIZE = 3
const BLUR = 4

function computeActiveNodesFromArray(nodes: number[]): Set<number> {
  return new Set(nodes)
}

interface GlyphFolderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  glyphs: SavedGlyph[]
  onRemove: (id: string) => void
  nodeRadius: number
  cornerRadius: number
  neckWidth: number
  threshold: number
}

export function GlyphFolder({
  open,
  onOpenChange,
  glyphs,
  onRemove,
  nodeRadius,
  cornerRadius,
  neckWidth,
  threshold,
}: GlyphFolderProps) {
  const downloadSVG = useCallback(
    (glyph: SavedGlyph, index: number) => {
      const svgSize = PAD * 2 + GRID_SIZE * CELL
      const rx = (cornerRadius / 100) * nodeRadius
      const activeNodes = computeActiveNodesFromArray(glyph.activeNodes)

      const lines = glyph.connections
        .map((key) => {
          const [i, j] = key.split("_").map(Number)
          const a = nodePosFromIndex(i, GRID_SIZE)
          const b = nodePosFromIndex(j, GRID_SIZE)
          return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="currentColor" stroke-width="${neckWidth * 2}" stroke-linecap="round"/>`
        })
        .join("\n    ")

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
      a.download = `glyph-${index + 1}.svg`
      a.click()
      URL.revokeObjectURL(url)
    },
    [nodeRadius, cornerRadius, neckWidth, threshold]
  )

  const downloadPNG = useCallback(
    (glyph: SavedGlyph, index: number) => {
      const svgSize = PAD * 2 + GRID_SIZE * CELL
      const rx = (cornerRadius / 100) * nodeRadius
      const activeNodes = computeActiveNodesFromArray(glyph.activeNodes)
      const scale = 4 // 4x for high-res

      const lines = glyph.connections
        .map((key) => {
          const [i, j] = key.split("_").map(Number)
          const a = nodePosFromIndex(i, GRID_SIZE)
          const b = nodePosFromIndex(j, GRID_SIZE)
          return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="black" stroke-width="${neckWidth * 2}" stroke-linecap="round"/>`
        })
        .join("\n    ")

      const circles = Array.from(activeNodes)
        .map((i) => {
          const { x, y } = nodePosFromIndex(i, GRID_SIZE)
          return `<rect x="${x - nodeRadius}" y="${y - nodeRadius}" width="${nodeRadius * 2}" height="${nodeRadius * 2}" rx="${rx}" ry="${rx}" fill="black"/>`
        })
        .join("\n    ")

      const svgStr = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
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

      const img = new Image()
      const blob = new Blob([svgStr], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = svgSize * scale
        canvas.height = svgSize * scale
        const ctx = canvas.getContext("2d")!
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((b) => {
          if (!b) return
          const pngUrl = URL.createObjectURL(b)
          const a = document.createElement("a")
          a.href = pngUrl
          a.download = `glyph-${index + 1}.png`
          a.click()
          URL.revokeObjectURL(pngUrl)
        }, "image/png")
        URL.revokeObjectURL(url)
      }
      img.src = url
    },
    [nodeRadius, cornerRadius, neckWidth, threshold]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">
            Saved Glyphs
            <span className="text-muted-foreground font-normal ml-1.5">
              ({glyphs.length})
            </span>
          </DialogTitle>
        </DialogHeader>

        {glyphs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Hover a glyph in the gallery and click + to save it here.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <div className="grid grid-cols-6 gap-2 p-1">
              {glyphs.map((glyph, i) => (
                <div key={glyph.id} className="relative group/saved aspect-square">
                  <div className="w-full h-full rounded-md overflow-hidden">
                    <MetaballSVG
                      gridSize={GRID_SIZE}
                      activeNodes={computeActiveNodesFromArray(glyph.activeNodes)}
                      nodeRadius={nodeRadius}
                      cornerRadius={cornerRadius}
                      neckWidth={neckWidth}
                      blur={BLUR}
                      threshold={threshold}
                      connections={glyph.connections}
                      id={`folder-${glyph.id}`}
                    />
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => onRemove(glyph.id)}
                    className="absolute top-0.5 right-0.5 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/saved:opacity-100 transition-opacity hover:scale-110"
                    title="Remove from folder"
                  >
                    <X className="size-2.5" />
                  </button>
                  {/* Download buttons */}
                  <div className="absolute bottom-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover/saved:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => downloadSVG(glyph, i)}
                      className="size-4 rounded bg-foreground/80 text-background flex items-center justify-center text-[8px] font-bold hover:bg-foreground"
                      title="Download SVG"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadPNG(glyph, i)}
                      className="size-4 rounded bg-foreground/80 text-background flex items-center justify-center text-[8px] font-bold hover:bg-foreground"
                      title="Download PNG"
                    >
                      P
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {glyphs.length > 0 && (
          <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
            <span className="text-xs text-muted-foreground">
              {glyphs.length} glyph{glyphs.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => glyphs.forEach((g, i) => downloadSVG(g, i))}
                className="text-xs"
              >
                <Download className="size-3 mr-1" />
                All SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => glyphs.forEach((g, i) => setTimeout(() => downloadPNG(g, i), i * 200))}
                className="text-xs"
              >
                <Download className="size-3 mr-1" />
                All PNG
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
