'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type p5 from 'p5'

// ---------------------------------------------------------------------------
// Tool & action types
// ---------------------------------------------------------------------------

export type ToolType =
  | 'brush'
  | 'eraser'
  | 'triangle'
  | 'rectangle'
  | 'ellipse'

export type FillMode = 'outline' | 'filled' | 'both'

export type DrawAction =
  | { type: 'freehand'; points: [number, number][]; color: string; size: number }
  | { type: 'eraser'; points: [number, number][]; size: number }
  | { type: 'triangle'; points: [number, number][]; color: string; size: number; fillMode: FillMode }
  | { type: 'rectangle'; x: number; y: number; w: number; h: number; color: string; size: number; fillMode: FillMode }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; color: string; size: number; fillMode: FillMode }

/** Convert legacy StrokePath (no `type` field) to DrawAction */
function normalizeAction(action: DrawAction | { points: [number, number][]; color: string; size: number }): DrawAction {
  if ('type' in action) return action as DrawAction
  return { type: 'freehand', points: action.points, color: action.color, size: action.size }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface DrawingContextType {
  mode: 'cursor' | 'pen'
  setMode: (mode: 'cursor' | 'pen') => void
  menuOpen: boolean
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
  brushSize: number
  setBrushSize: (size: number) => void
  brushColor: string
  setBrushColor: (color: string) => void
  fillMode: FillMode
  setFillMode: (mode: FillMode) => void
  lineWidth: number
  setLineWidth: (width: number) => void
  history: DrawAction[]
  setHistory: React.Dispatch<React.SetStateAction<DrawAction[]>>
  clearCanvas: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clearRedoStack: () => void
  p5Ref: React.MutableRefObject<p5 | null>
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DrawingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'cursor' | 'pen'>('cursor')
  const [menuOpen, setMenuOpen] = useState(true)
  const [activeTool, setActiveTool] = useState<ToolType>('brush')
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#3b82f6')
  const [history, setHistory] = useState<StrokePath[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = sessionStorage.getItem('drawingState')
      if (saved) {
        const parsed = JSON.parse(saved)
        return (parsed.history || []).map(normalizeAction)
      }
    } catch {}
    return []
  })
  const [redoStack, setRedoStack] = useState<DrawAction[]>([])
  const p5Ref = useRef<p5 | null>(null)

  const saveToSession = useCallback((newHistory: DrawAction[]) => {
    try {
      sessionStorage.setItem('drawingState', JSON.stringify({ history: newHistory }))
    } catch {}
  }, [])

  const clearCanvas = useCallback(() => {
    setHistory([])
    setRedoStack([])
    saveToSession([])
  }, [saveToSession])

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const removed = prev[prev.length - 1]
      setRedoStack((rs) => [...rs, removed])
      const newHistory = prev.slice(0, -1)
      saveToSession(newHistory)
      return newHistory
    })
  }, [saveToSession])

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const restored = prev[prev.length - 1]
      setHistory((h) => {
        const newHistory = [...h, restored]
        saveToSession(newHistory)
        return newHistory
      })
      return prev.slice(0, -1)
    })
  }, [saveToSession])

  return (
    <DrawingContext.Provider
      value={{
        mode,
        setMode,
        menuOpen,
        setMenuOpen,
        activeTool,
        setActiveTool,
        brushSize,
        setBrushSize,
        brushColor,
        setBrushColor,
        fillMode,
        setFillMode,
        lineWidth,
        setLineWidth,
        history,
        setHistory,
        clearCanvas,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        clearRedoStack: useCallback(() => setRedoStack([]), []),
        p5Ref,
      }}
    >
      {children}
    </DrawingContext.Provider>
  )
}

export function useDrawingContext() {
  const context = useContext(DrawingContext)
  if (context === undefined) {
    throw new Error('useDrawingContext must be used within a DrawingProvider')
  }
  return context
}
