'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { useP5Drawing } from '@/hooks/use-p5-drawing'
import { cn } from '@/lib/utils'

// Pen cursor SVG — 16x16, hotspot at bottom-left tip (1,15)
const PEN_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3C/svg%3E") 1 15, crosshair`

const TOOL_CURSORS: Record<string, string> = {
  brush: '',
  eraser: 'cursor-cell',
  line: 'cursor-crosshair',
  rectangle: 'cursor-crosshair',
  ellipse: 'cursor-crosshair',
  triangle: 'cursor-crosshair',
}

export function DrawingCanvasOverlay() {
  const { mode, activeTool } = useDrawingContext()
  const { containerRef } = useP5Drawing()

  const cursorClass = mode === 'pen' ? TOOL_CURSORS[activeTool] || 'cursor-crosshair' : ''

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-30 [&_canvas]:!block [&_canvas]:!w-full [&_canvas]:!h-full',
        mode === 'pen' ? `pointer-events-auto ${cursorClass}` : 'pointer-events-none [&_canvas]:!pointer-events-none'
      )}
      style={{
        touchAction: mode === 'pen' ? 'none' : 'auto',
        ...(mode === 'pen' && activeTool === 'brush' ? { cursor: PEN_CURSOR } : {}),
      }}
    />
  )
}
