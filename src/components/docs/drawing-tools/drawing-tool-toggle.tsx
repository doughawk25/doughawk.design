'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Pen, Pointer, Plus, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function DrawingToolToggle() {
  const { mode, setMode, menuOpen, setMenuOpen, canUndo, clearCanvas } = useDrawingContext()

  const [confirmOpen, setConfirmOpen] = useState(false)
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

  return (
    <div className="flex items-center gap-1">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'cursor' | 'pen')}>
        <TabsList>
          <TabsTrigger value="cursor" aria-label="Cursor mode">
            <Pointer className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="pen" aria-label="Drawing mode">
            <Pen className="size-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'pen' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close brush menu' : 'Open brush menu'}
        >
          <Plus className={cn('h-4 w-4 transition-transform', menuOpen && 'rotate-45')} />
        </Button>
      )}

      {mode === 'pen' && canUndo && (
        <Button
          ref={trashRef}
          variant="destructive"
          size="icon"
          onClick={handleTrashClick}
          aria-label={confirmOpen ? 'Confirm clear canvas' : 'Clear canvas'}
          className={cn(
            'transition-all duration-200 ease-in-out',
            confirmOpen && 'px-3 min-w-[5rem] w-auto gap-1.5'
          )}
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" />
          {confirmOpen && <span className="text-sm">Clear</span>}
        </Button>
      )}
    </div>
  )
}
