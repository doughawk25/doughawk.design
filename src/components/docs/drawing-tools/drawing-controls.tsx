'use client'

import { useDrawingContext } from '@/context/drawing-context'
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

  return (
    <div className="fixed left-4 top-14 z-50 w-72 rounded-lg border border-foreground/10 bg-background/90 backdrop-blur-md p-4 shadow-lg pointer-events-auto dark:bg-background/80 dark:border-foreground/15">
      <div className="space-y-4">
        {/* Brush Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Brush Size: {brushSize}px</label>
          <Slider
            value={[brushSize]}
            onValueChange={(val) => setBrushSize(Array.isArray(val) ? val[0] : val)}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Color</label>
          <div className="relative" ref={pickerRef}>
            {/* Color trigger button */}
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
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-2">
          <Button
            onClick={undo}
            disabled={!canUndo}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Undo
          </Button>
          <Button
            onClick={redo}
            disabled={!canRedo}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            Redo
          </Button>
        </div>
      </div>
    </div>
  )
}
