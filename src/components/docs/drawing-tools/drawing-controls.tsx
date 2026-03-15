'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { RotateCcw, RotateCw, Search } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { tailwindColorRamps } from '@/lib/tokens'

interface ColorOption {
  label: string
  hex: string
  group: string
}

const COLOR_FAMILIES = [
  'red', 'orange', 'amber', 'yellow', 'green', 'teal',
  'cyan', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose',
  'zinc', 'neutral', 'slate', 'stone', 'gray',
]

function buildColorOptions(): ColorOption[] {
  const options: ColorOption[] = []
  for (const family of COLOR_FAMILIES) {
    const ramp = tailwindColorRamps[family]
    if (!ramp) continue
    for (const [step, color] of Object.entries(ramp)) {
      options.push({
        label: `${family}-${step}`,
        hex: color.hex,
        group: family,
      })
    }
  }
  return options
}

const ALL_COLORS = buildColorOptions()

export function DrawingControls() {
  const { mode, menuOpen, brushSize, setBrushSize, brushColor, setBrushColor, undo, redo, canUndo, canRedo } =
    useDrawingContext()
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  const currentColorLabel = useMemo(() => {
    const found = ALL_COLORS.find((c) => c.hex === brushColor)
    return found?.label || brushColor
  }, [brushColor])

  const filteredColors = useMemo(() => {
    if (!searchQuery) return ALL_COLORS
    const q = searchQuery.toLowerCase()
    return ALL_COLORS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const filteredGroups = useMemo(() => {
    const groups: { name: string; colors: ColorOption[] }[] = []
    for (const family of COLOR_FAMILIES) {
      const colors = filteredColors.filter((c) => c.group === family)
      if (colors.length > 0) {
        groups.push({ name: family, colors })
      }
    }
    return groups
  }, [filteredColors])

  // Focus search input when picker opens
  useEffect(() => {
    if (colorPickerOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [colorPickerOpen])

  // Close picker on outside click
  useEffect(() => {
    if (!colorPickerOpen) return
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false)
        setSearchQuery('')
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
              onClick={() => {
                setColorPickerOpen(!colorPickerOpen)
                setSearchQuery('')
              }}
              className="flex w-full items-center gap-2 rounded border border-foreground/10 bg-foreground/5 px-2 py-1.5 text-sm text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              <span
                className="inline-block h-5 w-5 shrink-0 rounded-sm border border-foreground/15"
                style={{ backgroundColor: brushColor }}
              />
              <span className="flex-1 text-left">{currentColorLabel}</span>
              <span className="text-xs text-foreground/50">{brushColor}</span>
            </button>

            {/* Color picker dropdown */}
            {colorPickerOpen && (
              <div className="absolute left-0 top-full mt-1 w-full rounded-lg border border-foreground/10 bg-background/95 backdrop-blur-md shadow-lg z-10 dark:bg-background/90">
                {/* Search input */}
                <div className="flex items-center gap-1.5 border-b border-foreground/10 px-2 py-1.5">
                  <Search className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search colors..."
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                  />
                </div>

                {/* Color list */}
                <div className="max-h-56 overflow-y-auto p-1">
                  {filteredGroups.length === 0 ? (
                    <div className="py-3 text-center text-sm text-muted-foreground">
                      No colors found
                    </div>
                  ) : (
                    filteredGroups.map(({ name, colors }) => (
                      <div key={name}>
                        <div className="px-2 py-1 text-xs font-medium text-foreground/50 capitalize">
                          {name}
                        </div>
                        {colors.map((color) => (
                          <button
                            key={color.label}
                            onClick={() => {
                              setBrushColor(color.hex)
                              setColorPickerOpen(false)
                              setSearchQuery('')
                            }}
                            className={`flex w-full items-center gap-2 rounded px-2 py-1 text-sm cursor-pointer transition-colors ${
                              brushColor === color.hex
                                ? 'bg-foreground/10 text-foreground'
                                : 'text-foreground hover:bg-foreground/5'
                            }`}
                          >
                            <span
                              className="inline-block h-4 w-4 shrink-0 rounded-sm border border-foreground/15"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="flex-1 text-left">{color.label}</span>
                            <span className="text-xs text-foreground/50">{color.hex}</span>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
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
