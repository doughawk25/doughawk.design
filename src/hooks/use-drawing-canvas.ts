'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

export interface DrawingHistory {
  paths: Array<[x: number, y: number][]>
  imageData?: ImageData
}

export function useDrawingCanvas(mode: 'cursor' | 'pen') {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef(false)
  const currentPathRef = useRef<[x: number, y: number][]>([])

  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#000000')
  const [history, setHistory] = useState<DrawingHistory[]>([])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set canvas size
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = brushSize
    ctx.strokeStyle = brushColor

    ctxRef.current = ctx

    // Restore from sessionStorage on mount
    try {
      const savedState = sessionStorage.getItem('drawingState')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        setHistory(parsed.history || [])
        setBrushSize(parsed.brushSize || 3)
        setBrushColor(parsed.brushColor || '#000000')
      }
    } catch (e) {
      console.error('Failed to restore drawing state:', e)
    }

    // Handle window resize
    const handleResize = () => {
      const newDpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * newDpr
      canvas.height = window.innerHeight * newDpr

      if (ctx) {
        ctx.scale(newDpr, newDpr)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = brushSize
        ctx.strokeStyle = brushColor
      }

      // Redraw
      redrawFromHistory()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [brushSize, brushColor])

  // Redraw canvas from history
  const redrawFromHistory = useCallback(() => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    history.forEach((entry) => {
      entry.paths.forEach((path) => {
        if (path.length < 2) return

        ctx.beginPath()
        ctx.moveTo(path[0][0], path[0][1])

        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1])
        }

        ctx.stroke()
      })
    })
  }, [history])

  // Redraw when brush settings change
  useEffect(() => {
    const ctx = ctxRef.current
    if (!ctx) return

    ctx.lineWidth = brushSize
    ctx.strokeStyle = brushColor

    redrawFromHistory()
  }, [brushSize, brushColor, redrawFromHistory])

  // Pointer event handlers
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (mode !== 'pen') return

      isDrawingRef.current = true
      currentPathRef.current = [[e.clientX, e.clientY]]

      e.preventDefault()
    },
    [mode]
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current || mode !== 'pen') return

      const ctx = ctxRef.current
      if (!ctx) return

      currentPathRef.current.push([e.clientX, e.clientY])

      // Draw line to new point
      ctx.beginPath()
      const prevPoint = currentPathRef.current[currentPathRef.current.length - 2]
      const currentPoint = currentPathRef.current[currentPathRef.current.length - 1]

      ctx.moveTo(prevPoint[0], prevPoint[1])
      ctx.lineTo(currentPoint[0], currentPoint[1])
      ctx.stroke()

      e.preventDefault()
    },
    [mode]
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return

      isDrawingRef.current = false

      if (currentPathRef.current.length > 1) {
        setHistory((prev) => {
          const newHistory = [
            ...prev.slice(-19),
            { paths: [currentPathRef.current] },
          ]
          // Save to sessionStorage
          try {
            sessionStorage.setItem(
              'drawingState',
              JSON.stringify({
                history: newHistory,
                brushSize,
                brushColor,
              })
            )
          } catch (e) {
            console.error('Failed to save drawing state:', e)
          }
          return newHistory
        })
      }

      currentPathRef.current = []

      e.preventDefault()
    },
    [brushSize, brushColor]
  )

  // Register pointer event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp])

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    setHistory([])

    try {
      sessionStorage.setItem(
        'drawingState',
        JSON.stringify({
          history: [],
          brushSize,
          brushColor,
        })
      )
    } catch (e) {
      console.error('Failed to save drawing state:', e)
    }
  }, [brushSize, brushColor])

  const undo = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, -1)

      try {
        sessionStorage.setItem(
          'drawingState',
          JSON.stringify({
            history: newHistory,
            brushSize,
            brushColor,
          })
        )
      } catch (e) {
        console.error('Failed to save drawing state:', e)
      }

      return newHistory
    })
  }, [brushSize, brushColor])

  // Trigger redraw after undo
  useEffect(() => {
    redrawFromHistory()
  }, [history, redrawFromHistory])

  return {
    canvasRef,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    history,
    clearCanvas,
    undo,
    canUndo: history.length > 0,
  }
}
