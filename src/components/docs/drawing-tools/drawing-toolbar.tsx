'use client'

import { useDrawingContext, type ToolType, type FillMode } from '@/context/drawing-context'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import {
  Menu,
  Pen,
  Eraser,
  Minus,
  Square,
  Circle,
  Triangle,
  RotateCcw,
  RotateCw,
  Trash2,
  Plus,
  SquareDashed,
  SquareIcon,
  Save,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { transitions } from '@/lib/motion'

// Inline elements slide in from the left (they appear to the right of the toggle)
const slideFromLeft = {
  initial: { x: -8, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: transitions.fast },
  exit: { x: -8, opacity: 0, transition: transitions.fast },
}

// Color palette — toolbar expands smoothly, columns stagger in (top + bottom paired)
const PALETTE_COLUMNS = 14
const paletteReveal = {
  initial: { width: 0, opacity: 0 },
  animate: {
    width: 'auto',
    opacity: 1,
    transition: {
      width: transitions.normal,
      opacity: { duration: 0.15, delay: 0.03 },
      staggerChildren: 0.02,
      delayChildren: 0.04,
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: {
      width: { ...transitions.fast, delay: 0.02 },
      opacity: { duration: 0.1 },
    },
  },
}
const paletteColumn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.06 } },
}

// Token-based color palette — adapts to light/dark theme automatically
// Top row: full opacity, bottom row: 40% opacity of the same color
const TOKEN_PALETTE: { token: string; label: string; opacity?: number }[] = [
  // Row 1 — full opacity
  { token: '--foreground',       label: 'Foreground' },
  { token: '--tint-red-fg',      label: 'Red' },
  { token: '--tint-orange-fg',   label: 'Orange' },
  { token: '--tint-amber-fg',    label: 'Amber' },
  { token: '--tint-yellow-fg',   label: 'Yellow' },
  { token: '--tint-green-fg',    label: 'Green' },
  { token: '--tint-teal-fg',     label: 'Teal' },
  { token: '--tint-cyan-fg',     label: 'Cyan' },
  { token: '--tint-blue-fg',     label: 'Blue' },
  { token: '--tint-indigo-fg',   label: 'Indigo' },
  { token: '--tint-violet-fg',   label: 'Violet' },
  { token: '--tint-purple-fg',   label: 'Purple' },
  { token: '--tint-pink-fg',     label: 'Pink' },
  { token: '--tint-rose-fg',     label: 'Rose' },
  // Row 2 — 40% opacity (matched column-for-column)
  { token: '--foreground',       label: 'Light Foreground', opacity: 0.4 },
  { token: '--tint-red-fg',      label: 'Light Red',        opacity: 0.4 },
  { token: '--tint-orange-fg',   label: 'Light Orange',     opacity: 0.4 },
  { token: '--tint-amber-fg',    label: 'Light Amber',      opacity: 0.4 },
  { token: '--tint-yellow-fg',   label: 'Light Yellow',     opacity: 0.4 },
  { token: '--tint-green-fg',    label: 'Light Green',      opacity: 0.4 },
  { token: '--tint-teal-fg',     label: 'Light Teal',       opacity: 0.4 },
  { token: '--tint-cyan-fg',     label: 'Light Cyan',       opacity: 0.4 },
  { token: '--tint-blue-fg',     label: 'Light Blue',       opacity: 0.4 },
  { token: '--tint-indigo-fg',   label: 'Light Indigo',     opacity: 0.4 },
  { token: '--tint-violet-fg',   label: 'Light Violet',     opacity: 0.4 },
  { token: '--tint-purple-fg',   label: 'Light Purple',     opacity: 0.4 },
  { token: '--tint-pink-fg',     label: 'Light Pink',       opacity: 0.4 },
  { token: '--tint-rose-fg',     label: 'Light Rose',       opacity: 0.4 },
]

/** Encode token + optional opacity into a single string for brushColor state */
function encodeColor(token: string, opacity?: number): string {
  return opacity != null && opacity < 1 ? `${token}/${opacity}` : token
}

/** Decode brushColor string back to token + opacity */
function decodeColor(color: string): { token: string; opacity?: number } {
  const i = color.lastIndexOf('/')
  if (i === -1) return { token: color }
  const token = color.slice(0, i)
  const opacity = parseFloat(color.slice(i + 1))
  return isNaN(opacity) ? { token: color } : { token, opacity }
}

