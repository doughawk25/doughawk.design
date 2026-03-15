'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { useDrawingCanvas } from '@/hooks/use-drawing-canvas'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Trash2, RotateCcw } from 'lucide-react'
import { useState } from 'react'

const PRESET_COLORS = [
  { name: 'Lavender', value: '#D8B4E8' },
  { name: 'Purple', value: '#7C5CDB' },
  { name: 'Red', value: '#E74C3C' },
  { name: 'Orange', value: '#F39C12' },
  { name: 'Yellow', value: '#F1D94F' },
  { name: 'Green', value: '#52C41A' },
  { name: 'Blue', value: '#1890FF' },
  { name: 'Cyan', value: '#13C2C2' },
  { name: 'Black', value: '#000000' },
]

export function DrawingControls() {
  const { mode } = useDrawingContext()
  const { brushSize, setBrushSize, brushColor, setBrushColor, clearCanvas, undo, canUndo } =
    useDrawingCanvas(mode)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (mode !== 'pen') return null

  return (
    <div className="absolute left-4 top-14 z-40 w-72 rounded-lg border border-border bg-popover p-4 shadow-md">
      <div className="space-y-4">
        {/* Brush Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Brush Size: {brushSize}px</label>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setBrushColor(color.value)}
                className={`h-10 w-10 rounded border-2 transition-all ${
                  brushColor === color.value
                    ? 'border-ring ring-2 ring-ring/50'
                    : 'border-border hover:border-ring'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {PRESET_COLORS.find(c => c.value === brushColor)?.name || 'Custom'} - {brushColor}
          </div>
        </div>

        {/* Action Buttons */}
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

          {!showClearConfirm ? (
            <Button
              onClick={() => setShowClearConfirm(true)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  clearCanvas()
                  setShowClearConfirm(false)
                }}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                Confirm
              </Button>
              <Button
                onClick={() => setShowClearConfirm(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
