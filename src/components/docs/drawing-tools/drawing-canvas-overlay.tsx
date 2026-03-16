'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { useP5Drawing } from '@/hooks/use-p5-drawing'
import { cn } from '@/lib/utils'

const TOOL_CURSORS: Record<string, string> = {
  brush: 'cursor-crosshair',
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
        mode === 'pen' ? `pointer-events-auto ${cursorClass}` : 'pointer-events-none'
      )}
      style={{
        touchAction: mode === 'pen' ? 'none' : 'auto',
      }}
    />
  )
}