const TOOLS: { value: ToolType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'brush', label: 'Brush', icon: Pen },
  { value: 'eraser', label: 'Eraser', icon: Eraser },
  { value: 'line', label: 'Line', icon: Minus },
  { value: 'rectangle', label: 'Rectangle', icon: Square },
  { value: 'ellipse', label: 'Ellipse', icon: Circle },
  { value: 'triangle', label: 'Triangle', icon: Triangle },
]

// Mobile only shows brush + eraser
const MOBILE_TOOLS = TOOLS.slice(0, 2)

const SHAPE_TOOLS: ToolType[] = ['rectangle', 'ellipse', 'triangle']
const TOOLS_WITH_SIZE: ToolType[] = ['brush', 'eraser', 'line', 'rectangle', 'ellipse', 'triangle']

const MAX_BRUSH_SIZE = 50

function Separator({ className }: { className?: string }) {
  return <div className={cn("self-stretch w-px bg-foreground/10 mx-1", className)} />
}

export function DrawingToolbar() {
  const {
    mode,
    setMode,
    menuOpen,
    setMenuOpen,
    activeTool,
    setActiveTool,
    fillMode,
    setFillMode,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    saveCanvas,
  } = useDrawingContext()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(true)
  const [sizeInput, setSizeInput] = useState(String(brushSize))
  const trashRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Close trash confirm on outside click
  useEffect(() => {
    if (!confirmOpen) return
    const handleClick = (e: MouseEvent) => {
      if (trashRef.current && !trashRef.current.contains(e.target as Node)) {
        setConfirmOpen(false)
      }
    }
    const raf = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick)
    })
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [confirmOpen])

  // Auto-close trash confirm after 3s
  useEffect(() => {
    if (!confirmOpen) return
    timeoutRef.current = setTimeout(() => setConfirmOpen(false), 3000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [confirmOpen])

  const handleTrashClick = () => {
    if (!confirmOpen) {
      setConfirmOpen(true)
    } else {
      clearCanvas()
      setConfirmOpen(false)
    }
  }

  const handleSave = useCallback(async () => {
    const entry = await saveCanvas()
    if (entry) {
      toast.success('Saved to gallery')
    } else {
      toast.error('Nothing to save')
    }
  }, [saveCanvas])

  const handleToolChange = (values: string[]) => {
    if (values.length > 0) {
      setActiveTool(values[0] as ToolType)
    }
  }

  const handleFillModeChange = (values: string[]) => {
    if (values.length > 0) {
      setFillMode(values[0] as FillMode)
    }
  }

  return (
    <TooltipProvider>
      <div className="fixed left-4 top-0 z-40 flex items-center gap-1 pointer-events-auto h-14 max-md:max-w-[calc(100vw-2rem)]">
        {/* Mode Toggle — always separate */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'cursor' | 'pen')}>
          <TabsList>
            <TabsTrigger value="cursor" aria-label="Cursor mode">
              <Menu className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="pen" aria-label="Drawing mode">
              <Pen className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* +/X toggle — pen mode only */}
        {mode === 'pen' && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close tool menu' : 'Open tool menu'}
          >
            <Plus
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                menuOpen && 'rotate-45'
              )}
            />
          </Button>
        )}

        {/* Trash — next to mode switcher */}
        {canUndo && (
          <Button
            ref={trashRef}
            onClick={handleTrashClick}
            variant="destructive"
            size={confirmOpen ? 'default' : 'icon'}
            aria-label={confirmOpen ? 'Confirm clear canvas' : 'Clear canvas'}
            className={cn(
              'transition-all duration-200 ease-in-out',
              confirmOpen && 'min-w-[5rem] gap-1.5'
            )}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            {confirmOpen && <span className="text-sm">Clear</span>}
          </Button>
        )}

        <AnimatePresence>
          {/* Tool Menu — slides right of +/X button */}
          {mode === 'pen' && menuOpen && (
            <motion.div
              key="tool-menu"
              {...slideFromLeft}
              className="flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur-md px-[6px] py-[2px] shadow-xs dark:bg-muted"
            >
            {/* Color swatch — far left */}
            <div className="flex items-center gap-1.5">
              {/* Current color indicator + toggle */}
              <button
                onClick={() => setColorPickerOpen((v) => !v)}
                className="h-6 w-6 rounded-full border border-foreground/15 cursor-pointer transition-transform hover:scale-110 shrink-0"
                style={{
                  backgroundColor: brushColor.startsWith('--')
                    ? `var(${decodeColor(brushColor).token})`
                    : brushColor,
                  opacity: decodeColor(brushColor).opacity ?? 1,
                }}
                aria-label="Toggle color palette"
              />

              {/* Expanded swatch grid — columns pair top (vivid) + bottom (light) */}
              <AnimatePresence>
                {colorPickerOpen && (
                  <motion.div
                    key="swatch-grid"
                    variants={paletteReveal}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex gap-px"
                  >
                    {Array.from({ length: PALETTE_COLUMNS }, (_, colIdx) => (
                      <motion.div
                        key={colIdx}
                        variants={paletteColumn}
                        className="flex flex-col gap-px"
                      >
                        {[TOKEN_PALETTE[colIdx], TOKEN_PALETTE[colIdx + PALETTE_COLUMNS]].map((entry) => {
                          const colorKey = encodeColor(entry.token, entry.opacity)
                          return (
                            <button
                              key={colorKey}
                              onClick={() => setBrushColor(colorKey)}
                              className={cn(
                                'h-3.5 w-3.5 rounded-[2px] border border-foreground/15 transition-transform hover:scale-125 cursor-pointer',
                                brushColor === colorKey && 'ring-1 ring-foreground ring-offset-1 ring-offset-background scale-110'
                              )}
                              style={{
                                backgroundColor: `var(${entry.token})`,
                                opacity: entry.opacity ?? 1,
                              }}
                              aria-label={entry.label}
                            />
                          )
                        })}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            
            {/* Tool Selector — full on desktop, brush+eraser on mobile */}
            <ToggleGroup
              value={[activeTool]}
              onValueChange={handleToolChange}
              size="sm"
            >
              {/* Mobile: only brush + eraser */}
              <div className="flex md:hidden">
                {MOBILE_TOOLS.map(({ value, label, icon: Icon }) => (
                  <ToggleGroupItem key={value} value={value} aria-label={label}>
                    <Icon className="size-3.5" />
                  </ToggleGroupItem>
                ))}
              </div>
              {/* Desktop: all tools */}
              <div className="hidden md:flex">
                {TOOLS.map(({ value, label, icon: Icon }) => (
                  <ToggleGroupItem key={value} value={value} aria-label={label}>
                    <Icon className="size-3.5" />
                  </ToggleGroupItem>
                ))}
              </div>
            </ToggleGroup>

            {/* Desktop only: shape fill mode + brush size */}
            <div className="hidden md:contents">
              
              {/* Contextual Sub-options */}
              <div className="flex items-center gap-1.5">
                {/* Fill mode for shapes */}
                <AnimatePresence>
                  {SHAPE_TOOLS.includes(activeTool) && (
                    <motion.div
                      key="fill-mode"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1, transition: transitions.normal }}
                      exit={{ width: 0, opacity: 0, transition: transitions.fast }}
                      className="overflow-hidden"
                    >
                      <ToggleGroup
                        value={[fillMode]}
                        onValueChange={handleFillModeChange}
                        size="sm"
                      >
                        <ToggleGroupItem value="outline" aria-label="Outline">
                          <SquareDashed className="size-3.5" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="filled" aria-label="Filled">
                          <SquareIcon className="size-3.5 fill-current" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Brush size input */}
                {TOOLS_WITH_SIZE.includes(activeTool) ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={sizeInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '')
                      setSizeInput(raw)
                    }}
                    onBlur={() => {
                      const num = parseInt(sizeInput, 10)
                      if (isNaN(num) || num < 1) {
                        setBrushSize(1)
                        setSizeInput('1')
                      } else if (num > MAX_BRUSH_SIZE) {
                        setBrushSize(MAX_BRUSH_SIZE)
                        setSizeInput(String(MAX_BRUSH_SIZE))
                      } else {
                        setBrushSize(num)
                        setSizeInput(String(num))
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    }}
                    className="w-9 h-[30px] text-xs text-foreground tabular-nums text-center rounded-[min(var(--radius-component-sm),10px)] border border-border bg-background outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 px-1"
                  />
                ) : null}
              </div>
            </div>

            
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      onClick={undo}
                      disabled={!canUndo}
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Undo"
                    />
                  }
                >
                  <RotateCcw className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Undo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      onClick={redo}
                      disabled={!canRedo}
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Redo"
                    />
                  }
                >
                  <RotateCw className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Redo</TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
          )}

        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
