'use client'

import { useEffect, useRef, useCallback } from 'react'
import type p5Type from 'p5'
import { toast } from 'sonner'
import { useDrawingContext, type DrawAction, type FillMode } from '@/context/drawing-context'

const HISTORY_CAP = 100

// ---------------------------------------------------------------------------
// Render a single DrawAction
// ---------------------------------------------------------------------------

function renderAction(p: p5Type, action: DrawAction) {
  switch (action.type) {
    case 'freehand': {
      if (action.points.length < 2) return
      p.stroke(action.color)
      p.strokeWeight(action.size)
      p.strokeCap(p.ROUND)
      p.strokeJoin(p.ROUND)
      p.noFill()
      p.beginShape()
      for (const [x, y] of action.points) p.vertex(x, y)
      p.endShape()
      break
    }
    case 'eraser': {
      if (action.points.length < 2) return
      p.erase()
      p.strokeWeight(action.size)
      p.strokeCap(p.ROUND)
      p.strokeJoin(p.ROUND)
      p.noFill()
      p.beginShape()
      for (const [x, y] of action.points) p.vertex(x, y)
      p.endShape()
      p.noErase()
      break
    }
    case 'triangle': {
      applyShapeStyle(p, action.color, action.size, action.fillMode)
      p.beginShape()
      for (const [x, y] of action.points) p.vertex(x, y)
      p.endShape(p.CLOSE)
      break
    }
    case 'rectangle': {
      applyShapeStyle(p, action.color, action.size, action.fillMode)
      p.rect(action.x, action.y, action.w, action.h)
      break
    }
    case 'ellipse': {
      applyShapeStyle(p, action.color, action.size, action.fillMode)
      p.ellipse(action.cx, action.cy, action.rx * 2, action.ry * 2)
      break
    }
  }
}

