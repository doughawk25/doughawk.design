'use client'

import { useEffect, useRef, useCallback } from 'react'
import type p5Type from 'p5'
import { useDrawingContext, type DrawAction, type ToolType, type FillMode, HISTORY_CAP } from '@/context/drawing-context'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Token → RGB resolver (p5.js needs rgb/hex, not CSS custom properties/OKLCH)
// ---------------------------------------------------------------------------
let tokenCache = new Map<string, string>()

function invalidateTokenCache() {
  tokenCache = new Map()
}

/**
 * Resolve a CSS custom property name (e.g. '--foreground') to an rgb() string
 * that p5.js can consume. Falls through hex values unchanged for backward compat.
 */
function resolveTokenToRgb(token: string): string {
  if (token.startsWith('#')) return token // legacy hex passthrough

  const cached = tokenCache.get(token)
  if (cached) return cached

  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  if (!raw) return '#000000'

  // Use a probe element to force the browser to convert OKLCH → rgb()
  const probe = document.createElement('div')
  probe.style.color = raw
  probe.style.display = 'none'
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  document.body.removeChild(probe)

  tokenCache.set(token, rgb)
  return rgb
}

function renderAction(p: p5Type, action: DrawAction) {
  switch (action.type) {
    case 'freehand': {
      if (action.points.length < 2) return
      p.stroke(resolveTokenToRgb(action.color))
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
      p.stroke(resolveTokenToRgb('--background'))
      p.strokeWeight(action.size)
      p.strokeCap(p.ROUND)
      p.strokeJoin(p.ROUND)
      p.noFill()
      p.beginShape()
      for (const [x, y] of action.points) p.vertex(x, y)
      p.endShape()
      break
    }
    case 'line': {
      p.stroke(resolveTokenToRgb(action.color))
      p.strokeWeight(action.size)
      p.strokeCap(p.ROUND)
      p.line(action.start[0], action.start[1], action.end[0], action.end[1])
      break
    }
    case 'rectangle': {
      const x = Math.min(action.start[0], action.end[0])
      const y = Math.min(action.start[1], action.end[1])
      const w = Math.abs(action.end[0] - action.start[0])
      const h = Math.abs(action.end[1] - action.start[1])
      applyFillMode(p, action.color, action.size, action.fillMode)
      p.rect(x, y, w, h)
      break
    }
    case 'ellipse': {
      const cx = (action.start[0] + action.end[0]) / 2
      const cy = (action.start[1] + action.end[1]) / 2
      const w = Math.abs(action.end[0] - action.start[0])
      const h = Math.abs(action.end[1] - action.start[1])
      applyFillMode(p, action.color, action.size, action.fillMode)
      p.ellipse(cx, cy, w, h)
      break
    }
    case 'triangle': {
      const x1 = (action.start[0] + action.end[0]) / 2 // top center
      const y1 = Math.min(action.start[1], action.end[1])
      const x2 = Math.min(action.start[0], action.end[0]) // bottom left
      const y2 = Math.max(action.start[1], action.end[1])
      const x3 = Math.max(action.start[0], action.end[0]) // bottom right
      const y3 = y2
      applyFillMode(p, action.color, action.size, action.fillMode)
      p.triangle(x1, y1, x2, y2, x3, y3)
      break
    }
  }
}

function applyFillMode(p: p5Type, color: string, size: number, fillMode: FillMode) {
  const resolved = resolveTokenToRgb(color)
  switch (fillMode) {
    case 'outline':
      p.noFill()
      p.stroke(resolved)
      p.strokeWeight(size)
      break
    case 'filled':
      p.fill(resolved)
      p.noStroke()
      break
  }
}

const FREEHAND_TOOLS: ToolType[] = ['brush', 'eraser']
const SHAPE_TOOLS: ToolType[] = ['line', 'rectangle', 'ellipse', 'triangle']

