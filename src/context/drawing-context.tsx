'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface DrawingContextType {
  mode: 'cursor' | 'pen'
  setMode: (mode: 'cursor' | 'pen') => void
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined)

export function DrawingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'cursor' | 'pen'>('cursor')

  const handleSetMode = useCallback((newMode: 'cursor' | 'pen') => {
    setMode(newMode)
  }, [])

  return (
    <DrawingContext.Provider value={{ mode, setMode: handleSetMode }}>
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