function applyShapeStyle(p: p5Type, color: string, size: number, fillMode: FillMode) {
  switch (fillMode) {
    case 'outline':
      p.stroke(color)
      p.strokeWeight(size)
      p.noFill()
      break
    case 'filled':
      p.noStroke()
      p.fill(color)
      break
    case 'both':
      p.stroke(color)
      p.strokeWeight(size)
      p.fill(color + '33')
      break
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useP5Drawing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    mode,
    activeTool,
    brushSize,
    brushColor,
    fillMode,
    lineWidth,
    history,
    setHistory,
    clearRedoStack,
    p5Ref,
  } = useDrawingContext()

  const modeRef = useRef(mode)
  const activeToolRef = useRef(activeTool)
  const brushSizeRef = useRef(brushSize)
  const brushColorRef = useRef(brushColor)
  const fillModeRef = useRef(fillMode)
  const lineWidthRef = useRef(lineWidth)
  const historyRef = useRef(history)
  const currentPathRef = useRef<[number, number][]>([])
  const isDrawingRef = useRef(false)
  const dragStartRef = useRef<[number, number] | null>(null)
  const dragEndRef = useRef<[number, number] | null>(null)
  const clearRedoOnNewStrokeRef = useRef(clearRedoStack)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])
  useEffect(() => { brushColorRef.current = brushColor }, [brushColor])
  useEffect(() => { fillModeRef.current = fillMode }, [fillMode])
  useEffect(() => { lineWidthRef.current = lineWidth }, [lineWidth])
  useEffect(() => { historyRef.current = history }, [history])
  useEffect(() => { clearRedoOnNewStrokeRef.current = clearRedoStack }, [clearRedoStack])
  const saveToSession = useCallback((newHistory: DrawAction[]) => {
    try {
      sessionStorage.setItem('drawingState', JSON.stringify({ history: newHistory }))
    } catch {}
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let p5Instance: p5Type | null = null

    import('p5').then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: p5Type) => {
        p.setup = () => {
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
          canvas.style('display', 'block')
          p.pixelDensity(window.devicePixelRatio || 1)
          p.noLoop()
        }

        p.draw = () => {
          p.clear()

          for (const action of historyRef.current) {
            renderAction(p, action)
          }

          // Preview in-progress freehand / eraser
          const tool = activeToolRef.current
          if (
            (tool === 'brush' || tool === 'eraser') &&
            currentPathRef.current.length >= 2
          ) {
            if (tool === 'eraser') {
              p.erase()
              p.strokeWeight(brushSizeRef.current)
              p.strokeCap(p.ROUND)
              p.strokeJoin(p.ROUND)
              p.noFill()
              p.beginShape()
              for (const [x, y] of currentPathRef.current) p.vertex(x, y)
              p.endShape()
              p.noErase()
            } else {
              p.stroke(brushColorRef.current)
              p.strokeWeight(brushSizeRef.current)
              p.strokeCap(p.ROUND)
              p.strokeJoin(p.ROUND)
              p.noFill()
              p.beginShape()
              for (const [x, y] of currentPathRef.current) p.vertex(x, y)
              p.endShape()
            }
          }

          // Preview in-progress shape
          if (dragStartRef.current && dragEndRef.current) {
            const [x1, y1] = dragStartRef.current
            const [x2, y2] = dragEndRef.current

            if (tool === 'triangle') {
              const minX = Math.min(x1, x2)
              const maxX = Math.max(x1, x2)
              const minY = Math.min(y1, y2)
              const maxY = Math.max(y1, y2)
              applyShapeStyle(p, brushColorRef.current, lineWidthRef.current, fillModeRef.current)
              p.beginShape()
              p.vertex((minX + maxX) / 2, minY)
              p.vertex(minX, maxY)
              p.vertex(maxX, maxY)
              p.endShape(p.CLOSE)
            } else if (tool === 'rectangle') {
              applyShapeStyle(p, brushColorRef.current, lineWidthRef.current, fillModeRef.current)
              p.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))
            } else if (tool === 'ellipse') {
              applyShapeStyle(p, brushColorRef.current, lineWidthRef.current, fillModeRef.current)
              p.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1), Math.abs(y2 - y1))
            }
          }
        }

        p.mousePressed = (event: MouseEvent) => {
          if (modeRef.current !== 'pen') return
          const target = event?.target as HTMLElement
          if (target && target.tagName !== 'CANVAS') return

          const tool = activeToolRef.current

          isDrawingRef.current = true

          if (tool === 'brush' || tool === 'eraser') {
            currentPathRef.current = [[p.mouseX, p.mouseY]]
          } else if (tool === 'triangle' || tool === 'rectangle' || tool === 'ellipse') {
            dragStartRef.current = [p.mouseX, p.mouseY]
            dragEndRef.current = [p.mouseX, p.mouseY]
          }

          p.redraw()
        }

        p.mouseDragged = (event: MouseEvent) => {
          if (!isDrawingRef.current || modeRef.current !== 'pen') return
          const target = event?.target as HTMLElement
          if (target && target.tagName !== 'CANVAS') return

          const tool = activeToolRef.current

          if (tool === 'brush' || tool === 'eraser') {
            currentPathRef.current.push([p.mouseX, p.mouseY])
          } else if (tool === 'triangle' || tool === 'rectangle' || tool === 'ellipse') {
            dragEndRef.current = [p.mouseX, p.mouseY]
          }

          p.redraw()
        }

        p.mouseReleased = () => {
          if (!isDrawingRef.current) return
          isDrawingRef.current = false

          const tool = activeToolRef.current
          let newAction: DrawAction | null = null

          if (tool === 'brush') {
            if (currentPathRef.current.length > 1) {
              newAction = {
                type: 'freehand',
                points: [...currentPathRef.current],
                color: brushColorRef.current,
                size: brushSizeRef.current,
              }
            }
            currentPathRef.current = []
          } else if (tool === 'eraser') {
            if (currentPathRef.current.length > 1) {
              newAction = {
                type: 'eraser',
                points: [...currentPathRef.current],
                size: brushSizeRef.current,
              }
            }
            currentPathRef.current = []
          } else if (tool === 'triangle' && dragStartRef.current && dragEndRef.current) {
            const [x1, y1] = dragStartRef.current
            const [x2, y2] = dragEndRef.current
            const minX = Math.min(x1, x2)
            const maxX = Math.max(x1, x2)
            const minY = Math.min(y1, y2)
            const maxY = Math.max(y1, y2)
            const tw = maxX - minX
            const th = maxY - minY
            if (tw > 2 || th > 2) {
              newAction = {
                type: 'triangle',
                points: [
                  [(minX + maxX) / 2, minY],
                  [minX, maxY],
                  [maxX, maxY],
                ],
                color: brushColorRef.current,
                size: lineWidthRef.current,
                fillMode: fillModeRef.current,
              }
            }
            dragStartRef.current = null
            dragEndRef.current = null
          } else if (tool === 'rectangle' && dragStartRef.current && dragEndRef.current) {
            const [x1, y1] = dragStartRef.current
            const [x2, y2] = dragEndRef.current
            const rw = Math.abs(x2 - x1)
            const rh = Math.abs(y2 - y1)
            if (rw > 2 || rh > 2) {
              newAction = {
                type: 'rectangle',
                x: Math.min(x1, x2), y: Math.min(y1, y2), w: rw, h: rh,
                color: brushColorRef.current, size: lineWidthRef.current, fillMode: fillModeRef.current,
              }
            }
            dragStartRef.current = null
            dragEndRef.current = null
          } else if (tool === 'ellipse' && dragStartRef.current && dragEndRef.current) {
            const [x1, y1] = dragStartRef.current
            const [x2, y2] = dragEndRef.current
            const ew = Math.abs(x2 - x1)
            const eh = Math.abs(y2 - y1)
            if (ew > 2 || eh > 2) {
              newAction = {
                type: 'ellipse',
                cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, rx: ew / 2, ry: eh / 2,
                color: brushColorRef.current, size: lineWidthRef.current, fillMode: fillModeRef.current,
              }
            }
            dragStartRef.current = null
            dragEndRef.current = null
          }

          if (newAction) {
            clearRedoOnNewStrokeRef.current()
            setHistory((prev) => {
              const capped = prev.length >= HISTORY_CAP
              const newHistory = [...prev.slice(-(HISTORY_CAP - 1)), newAction]
              saveToSession(newHistory)
              if (capped) {
                toast.warning('Stroke limit reached', {
                  description: `Oldest strokes are being removed (max ${HISTORY_CAP}).`,
                  id: 'history-cap',
                })
              }
              return newHistory
            })
          }

          p5Ref.current?.redraw()
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

  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.redraw()
    }
  }, [history, p5Ref])

  return { containerRef }
}
