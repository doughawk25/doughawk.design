'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type p5 from 'p5'

export interface StrokePath {
  points: [x: number, y: number][]
  color: string
  size: number
}

interface DrawingContextType {
  mode: 'cursor' | 'pen'
  setMode: (mode: 'cursor' | 'pen') => void
  brushSize: number
  setBrushSize: (size: number) => void
  brushColor: string
  setBrushColor: (color: string) => void
  history: StrokePath[]
  setHistory: React.Dispatch<React.SetStateAction<StrokePath[]>>
  clearCanvas: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clearRedoStack: () => void
  p5Ref: React.MutableRefObject<p5 | null>
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined)

export function DrawingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'cursor' | 'pen'>('cursor')
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#0a0a0a')
  const [history, setHistory] = useState<StrokePath[]>(() => {
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
  const [redoStack, setRedoStack] = useState<StrokePath[]>([])
  const p5Ref = useRef<p5 | null>(null)

  const saveToSession = useCallback((newHistory: StrokePath[]) => {
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
