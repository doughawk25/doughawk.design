'use client'

import { useEffect, useRef, useCallback } from 'react'
import type p5Type from 'p5'
import { useDrawingContext, type StrokePath } from '@/context/drawing-context'

export function useP5Drawing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    mode,
    brushSize,
    brushColor,
    history,
    setHistory,
    clearRedoStack,
    p5Ref,
  } = useDrawingContext()

  // Use refs to keep p5 sketch callbacks in sync with latest React state
  const modeRef = useRef(mode)
  const brushSizeRef = useRef(brushSize)
  const brushColorRef = useRef(brushColor)
  const historyRef = useRef(history)
  const currentPathRef = useRef<[x: number, y: number][]>([])
  const isDrawingRef = useRef(false)
  const clearRedoOnNewStrokeRef = useRef(clearRedoStack)
  useEffect(() => { clearRedoOnNewStrokeRef.current = clearRedoStack }, [clearRedoStack])

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])
  useEffect(() => { brushColorRef.current = brushColor }, [brushColor])
  useEffect(() => { historyRef.current = history }, [history])

  const saveToSession = useCallback((newHistory: StrokePath[]) => {
    try {
      sessionStorage.setItem('drawingState', JSON.stringify({ history: newHistory }))
    } catch {}
  }, [])

  // Create and manage p5 instance
  useEffect(() => {
    if (!containerRef.current) return

    let p5Instance: p5Type | null = null

    // Dynamic import to avoid SSR issues
    import('p5').then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: p5Type) => {
        p.setup = () => {
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
          canvas.style('display', 'block')
          p.pixelDensity(window.devicePixelRatio || 1)
          p.noLoop() // Only redraw when needed
        }

        p.draw = () => {
          p.clear()

          // Draw all completed strokes from history
          for (const stroke of historyRef.current) {
            if (stroke.points.length < 2) continue
            p.stroke(stroke.color)
            p.strokeWeight(stroke.size)
            p.strokeCap(p.ROUND)
            p.strokeJoin(p.ROUND)
            p.noFill()
            p.beginShape()
            for (const [x, y] of stroke.points) {
              p.vertex(x, y)
            }
            p.endShape()
          }

          // Draw current in-progress stroke
          if (currentPathRef.current.length >= 2) {
            p.stroke(brushColorRef.current)
            p.strokeWeight(brushSizeRef.current)
            p.strokeCap(p.ROUND)
            p.strokeJoin(p.ROUND)
            p.noFill()
            p.beginShape()
            for (const [x, y] of currentPathRef.current) {
              p.vertex(x, y)
            }
            p.endShape()
          }
        }

        p.mousePressed = (event: MouseEvent) => {
          if (modeRef.current !== 'pen') return
          // Ignore clicks on UI elements (controls panel, toggle)
          const target = event?.target as HTMLElement
          if (target && target.tagName !== 'CANVAS') return

          isDrawingRef.current = true
          currentPathRef.current = [[p.mouseX, p.mouseY]]
          p.redraw()
        }

        p.mouseDragged = (event: MouseEvent) => {
          if (!isDrawingRef.current || modeRef.current !== 'pen') return
          const target = event?.target as HTMLElement
          if (target && target.tagName !== 'CANVAS') return

          currentPathRef.current.push([p.mouseX, p.mouseY])
          p.redraw()
        }

        p.mouseReleased = () => {
          if (!isDrawingRef.current) return
          isDrawingRef.current = false

          if (currentPathRef.current.length > 1) {
            const newStroke: StrokePath = {
              points: [...currentPathRef.current],
              color: brushColorRef.current,
              size: brushSizeRef.current,
            }
            clearRedoOnNewStrokeRef.current()
            setHistory((prev) => {
              const newHistory = [...prev.slice(-19), newStroke]
              saveToSession(newHistory)
              return newHistory
            })
          }
          currentPathRef.current = []
          p.redraw()
        }

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight)
          p.redraw()
        }
      }

      if (containerRef.current) {
        p5Instance = new p5(sketch, containerRef.current)
        p5Ref.current = p5Instance
      }
    })

    return () => {
      if (p5Instance) {
        p5Instance.remove()
        p5Instance = null
      }
      p5Ref.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redraw when history changes (undo/clear)
  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.redraw()
    }
  }, [history, p5Ref])

  return { containerRef }
}
