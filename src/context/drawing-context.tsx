'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type p5 from 'p5'

export type ToolType = 'brush' | 'eraser' | 'line' | 'rectangle' | 'ellipse' | 'triangle'
export type FillMode = 'outline' | 'filled'

export type DrawAction =
  | { type: 'freehand'; points: [number, number][]; color: string; size: number }
  | { type: 'eraser'; points: [number, number][]; size: number }
  | { type: 'line'; start: [number, number]; end: [number, number]; color: string; size: number }
  | { type: 'rectangle'; start: [number, number]; end: [number, number]; color: string; size: number; fillMode: FillMode }
  | { type: 'ellipse'; start: [number, number]; end: [number, number]; color: string; size: number; fillMode: FillMode }
  | { type: 'triangle'; start: [number, number]; end: [number, number]; color: string; size: number; fillMode: FillMode }

interface DrawingContextType {
  mode: 'cursor' | 'pen'
  setMode: (mode: 'cursor' | 'pen') => void
  menuOpen: boolean
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
  fillMode: FillMode
  setFillMode: (mode: FillMode) => void
  brushSize: number
  setBrushSize: (size: number) => void
  brushColor: string
  setBrushColor: (color: string) => void
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

const HISTORY_CAP = 100

export function DrawingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'cursor' | 'pen'>('cursor')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTool, setActiveTool] = useState<ToolType>('brush')
  const [fillMode, setFillMode] = useState<FillMode>('outline')
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#0a0a0a')
  const [history, setHistory] = useState<DrawAction[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = sessionStorage.getItem('drawingState')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.history || []
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
        fillMode,
        setFillMode,
        brushSize,
        setBrushSize,
        brushColor,
        setBrushColor,
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

export { HISTORY_CAP }
