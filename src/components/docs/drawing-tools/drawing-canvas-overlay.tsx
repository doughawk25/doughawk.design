'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { useDrawingCanvas } from '@/hooks/use-drawing-canvas'
import { cn } from '@/lib/utils'

export function DrawingCanvasOverlay() {
  const { mode } = useDrawingContext()
  const { canvasRef } = useDrawingCanvas(mode)

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 z-50 bg-transparent',
        mode === 'pen' ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      )}
      style={{
        touchAction: mode === 'pen' ? 'none' : 'auto',
      }}
    />
  )
}
