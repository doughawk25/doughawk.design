'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Pen, Pointer, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function DrawingToolToggle() {
  const { mode, setMode, clearCanvas, canUndo } = useDrawingContext()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const containerRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Close on outside click (deferred to avoid catching the opening click)
  useEffect(() => {
    if (!confirmOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // Auto-close after 3s
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

  return (
    <div className="fixed left-4 top-4 z-40 flex items-center gap-1 pointer-events-auto">
      <ToggleGroup
        value={[mode]}
        onValueChange={(value) => {
          if (value.length === 0) return
          const next = value[value.length - 1] as 'cursor' | 'pen'
          if (next !== mode) setMode(next)
        }}
      >
        <ToggleGroupItem value="cursor" aria-label="Cursor mode" size="icon">
          <Pointer className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="pen" aria-label="Drawing mode" size="icon">
          <Pen className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {canUndo && (
        <button
          ref={containerRef}
          onClick={handleTrashClick}
          aria-label={confirmOpen ? 'Confirm clear canvas' : 'Clear canvas'}
          className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-component)] text-sm font-medium transition-all duration-200 ease-in-out outline-none cursor-pointer h-9 ${
            confirmOpen
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 min-w-[5rem]'
              : 'bg-transparent hover:bg-muted hover:text-foreground w-9'
          }`}
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          {confirmOpen && <span>Clear</span>}
        </button>
      )}
    </div>
  )
}
