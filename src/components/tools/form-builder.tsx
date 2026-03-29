"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { useFormState } from "./use-form-state"
import { FormCanvas, nodePosFromIndex, PAD, CELL } from "./form-canvas"
import { FormSidebar } from "./form-sidebar"
import { GlyphGallery } from "./glyph-gallery"
import { GlyphFolder } from "./glyph-folder"

export interface SavedGlyph {
  id: string
  connections: string[]
  activeNodes: number[]
}

export function FormBuilder() {
  const state = useFormState()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [glyphVisible, setGlyphVisible] = useState(true)
  const [savedGlyphs, setSavedGlyphs] = useState<SavedGlyph[]>([])
  const [folderOpen, setFolderOpen] = useState(false)

  const addToFolder = useCallback((connections: string[], activeNodes: number[]) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setSavedGlyphs((prev) => [...prev, { id, connections, activeNodes }])
  }, [])

  const removeFromFolder = useCallback((id: string) => {
    setSavedGlyphs((prev) => prev.filter((g) => g.id !== id))
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setGlyphVisible(entry.isIntersecting),
      { threshold: 0.85 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const exportSVG = useCallback(() => {
    const { gridSize, tiles, nodeRadius, cornerRadius, neckWidth, blur, threshold, tiled } = state
    const rx = (cornerRadius / 100) * nodeRadius
    const svgSize = PAD * 2 + gridSize * CELL

    if (tiled) {
      const fullSize = svgSize * 2
      let allContent = ""
      for (let ti = 0; ti < 4; ti++) {
        const tile = tiles[ti]
        const offsetX = (ti % 2) * svgSize
        const offsetY = Math.floor(ti / 2) * svgSize
        const lines = Array.from(tile.connections)
          .map((key) => {
            const [i, j] = key.split("_").map(Number)
            const a = nodePosFromIndex(i, gridSize)
            const b = nodePosFromIndex(j, gridSize)
            return `<line x1="${a.x + offsetX}" y1="${a.y + offsetY}" x2="${b.x + offsetX}" y2="${b.y + offsetY}" stroke="currentColor" stroke-width="${neckWidth * 2}" stroke-linecap="round"/>`
          })
          .join("\n    ")
        const circles = Array.from(tile.activeNodes)
          .map((i) => {
            const { x, y } = nodePosFromIndex(i, gridSize)
            return `<rect x="${x + offsetX - nodeRadius}" y="${y + offsetY - nodeRadius}" width="${nodeRadius * 2}" height="${nodeRadius * 2}" rx="${rx}" ry="${rx}" fill="currentColor"/>`
          })
          .join("\n    ")
        allContent += lines + "\n    " + circles + "\n    "
      }
      const svg = `<svg width="${fullSize}" height="${fullSize}" viewBox="0 0 ${fullSize} ${fullSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="mb" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold} ${-(threshold * 0.42)}"/>
    </filter>
  </defs>
  <g filter="url(#mb)">
    ${allContent.trim()}
  </g>
</svg>`
      const blob = new Blob([svg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "glyph-tiled.svg"
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const tile = tiles[0]
      const lines = Array.from(tile.connections)
        .map((key) => {
          const [i, j] = key.split("_").map(Number)
          const a = nodePosFromIndex(i, gridSize)
          const b = nodePosFromIndex(j, gridSize)
          return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="currentColor" stroke-width="${neckWidth * 2}" stroke-linecap="round"/>`
        })
        .join("\n    ")
      const circles = Array.from(tile.activeNodes)
        .map((i) => {
          const { x, y } = nodePosFromIndex(i, gridSize)
          return `<rect x="${x - nodeRadius}" y="${y - nodeRadius}" width="${nodeRadius * 2}" height="${nodeRadius * 2}" rx="${rx}" ry="${rx}" fill="currentColor"/>`
        })
        .join("\n    ")
      const svg = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="mb" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur"/>
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
      a.download = "glyph.svg"
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [state])

  // Height of the pinned control bar
  const barH = "3.25rem"

  return (
    <div className="flex flex-col">
      {/* Canvas area — full viewport minus header and bar */}
      <div
        ref={canvasRef}
        className="flex items-center justify-center shrink-0"
        style={{ height: `calc(100dvh - ${barH})`, minHeight: `calc(100dvh - ${barH})` }}
      >
        <FormCanvas
          gridSize={state.gridSize}
          tiles={state.tiles}
          nodeRadius={state.nodeRadius}
          cornerRadius={state.cornerRadius}
          neckWidth={state.neckWidth}
          nodeGap={state.nodeGap}
          blur={state.blur}
          threshold={state.threshold}
          tiled={state.tiled}
          onToggleNode={state.toggleNode}
          onToggleConnection={state.toggleConnection}
        />
      </div>
      {/* Gallery — pushed below fold with padding */}
      <div className="border-t border-border mt-16" style={{ paddingBottom: `calc(${barH} + 3rem)` }}>
        <GlyphGallery
          nodeRadius={state.nodeRadius}
          cornerRadius={state.cornerRadius}
          neckWidth={state.neckWidth}
          threshold={state.threshold}
          onAddToFolder={addToFolder}
        />
      </div>
      {/* Controls — pinned bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-6 py-2.5">
        <FormSidebar
          gridSize={state.gridSize}
          setGridSize={state.setGridSize}
          nodeRadius={state.nodeRadius}
          setNodeRadius={state.setNodeRadius}
          neckWidth={state.neckWidth}
          setNeckWidth={state.setNeckWidth}
          cornerRadius={state.cornerRadius}
          setCornerRadius={state.setCornerRadius}
          tiled={state.tiled}
          setTiled={state.setTiled}
          onRandomize={state.randomize}
          onClearAll={state.clearAll}
          onExport={exportSVG}
          onOpenFolder={() => setFolderOpen(true)}
          folderCount={savedGlyphs.length}
          glyphVisible={glyphVisible}
        />
      </div>
      {/* Folder modal */}
      <GlyphFolder
        open={folderOpen}
        onOpenChange={setFolderOpen}
        glyphs={savedGlyphs}
        onRemove={removeFromFolder}
        nodeRadius={state.nodeRadius}
        cornerRadius={state.cornerRadius}
        neckWidth={state.neckWidth}
        threshold={state.threshold}
      />
    </div>
  )
}
