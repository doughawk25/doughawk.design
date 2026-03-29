"use client"

import { useEffect, useRef } from "react"
import type p5Type from "p5"
import { connectionKey, isAdjacent } from "@/components/tools/use-form-state"

export const CELL = 80
export const PAD = 32

export function nodePosFromIndex(index: number, gridSize: number) {
  const row = Math.floor(index / gridSize)
  const col = index % gridSize
  return {
    x: PAD + col * CELL + CELL / 2,
    y: PAD + row * CELL + CELL / 2,
  }
}

// ---------------------------------------------------------------------------
// Token → RGB resolver
// ---------------------------------------------------------------------------
let tokenCache = new Map<string, string>()

function resolveTokenToRgb(token: string): string {
  if (token.startsWith("#")) return token
  const cached = tokenCache.get(token)
  if (cached) return cached
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim()
  if (!raw) return "#000000"
  const probe = document.createElement("div")
  probe.style.color = raw
  probe.style.display = "none"
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  document.body.removeChild(probe)
  tokenCache.set(token, rgb)
  return rgb
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface UseP5FormCanvasProps {
  gridSize: number
  activeNodes: Set<number>
  nodeRadius: number
  neckWidth: number
  blur: number
  threshold: number
  tiled: boolean
  connections: Set<string>
  onToggleNode: (index: number) => void
  onToggleConnection: (i: number, j: number) => void
}

// ---------------------------------------------------------------------------
// Render metaball to offscreen buffer
// ---------------------------------------------------------------------------
function renderMetaball(
  p: p5Type,
  gridSize: number,
  activeNodes: Set<number>,
  connections: Set<string>,
  nodeRadius: number,
  neckWidth: number,
  blur: number,
  threshold: number,
  svgSize: number
): p5Type.Graphics {
  // Step 1: Draw shapes to a source buffer (no blur)
  const src = p.createGraphics(svgSize, svgSize)
  src.pixelDensity(1)
  src.background(255)

  // Draw connections as thick black lines
  src.stroke(0)
  src.strokeWeight(neckWidth * 2)
  src.strokeCap(src.ROUND)
  src.noFill()
  for (const key of connections) {
    const [i, j] = key.split("_").map(Number)
    const a = nodePosFromIndex(i, gridSize)
    const b = nodePosFromIndex(j, gridSize)
    src.line(a.x, a.y, b.x, b.y)
  }

  // Draw active node circles
  src.noStroke()
  src.fill(0)
  for (const i of activeNodes) {
    const pos = nodePosFromIndex(i, gridSize)
    src.circle(pos.x, pos.y, nodeRadius * 2)
  }

  // Step 2: Draw src onto a new buffer with CSS blur applied
  const buf = p.createGraphics(svgSize, svgSize)
  buf.pixelDensity(1)
  buf.background(255)
  const ctx = (buf as unknown as { drawingContext: CanvasRenderingContext2D }).drawingContext
  ctx.filter = `blur(${blur}px)`
  // Draw the source canvas onto the blurred buffer
  const srcCanvas = (src as unknown as { elt: HTMLCanvasElement }).elt
  ctx.drawImage(srcCanvas, 0, 0)
  ctx.filter = "none"
  src.remove()

  // Step 3: Threshold the blurred result
  buf.loadPixels()
  const d = buf.pixels
  // Map threshold param (8-36) to a cutoff
  // Higher threshold = more aggressive cutoff = crisper edges
  const cutoff = 1 - threshold / 40
  for (let idx = 0; idx < d.length; idx += 4) {
    const brightness = (d[idx] + d[idx + 1] + d[idx + 2]) / 3 / 255
    if (brightness < cutoff) {
      d[idx] = 0
      d[idx + 1] = 0
      d[idx + 2] = 0
      d[idx + 3] = 255
    } else {
      d[idx + 3] = 0
    }
  }
  buf.updatePixels()

  return buf
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useP5FormCanvas(props: UseP5FormCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const p5Ref = useRef<p5Type | null>(null)

  const propsRef = useRef(props)
  propsRef.current = props

  // Drag state
  const dragSourceRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const dragTargetRef = useRef<number | null>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })

  // Trigger redraw when props change
  useEffect(() => {
    if (p5Ref.current) p5Ref.current.redraw()
  }, [
    props.gridSize,
    props.activeNodes,
    props.nodeRadius,
    props.neckWidth,
    props.blur,
    props.threshold,
    props.tiled,
    props.connections,
  ])

  // Invalidate token cache on theme change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      tokenCache = new Map()
      if (p5Ref.current) p5Ref.current.redraw()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  // p5 lifecycle
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let instance: p5Type | null = null

    import("p5").then((mod) => {
      if (!containerRef.current) return
      const P5 = mod.default

      const sketch = (p: p5Type) => {
        function computeSvgSize() {
          return PAD * 2 + propsRef.current.gridSize * CELL
        }

        function canvasToLogical(cx: number, cy: number) {
          const svgSize = computeSvgSize()
          const canvasSize = Math.min(p.width, p.height)
          const scale = svgSize / canvasSize
          return { x: cx * scale, y: cy * scale }
        }

        function hitTestNode(lx: number, ly: number): number | null {
          const { gridSize } = propsRef.current
          const total = gridSize * gridSize
          const hitRadius = CELL / 2
          let bestDist = hitRadius
          let bestIndex: number | null = null
          for (let i = 0; i < total; i++) {
            const pos = nodePosFromIndex(i, gridSize)
            const d = p.dist(lx, ly, pos.x, pos.y)
            if (d < bestDist) {
              bestDist = d
              bestIndex = i
            }
          }
          return bestIndex
        }

        p.setup = () => {
          const size = Math.min(
            container.clientWidth,
            container.clientHeight
          )
          const canvas = p.createCanvas(size || 400, size || 400)
          canvas.parent(container)
          p.pixelDensity(window.devicePixelRatio || 1)
          // Let first frame draw, then stop loop
          setTimeout(() => p.noLoop(), 100)
        }

        p.draw = () => {
          const {
            gridSize,
            activeNodes,
            nodeRadius,
            neckWidth,
            blur,
            threshold,
            tiled,
            connections,
          } = propsRef.current

          const svgSize = computeSvgSize()
          const canvasSize = Math.min(p.width, p.height)

          const bgColor = resolveTokenToRgb("--card")
          p.background(bgColor)

          if (tiled) {
            const halfSize = canvasSize / 2
            for (let tx = 0; tx < 2; tx++) {
              for (let ty = 0; ty < 2; ty++) {
                const img = renderMetaball(
                  p, gridSize, activeNodes, connections,
                  nodeRadius, neckWidth, blur, threshold, svgSize
                )
                p.image(img, tx * halfSize, ty * halfSize, halfSize, halfSize)
                img.remove()
              }
            }
            return
          }

          // Scale factor
          const scale = canvasSize / svgSize

          // Draw inactive dots
          const mutedColor = resolveTokenToRgb("--muted-foreground")
          p.push()
          p.scale(scale)
          p.noStroke()
          p.fill(mutedColor)
          ;(p.drawingContext as CanvasRenderingContext2D).globalAlpha = 0.2
          for (let i = 0; i < gridSize * gridSize; i++) {
            if (activeNodes.has(i)) continue
            const pos = nodePosFromIndex(i, gridSize)
            p.circle(pos.x, pos.y, 6)
          }
          ;(p.drawingContext as CanvasRenderingContext2D).globalAlpha = 1
          p.pop()

          // Render metaball
          const metaImg = renderMetaball(
            p, gridSize, activeNodes, connections,
            nodeRadius, neckWidth, blur, threshold, svgSize
          )
          p.image(metaImg, 0, 0, canvasSize, canvasSize)
          metaImg.remove()

          // Draw drag preview line
          if (isDraggingRef.current && dragSourceRef.current !== null) {
            const sourcePos = nodePosFromIndex(dragSourceRef.current, gridSize)
            p.push()
            p.scale(scale)

            if (dragTargetRef.current !== null) {
              const targetPos = nodePosFromIndex(dragTargetRef.current, gridSize)
              const fgColor = resolveTokenToRgb("--foreground")
              p.stroke(fgColor)
              p.strokeWeight(3)
              p.strokeCap(p.ROUND)
              p.line(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y)
            } else {
              const logicalMouse = canvasToLogical(
                mousePosRef.current.x,
                mousePosRef.current.y
              )
              p.stroke(mutedColor)
              p.strokeWeight(2)
              p.strokeCap(p.ROUND)
              p.drawingContext.setLineDash([6, 4])
              p.line(sourcePos.x, sourcePos.y, logicalMouse.x, logicalMouse.y)
              p.drawingContext.setLineDash([])
            }
            p.pop()
          }
        }

        p.mousePressed = () => {
          if (
            p.mouseX < 0 || p.mouseX > p.width ||
            p.mouseY < 0 || p.mouseY > p.height
          ) return
          const logical = canvasToLogical(p.mouseX, p.mouseY)
          const node = hitTestNode(logical.x, logical.y)
          if (node !== null) {
            dragSourceRef.current = node
            isDraggingRef.current = true
            dragTargetRef.current = null
            mousePosRef.current = { x: p.mouseX, y: p.mouseY }
            p.redraw()
          }
        }

        p.mouseDragged = () => {
          if (!isDraggingRef.current || dragSourceRef.current === null) return
          mousePosRef.current = { x: p.mouseX, y: p.mouseY }
          const logical = canvasToLogical(p.mouseX, p.mouseY)
          const node = hitTestNode(logical.x, logical.y)

          if (
            node !== null &&
            node !== dragSourceRef.current &&
            isAdjacent(node, dragSourceRef.current, propsRef.current.gridSize)
          ) {
            dragTargetRef.current = node
          } else {
            dragTargetRef.current = null
          }
          p.redraw()
        }

        p.mouseReleased = () => {
          if (!isDraggingRef.current) return

          if (
            dragSourceRef.current !== null &&
            dragTargetRef.current !== null
          ) {
            propsRef.current.onToggleConnection(
              dragSourceRef.current,
              dragTargetRef.current
            )
          } else if (dragSourceRef.current !== null) {
            const logical = canvasToLogical(p.mouseX, p.mouseY)
            const sourcePos = nodePosFromIndex(
              dragSourceRef.current,
              propsRef.current.gridSize
            )
            const dist = p.dist(logical.x, logical.y, sourcePos.x, sourcePos.y)
            if (dist < 15) {
              propsRef.current.onToggleNode(dragSourceRef.current)
            }
          }

          isDraggingRef.current = false
          dragSourceRef.current = null
          dragTargetRef.current = null
          p.redraw()
        }

        p.windowResized = () => {
          if (!container) return
          const size = Math.min(
            container.clientWidth,
            container.clientHeight
          )
          if (size > 0) {
            p.resizeCanvas(size, size)
            p.redraw()
          }
        }
      }

      instance = new P5(sketch, container)
      p5Ref.current = instance
    })

    return () => {
      if (instance) {
        instance.remove()
        instance = null
      }
      p5Ref.current = null
    }
  }, [])

  return { containerRef }
}
