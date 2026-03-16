'use client'

import { useDrawingContext, type ToolType, type FillMode } from '@/context/drawing-context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  RotateCcw,
  RotateCw,
  Pen,
  Eraser,
  Triangle,
  Square,
  Circle,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// MS Paint–style color palette (28 colors)
// ---------------------------------------------------------------------------

const PALETTE_COLORS: { hex: string; label: string }[] = [
  // Row 1 — darks / saturated
  { hex: '#0a0a0a', label: 'Black' },
  { hex: '#737373', label: 'Dark gray' },
  { hex: '#7f1d1d', label: 'Dark red' },
  { hex: '#854d0e', label: 'Dark yellow' },
  { hex: '#166534', label: 'Dark green' },
  { hex: '#155e75', label: 'Dark cyan' },
  { hex: '#1e3a5f', label: 'Dark blue' },
  { hex: '#581c87', label: 'Dark purple' },
  { hex: '#78350f', label: 'Brown' },
  { hex: '#4d7c0f', label: 'Olive' },
  { hex: '#0f766e', label: 'Teal' },
  { hex: '#1e40af', label: 'Navy' },
  { hex: '#9f1239', label: 'Maroon' },
  { hex: '#86198f', label: 'Dark magenta' },
  // Row 2 — lights / pastels
  { hex: '#ffffff', label: 'White' },
  { hex: '#d4d4d4', label: 'Light gray' },
  { hex: '#ef4444', label: 'Red' },
  { hex: '#eab308', label: 'Yellow' },
  { hex: '#22c55e', label: 'Green' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#a855f7', label: 'Purple' },
  { hex: '#f43f5e', label: 'Rose' },
  { hex: '#f97316', label: 'Orange' },
  { hex: '#84cc16', label: 'Lime' },
  { hex: '#38bdf8', label: 'Sky' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#d946ef', label: 'Magenta' },
]

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: { id: ToolType; icon: typeof Pen; label: string }[] = [
  { id: 'brush', icon: Pen, label: 'Brush' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DrawingControls() {
  const {
    mode, menuOpen, activeTool, setActiveTool,
    brushSize, setBrushSize, brushColor, setBrushColor,
    fillMode, setFillMode,
    undo, redo, canUndo, canRedo,
  } = useDrawingContext()

  const [paletteOpen, setPaletteOpen] = useState(false)

  if (mode !== 'pen' || !menuOpen) return null

  const showBrushSize = activeTool === 'brush' || activeTool === 'eraser'
  const showFillMode = activeTool === 'triangle' || activeTool === 'rectangle' || activeTool === 'ellipse'

  return (
    <div className="rounded-lg border border-foreground/10 bg-background/90 backdrop-blur-md shadow-lg dark:bg-background/80 dark:border-foreground/15">
      <div className="p-2 space-y-2">
        {/* ---- Main row: tools + swatch + undo/redo ---- */}
        <div className="flex items-center gap-1">
          {/* Tool buttons */}
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              title={label}
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-[var(--radius-component-sm)] text-foreground/70 transition-colors cursor-pointer',
                activeTool === id
                  ? 'bg-foreground/10 text-foreground'
                  : 'hover:bg-foreground/5'
              )}
              aria-label={label}
              aria-pressed={activeTool === id}
            >
              <Icon className="size-4" />
            </button>
          ))}

          {/* Divider */}
          <div className="h-5 w-px bg-foreground/10 mx-0.5" />

          {/* Color swatch toggle */}
          <button
            onClick={() => setPaletteOpen(!paletteOpen)}
            className={cn(
              'h-7 w-7 rounded-[var(--radius-component-sm)] border-2 transition-all cursor-pointer shrink-0',
              paletteOpen ? 'border-foreground/40 ring-1 ring-foreground/20' : 'border-foreground/20 hover:border-foreground/40'
            )}
            style={{ backgroundColor: brushColor }}
            aria-label="Toggle color palette"
            aria-expanded={paletteOpen}
          />

          {/* Divider */}
          <div className="h-5 w-px bg-foreground/10 mx-0.5" />

          {/* Undo / Redo with Tooltips */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={undo}
                    disabled={!canUndo}
                  />
                }
              >
                <RotateCcw className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom">Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={redo}
                    disabled={!canRedo}
                  />
                }
              >
                <RotateCw className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom">Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* ---- Expandable color palette ---- */}
        {paletteOpen && (
          <>
            <div className="h-px bg-foreground/10" />
            <div className="grid grid-cols-14 gap-0.5">
              {PALETTE_COLORS.map(({ hex, label }) => (
                <button
                  key={hex}
                  onClick={() => setBrushColor(hex)}
                  title={label}
                  className={cn(
                    'h-4 w-4 rounded-[2px] border transition-all cursor-pointer',
                    brushColor === hex
                      ? 'border-foreground ring-1 ring-foreground/30 scale-110'
                      : 'border-foreground/15 hover:border-foreground/40'
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </>
        )}

        {/* ---- Contextual tool options ---- */}
        {(showBrushSize || showFillMode) && (
          <>
            <div className="h-px bg-foreground/10" />
            <div className="space-y-2">
              {showBrushSize && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/70">
                    {activeTool === 'eraser' ? 'Eraser' : 'Brush'} Size: {brushSize}px
                  </label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(val) => setBrushSize(Array.isArray(val) ? val[0] : val)}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {showFillMode && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/70">Fill</label>
                  <div className="flex gap-1">
                    {(['outline', 'filled', 'both'] as FillMode[]).map((fm) => (
                      <button
                        key={fm}
                        onClick={() => setFillMode(fm)}
                        className={cn(
                          'flex-1 rounded-[var(--radius-component-sm)] px-2 py-1 text-xs capitalize transition-colors cursor-pointer',
                          fillMode === fm
                            ? 'bg-foreground/10 text-foreground font-medium'
                            : 'text-foreground/60 hover:bg-foreground/5'
                        )}
                      >
                        {fm}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
