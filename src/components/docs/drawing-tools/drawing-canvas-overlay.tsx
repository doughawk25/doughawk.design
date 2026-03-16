'use client'

import { useDrawingContext, type ToolType } from '@/context/drawing-context'
import { useP5Drawing } from '@/hooks/use-p5-drawing'
import { cn } from '@/lib/utils'

const CURSOR_MAP: Record<ToolType, string> = {
  brush: 'cursor-crosshair',
  eraser: 'cursor-cell',
  triangle: 'cursor-crosshair',
  rectangle: 'cursor-crosshair',
  ellipse: 'cursor-crosshair',
}

export function DrawingCanvasOverlay() {
  const { mode, activeTool } = useDrawingContext()
  const { containerRef } = useP5Drawing()

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-30 [&_canvas]:!block [&_canvas]:!w-full [&_canvas]:!h-full',
        mode === 'pen' ? `pointer-events-auto ${CURSOR_MAP[activeTool]}` : 'pointer-events-none'
      )}
      style={{
        touchAction: mode === 'pen' ? 'none' : 'auto',
      }}
    />
  )
}
