'use client'

import { useDrawingContext } from '@/context/drawing-context'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Pen, Pointer, Plus, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function DrawingToolToggle() {
  const { mode, setMode, clearCanvas, canUndo, menuOpen, setMenuOpen } = useDrawingContext()
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
          size="icon-sm"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close brush menu' : 'Open brush menu'}
        >
          <Plus
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              menuOpen && 'rotate-45'
            )}
          />
        </Button>
      )}

      {canUndo && (
        <Toggle
          ref={containerRef}
          pressed={confirmOpen}
          onPressedChange={handleTrashClick}
          aria-label={confirmOpen ? 'Confirm clear canvas' : 'Clear canvas'}
          size="sm"
          className={`transition-all duration-200 ease-in-out ${
            confirmOpen
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 aria-pressed:bg-destructive px-3 min-w-[5rem] gap-1.5'
              : ''
          }`}
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" />
          {confirmOpen && <span className="text-sm">Clear</span>}
        </Toggle>
      )}
    </div>
  )
}

