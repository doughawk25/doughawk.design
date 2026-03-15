'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { Toggle } from '@/components/ui/toggle'
import { Pen, Mouse } from 'lucide-react'

export function DrawingToolToggle() {
  const { mode, setMode } = useDrawingContext()

  const handleToggle = () => {
    setMode(mode === 'cursor' ? 'pen' : 'cursor')
  }

  return (
    <Toggle
      pressed={mode === 'pen'}
      onPressedChange={handleToggle}
      aria-label="Toggle drawing mode"
      className="absolute left-4 top-4 z-40"
      size="icon"
    >
      {mode === 'pen' ? (
        <Pen className="h-4 w-4" />
      ) : (
        <Mouse className="h-4 w-4" />
      )}
    </Toggle>
  )
}