export function useP5Drawing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    mode,
    activeTool,
    fillMode,
    brushSize,
    brushColor,
    history,
    setHistory,
    clearRedoStack,
    p5Ref,
  } = useDrawingContext()

  const modeRef = useRef(mode)
  const activeToolRef = useRef(activeTool)
  const fillModeRef = useRef(fillMode)
  const brushSizeRef = useRef(brushSize)
  const brushColorRef = useRef(brushColor)
  const historyRef = useRef(history)
  const currentPathRef = useRef<[number, number][]>([])
  const dragStartRef = useRef<[number, number] | null>(null)
  const isDrawingRef = useRef(false)
  const clearRedoOnNewStrokeRef = useRef(clearRedoStack)
  const capNotifiedRef = useRef(false)

  useEffect(() => { clearRedoOnNewStrokeRef.current = clearRedoStack }, [clearRedoStack])
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { fillModeRef.current = fillMode }, [fillMode])
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])
  useEffect(() => { brushColorRef.current = brushColor }, [brushColor])
  useEffect(() => {
    historyRef.current = history
    if (history.length < HISTORY_CAP) capNotifiedRef.current = false
  }, [history])

  const saveToSession = useCallback((newHistory: DrawAction[]) => {
    try {
      sessionStorage.setItem('drawingState', JSON.stringify({ history: newHistory }))
    } catch {}
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let p5Instance: p5Type | null = null
    let cancelled = false

    import('p5').then((p5Module) => {
      if (cancelled) return
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

          // Render completed history
          for (const action of historyRef.current) {
            renderAction(p, action)
          }

          // Render in-progress freehand stroke
          if (currentPathRef.current.length >= 2) {
            const tool = activeToolRef.current
            if (tool === 'brush') {
              renderAction(p, { type: 'freehand', points: currentPathRef.current, color: brushColorRef.current, size: brushSizeRef.current })
            } else if (tool === 'eraser') {
              renderAction(p, { type: 'eraser', points: currentPathRef.current, size: brushSizeRef.current })
            }
          }

          // Render shape preview during drag
          if (dragStartRef.current && isDrawingRef.current) {
            const start = dragStartRef.current
            const end: [number, number] = [p.mouseX, p.mouseY]
            const tool = activeToolRef.current
            const color = brushColorRef.current
            const size = brushSizeRef.current
            const fm = fillModeRef.current

            if (tool === 'line') {
              renderAction(p, { type: 'line', start, end, color, size })
            } else if (tool === 'rectangle') {
              renderAction(p, { type: 'rectangle', start, end, color, size, fillMode: fm })
            } else if (tool === 'ellipse') {
              renderAction(p, { type: 'ellipse', start, end, color, size, fillMode: fm })
            } else if (tool === 'triangle') {
              renderAction(p, { type: 'triangle', start, end, color, size, fillMode: fm })
            }
          }
        }

        p.mousePressed = (event: MouseEvent) => {
          if (modeRef.current !== 'pen') return
          const target = event?.target as HTMLElement
          if (target && target.tagName !== 'CANVAS') return

          isDrawingRef.current = true
          const tool = activeToolRef.current

          if (FREEHAND_TOOLS.includes(tool)) {
            currentPathRef.current = [[p.mouseX, p.mouseY]]
          } else if (SHAPE_TOOLS.includes(tool)) {
            dragStartRef.current = [p.mouseX, p.mouseY]
          }
          p.redraw()
        }

        p.mouseDragged = (event: MouseEvent) => {
          if (!isDrawingRef.current || modeRef.current !== 'pen') return
          const target = event?.target as HTMLElement
          if (target && target.tagName !== 'CANVAS') return

          const tool = activeToolRef.current
          if (FREEHAND_TOOLS.includes(tool)) {
            currentPathRef.current.push([p.mouseX, p.mouseY])
          }
          // Shape tools just need a redraw to update preview
          p.redraw()
        }

        p.mouseReleased = () => {
          if (!isDrawingRef.current) return
          isDrawingRef.current = false

          const tool = activeToolRef.current
          const color = brushColorRef.current
          const size = brushSizeRef.current
          const fm = fillModeRef.current
          let newAction: DrawAction | null = null

          if (FREEHAND_TOOLS.includes(tool) && currentPathRef.current.length > 1) {
            if (tool === 'brush') {
              newAction = { type: 'freehand', points: [...currentPathRef.current], color, size }
            } else if (tool === 'eraser') {
              newAction = { type: 'eraser', points: [...currentPathRef.current], size }
            }
          } else if (SHAPE_TOOLS.includes(tool) && dragStartRef.current) {
            const start = dragStartRef.current
            const end: [number, number] = [p.mouseX, p.mouseY]
            // Only create action if there was actual movement
            if (Math.abs(end[0] - start[0]) > 2 || Math.abs(end[1] - start[1]) > 2) {
              if (tool === 'line') {
                newAction = { type: 'line', start, end, color, size }
              } else if (tool === 'rectangle') {
                newAction = { type: 'rectangle', start, end, color, size, fillMode: fm }
              } else if (tool === 'ellipse') {
                newAction = { type: 'ellipse', start, end, color, size, fillMode: fm }
              } else if (tool === 'triangle') {
                newAction = { type: 'triangle', start, end, color, size, fillMode: fm }
              }
            }
          }

          if (newAction) {
            clearRedoOnNewStrokeRef.current()
            setHistory((prev) => {
              const newHistory = [...prev, newAction]
              if (newHistory.length > HISTORY_CAP) {
                if (!capNotifiedRef.current) {
                  capNotifiedRef.current = true
                  toast.info(`Drawing history limit reached (${HISTORY_CAP} strokes). Oldest strokes will be removed.`)
                }
                const capped = newHistory.slice(-HISTORY_CAP)
                saveToSession(capped)
                return capped
              }
              saveToSession(newHistory)
              return newHistory
            })
          }

          currentPathRef.current = []
          dragStartRef.current = null
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
      cancelled = true
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

  // Redraw when theme changes (light/dark toggle mutates .dark class on <html>)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          invalidateTokenCache()
          if (p5Ref.current) {
            p5Ref.current.redraw()
          }
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [p5Ref])

  return { containerRef }
}
