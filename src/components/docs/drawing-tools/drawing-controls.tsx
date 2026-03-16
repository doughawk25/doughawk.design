'use client'

import { useDrawingContext, type ToolType, type FillMode } from '@/context/drawing-context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { RotateCcw, RotateCw } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { tailwindColorRamps } from '@/lib/tokens'

interface ColorOption {
  label: string
  hex: string
}

const COLOR_FAMILIES = [
  'red', 'orange', 'amber', 'yellow', 'green', 'teal',
  'cyan', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose',
  'zinc', 'neutral', 'slate', 'stone', 'gray',
]

const COLORS_500: ColorOption[] = COLOR_FAMILIES.flatMap((family) => {
  const ramp = tailwindColorRamps[family]
  const step = ramp?.['500']
  return step ? [{ label: family, hex: step.hex }] : []
})

export function DrawingControls() {
  const { mode, menuOpen, brushSize, setBrushSize, brushColor, setBrushColor, undo, redo, canUndo, canRedo } =
    useDrawingContext()
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const currentColorLabel = useMemo(() => {
    const found = COLORS_500.find((c) => c.hex === brushColor)
    return found ? found.label : brushColor
  }, [brushColor])

  // Close picker on outside click
  useEffect(() => {
    if (!colorPickerOpen) return
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [colorPickerOpen])

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
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="flex w-full items-center gap-2 rounded border border-foreground/10 bg-foreground/5 px-2 py-1.5 text-sm text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              <span
                className="inline-block h-5 w-5 shrink-0 rounded-full border border-foreground/15"
                style={{ backgroundColor: brushColor }}
              />
              <span className="flex-1 text-left capitalize">{currentColorLabel}</span>
            </button>
          ))}

            {/* Color picker dropdown */}
            {colorPickerOpen && (
              <div className="absolute left-0 top-full mt-1 w-full rounded-lg border border-foreground/10 bg-background/95 backdrop-blur-md shadow-lg z-10 dark:bg-background/90">
                <div className="max-h-56 overflow-y-auto p-1">
                  {COLORS_500.map((color) => (
                    <button
                      key={color.label}
                      onClick={() => {
                        setBrushColor(color.hex)
                        setColorPickerOpen(false)
                      }}
                      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer transition-colors ${
                        brushColor === color.hex
                          ? 'bg-foreground/10 text-foreground'
                          : 'text-foreground hover:bg-foreground/5'
                      }`}
                    >
                      <span
                        className="inline-block h-4 w-4 shrink-0 rounded-full border border-foreground/15"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="flex-1 text-left capitalize">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
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
