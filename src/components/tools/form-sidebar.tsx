"use client"

import { useState, useCallback } from "react"
import { Dices, RotateCcw, Download, Square, Grid2x2, Grid3x3, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const GRID_SIZES = [3, 4, 5, 6] as const

interface FormSidebarProps {
  gridSize: number
  setGridSize: (size: number) => void
  nodeRadius: number
  setNodeRadius: (v: number) => void
  neckWidth: number
  setNeckWidth: (v: number) => void
  cornerRadius: number
  setCornerRadius: (v: number) => void
  tiled: boolean
  setTiled: (v: boolean) => void
  onRandomize: () => void
  onClearAll: () => void
  onExport: () => void
  onOpenFolder: () => void
  folderCount: number
  glyphVisible?: boolean
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const startEditing = useCallback(() => {
    setInputValue(String(value))
    setEditing(true)
  }, [value])

  const commitEdit = useCallback(() => {
    setEditing(false)
    const n = parseInt(inputValue, 10)
    if (!isNaN(n)) {
      onChange(Math.max(min, Math.min(max, n)))
    }
  }, [inputValue, min, max, onChange])

  return (
    <div className="flex h-7 items-center rounded-[var(--radius-component)] border border-border bg-background min-w-0">
      <span className="text-[11px] text-muted-foreground whitespace-nowrap select-none pl-2 pr-3">
        {label}
      </span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        className="flex-1 min-w-[60px] mr-2"
      />
      {editing ? (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit()
            if (e.key === "Escape") setEditing(false)
          }}
          min={min}
          max={max}
          autoFocus
          className="w-8 shrink-0 h-full bg-transparent text-center font-mono text-[11px] text-foreground tabular-nums outline-none border-l border-border rounded-r-[calc(var(--radius-component)-1px)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="w-8 shrink-0 h-full text-center font-mono text-[11px] text-muted-foreground tabular-nums hover:text-foreground hover:bg-muted cursor-text border-l border-border rounded-r-[calc(var(--radius-component)-1px)] transition-colors"
        >
          {value}
        </button>
      )}
    </div>
  )
}

export function FormSidebar({
  gridSize,
  setGridSize,
  nodeRadius,
  setNodeRadius,
  neckWidth,
  setNeckWidth,
  cornerRadius,
  setCornerRadius,
  tiled,
  setTiled,
  onRandomize,
  onClearAll,
  onExport,
  onOpenFolder,
  folderCount,
  glyphVisible = true,
}: FormSidebarProps) {
  return (
    <div className="flex items-center flex-wrap">
      {/* Left group: tile toggle + grid dropdown */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0">
          <button
            type="button"
            onClick={() => setTiled(false)}
            className={`inline-flex items-center justify-center size-7 px-0 rounded-l-[var(--radius-component)] border border-border text-sm transition-all outline-none ${!tiled ? "bg-muted text-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            title="Single"
          >
            <Square className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTiled(true)}
            className={`inline-flex items-center justify-center size-7 px-0 rounded-r-[var(--radius-component)] border border-l-0 border-border text-sm transition-all outline-none ${tiled ? "bg-muted text-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            title="Tile ×4"
          >
            <Grid2x2 className="size-3.5" />
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex shrink-0 items-center justify-center rounded-[var(--radius-component)] border border-border bg-background text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 size-7 font-mono text-xs dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            title={`${gridSize}×${gridSize} grid`}
          >
            <Grid3x3 className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            {GRID_SIZES.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => setGridSize(size)}
                className="font-mono"
              >
                {size}×{size}
                {size === gridSize && " ✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Left spacer */}
      <div className="flex-1" />

      {/* Sliders */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SliderControl
          label="Size"
          value={nodeRadius}
          min={14}
          max={42}
          onChange={setNodeRadius}
        />
        <SliderControl
          label="Neck"
          value={neckWidth}
          min={4}
          max={32}
          onChange={setNeckWidth}
        />
        <SliderControl
          label="Corner"
          value={cornerRadius}
          min={0}
          max={100}
          onChange={setCornerRadius}
        />
      </div>

      {/* Right spacer — always expanded to keep sliders centered */}
      <div style={{ flex: "1 1 0%" }} />

      {/* Right section: action buttons OR folder button — fixed width to prevent slider jump */}
      <div className="relative shrink-0 flex items-center justify-end" style={{ width: 92 }}>
        {/* Action icons — visible when glyph is in view */}
        <div
          className="absolute right-0 flex items-center gap-1"
          style={{
            opacity: glyphVisible ? 1 : 0,
            transform: glyphVisible ? "translateX(0)" : "translateX(8px)",
            transition: "opacity 500ms ease-in-out, transform 500ms ease-in-out",
            pointerEvents: glyphVisible ? "auto" : "none",
          }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onRandomize}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Randomize"
          >
            <Dices className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onClearAll}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Reset"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onExport}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Export SVG"
          >
            <Download className="size-3.5" />
          </Button>
        </div>

        {/* Folder button — visible when glyph is scrolled away */}
        <div
          className="absolute right-0 flex items-center"
          style={{
            opacity: glyphVisible ? 0 : 1,
            transform: glyphVisible ? "translateX(-8px)" : "translateX(0)",
            transition: "opacity 500ms ease-in-out, transform 500ms ease-in-out",
            pointerEvents: glyphVisible ? "none" : "auto",
          }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenFolder}
            className="size-7 text-muted-foreground hover:text-foreground relative"
            title="Saved glyphs"
          >
            <FolderOpen className="size-3.5" />
            {folderCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center size-3.5 rounded-full bg-indigo-500 text-white text-[9px] font-medium leading-none">
                {folderCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
