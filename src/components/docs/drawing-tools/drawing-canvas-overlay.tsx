'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { useP5Drawing } from '@/hooks/use-p5-drawing'
import { cn } from '@/lib/utils'

export function DrawingCanvasOverlay() {
  const { mode } = useDrawingContext()
  const { containerRef } = useP5Drawing()

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-30 [&_canvas]:!block [&_canvas]:!w-full [&_canvas]:!h-full',
        mode === 'pen' ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      )}
      style={{
        touchAction: mode === 'pen' ? 'none' : 'auto',
      }}
    />
  )
}
