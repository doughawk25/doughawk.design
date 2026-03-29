"use client"

import { useCallback, useRef, useMemo, useState, memo } from "react"
import { connectionKey, isAdjacent, type TileState } from "./use-form-state"

export const CELL = 80
export const PAD = 32

interface FormCanvasProps {
  gridSize: number
  tiles: [TileState, TileState, TileState, TileState]
  nodeRadius: number
  cornerRadius: number
  neckWidth: number
  nodeGap: number
  blur: number
  threshold: number
  tiled: boolean
  onToggleNode: (index: number, tileIndex?: number) => void
  onToggleConnection: (i: number, j: number, tileIndex?: number) => void
}

export function nodePos(row: number, col: number, cell = CELL) {
  return {
    x: PAD + col * cell + cell / 2,
    y: PAD + row * cell + cell / 2,
  }
}

export function nodePosFromIndex(index: number, gridSize: number, cell = CELL) {
  return nodePos(Math.floor(index / gridSize), index % gridSize, cell)
}

export const MetaballSVG = memo(function MetaballSVG({
  gridSize,
  activeNodes,
  nodeRadius,
  cornerRadius = 100,
  neckWidth,
  cell = CELL,
  blur,
  threshold,
  connections,
  id = "mb",
}: {
  gridSize: number
  activeNodes: Set<number>
  nodeRadius: number
  cornerRadius?: number
  neckWidth: number
  cell?: number
  blur: number
  threshold: number
  connections: Set<string> | string[]
  id?: string
}) {
  const svgSize = PAD * 2 + gridSize * cell

  const connectionSet = useMemo(
    () => (connections instanceof Set ? connections : new Set(connections)),
    [connections]
  )

  const connectionPairs = useMemo(() => {
    const result: { i: number; j: number }[] = []
    for (const key of connectionSet) {
      const [i, j] = key.split("_").map(Number)
      result.push({ i, j })
    }
    return result
  }, [connectionSet])

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold} ${-(threshold * 0.42)}`}
          />
        </filter>
      </defs>

      {/* Inactive dots */}
      {Array.from({ length: gridSize * gridSize }, (_, i) => {
        if (activeNodes.has(i)) return null
        const { x, y } = nodePosFromIndex(i, gridSize, cell)
        return (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={3}
            className="fill-muted-foreground/20"
          />
        )
      })}

      {/* Filtered blob group */}
      <g filter={`url(#${id})`}>
        {/* Connection lines */}
        {connectionPairs.map(({ i, j }) => {
          const a = nodePosFromIndex(i, gridSize, cell)
          const b = nodePosFromIndex(j, gridSize, cell)
          return (
            <line
              key={`line-${i}-${j}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              strokeWidth={neckWidth * 2}
              strokeLinecap="round"
            />
          )
        })}
        {/* Active nodes */}
        {Array.from(activeNodes).map((i) => {
          const { x, y } = nodePosFromIndex(i, gridSize, cell)
          const rx = (cornerRadius / 100) * nodeRadius
          return (
            <rect
              key={`node-${i}`}
              x={x - nodeRadius}
              y={y - nodeRadius}
              width={nodeRadius * 2}
              height={nodeRadius * 2}
              rx={rx}
              ry={rx}
              fill="currentColor"
            />
          )
        })}
      </g>
    </svg>
  )
})

export function FormCanvas({
  gridSize,
  tiles,
  nodeRadius,
  cornerRadius,
  neckWidth,
  nodeGap,
  blur,
  threshold,
  tiled,
  onToggleNode,
  onToggleConnection,
}: FormCanvasProps) {
  const svgSize = PAD * 2 + gridSize * nodeGap

  // Drag state
  const dragSourceRef = useRef<number | null>(null)
  const dragTileRef = useRef<number>(0)
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const [dragPreview, setDragPreview] = useState<{
    sourceIndex: number
    cursorX: number
    cursorY: number
    targetIndex: number | null
    tileIndex: number
  } | null>(null)
  const hitSvgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<{ index: number; tileIndex: number } | null>(null)

  // Returns coords in single-tile space + which tile was hit
  const clientToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number; tileIndex: number } => {
      const svg = hitSvgRef.current
      if (!svg) return { x: 0, y: 0, tileIndex: 0 }
      const rect = svg.getBoundingClientRect()

      if (tiled) {
        const vbWidth = svgSize * 2
        const vbHeight = svgSize * 2
        const rawX = ((clientX - rect.left) / rect.width) * vbWidth
        const rawY = ((clientY - rect.top) / rect.height) * vbHeight
        const tileCol = rawX < svgSize ? 0 : 1
        const tileRow = rawY < svgSize ? 0 : 1
        const tileIndex = tileRow * 2 + tileCol
        return {
          x: ((rawX % svgSize) + svgSize) % svgSize,
          y: ((rawY % svgSize) + svgSize) % svgSize,
          tileIndex,
        }
      } else {
        const scaleX = svgSize / rect.width
        const scaleY = svgSize / rect.height
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY,
          tileIndex: 0,
        }
      }
    },
    [svgSize, tiled]
  )

  const handlePointerDown = useCallback(
    (index: number, tileIndex: number, e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      dragSourceRef.current = index
      dragTileRef.current = tileIndex
      isDraggingRef.current = true
      hasDraggedRef.current = false
      setHoveredNode(null)
      const svgPos = clientToSvg(e.clientX, e.clientY)
      setDragPreview({
        sourceIndex: index,
        cursorX: svgPos.x,
        cursorY: svgPos.y,
        targetIndex: null,
        tileIndex,
      })
    },
    [clientToSvg]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || dragSourceRef.current === null) return
      hasDraggedRef.current = true
      const svgPos = clientToSvg(e.clientX, e.clientY)

      // Hit-test: find closest node within CELL/2
      let bestDist = nodeGap / 2
      let bestNode: number | null = null
      const total = gridSize * gridSize
      for (let i = 0; i < total; i++) {
        if (i === dragSourceRef.current) continue
        const pos = nodePosFromIndex(i, gridSize, nodeGap)
        const d = Math.sqrt((svgPos.x - pos.x) ** 2 + (svgPos.y - pos.y) ** 2)
        if (d < bestDist && isAdjacent(i, dragSourceRef.current, gridSize)) {
          bestDist = d
          bestNode = i
        }
      }

      if (bestNode !== null) {
        const pos = nodePosFromIndex(bestNode, gridSize, nodeGap)
        setDragPreview((prev) =>
          prev
            ? { ...prev, cursorX: pos.x, cursorY: pos.y, targetIndex: bestNode }
            : null
        )
      } else {
        setDragPreview((prev) =>
          prev
            ? { ...prev, cursorX: svgPos.x, cursorY: svgPos.y, targetIndex: null }
            : null
        )
      }
    },
    [clientToSvg, gridSize]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return
    const ti = dragTileRef.current

    if (dragSourceRef.current !== null && dragPreview?.targetIndex !== null && dragPreview?.targetIndex !== undefined) {
      onToggleConnection(dragSourceRef.current, dragPreview.targetIndex, ti)
    } else if (dragSourceRef.current !== null && !hasDraggedRef.current) {
      onToggleNode(dragSourceRef.current, ti)
    }

    isDraggingRef.current = false
    dragSourceRef.current = null
    hasDraggedRef.current = false
    setDragPreview(null)
  }, [dragPreview, onToggleConnection, onToggleNode])

  const handlePointerLeave = useCallback(() => {
    isDraggingRef.current = false
    dragSourceRef.current = null
    hasDraggedRef.current = false
    setDragPreview(null)
  }, [])

  const sharedProps = { nodeRadius, cornerRadius, neckWidth, cell: nodeGap, blur, threshold, gridSize }

  // Preview line while dragging
  const previewLine = dragPreview
    ? (() => {
        const source = nodePosFromIndex(dragPreview.sourceIndex, gridSize, nodeGap)
        const isSnapped = dragPreview.targetIndex !== null
        return {
          x1: source.x,
          y1: source.y,
          x2: dragPreview.cursorX,
          y2: dragPreview.cursorY,
          isSnapped,
          tileIndex: dragPreview.tileIndex,
        }
      })()
    : null

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div
        className="relative aspect-square h-full max-w-full select-none overflow-hidden"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: "none" }}
      >
        {tiled ? (
          <div className="relative grid grid-cols-2 w-full h-full">
            {[0, 1, 2, 3].map((ti) => (
              <MetaballSVG
                key={ti}
                {...sharedProps}
                activeNodes={tiles[ti].activeNodes}
                connections={tiles[ti].connections}
                id={`mb-tile-${ti}`}
              />
            ))}
            {/* Hit targets overlay */}
            <svg
              ref={hitSvgRef}
              viewBox={`0 0 ${svgSize * 2} ${svgSize * 2}`}
              className="absolute inset-0 w-full h-full"
              style={{ cursor: "pointer" }}
              onPointerMove={handlePointerMove}
            >
              {/* Preview line only on the active tile */}
              {previewLine && (() => {
                const offsetX = (previewLine.tileIndex % 2) * svgSize
                const offsetY = Math.floor(previewLine.tileIndex / 2) * svgSize
                return (
                  <>
                    <circle
                      cx={previewLine.x1 + offsetX}
                      cy={previewLine.y1 + offsetY}
                      r={8}
                      className="fill-indigo-500"
                      style={{ pointerEvents: "none" }}
                    />
                    <line
                      x1={previewLine.x1 + offsetX}
                      y1={previewLine.y1 + offsetY}
                      x2={previewLine.x2 + offsetX}
                      y2={previewLine.y2 + offsetY}
                      className="stroke-indigo-500"
                      strokeWidth={previewLine.isSnapped ? 4 : 2}
                      strokeLinecap="round"
                      style={{ pointerEvents: "none" }}
                    />
                    {previewLine.isSnapped && (
                      <circle
                        cx={previewLine.x2 + offsetX}
                        cy={previewLine.y2 + offsetY}
                        r={8}
                        className="fill-indigo-500"
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                  </>
                )
              })()}
              {/* Hit targets for all 4 tiles — each maps to its own tile index */}
              {[0, 1, 2, 3].map((ti) => {
                const offsetX = (ti % 2) * svgSize
                const offsetY = Math.floor(ti / 2) * svgSize
                return Array.from({ length: gridSize * gridSize }, (_, i) => {
                  const { x, y } = nodePosFromIndex(i, gridSize, nodeGap)
                  return (
                    <circle
                      key={`hit-${ti}-${i}`}
                      cx={x + offsetX}
                      cy={y + offsetY}
                      r={nodeGap / 2}
                      fill="transparent"
                      onPointerDown={(e) => handlePointerDown(i, ti, e)}
                      onPointerEnter={() => !isDraggingRef.current && setHoveredNode({ index: i, tileIndex: ti })}
                      onPointerLeave={() => !isDraggingRef.current && setHoveredNode(null)}
                    />
                  )
                })
              })}
            </svg>
          </div>
        ) : (
          <>
            <MetaballSVG
              {...sharedProps}
              activeNodes={tiles[0].activeNodes}
              connections={tiles[0].connections}
            />
            {/* Hit targets + preview */}
            <svg
              ref={hitSvgRef}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="absolute inset-0 w-full h-full"
              style={{ cursor: "pointer" }}
              onPointerMove={handlePointerMove}
            >
              {previewLine && (
                <>
                  <circle
                    cx={previewLine.x1}
                    cy={previewLine.y1}
                    r={8}
                    className="fill-indigo-500"
                    style={{ pointerEvents: "none" }}
                  />
                  <line
                    x1={previewLine.x1}
                    y1={previewLine.y1}
                    x2={previewLine.x2}
                    y2={previewLine.y2}
                    className="stroke-indigo-500"
                    strokeWidth={previewLine.isSnapped ? 4 : 2}
                    strokeLinecap="round"
                    style={{ pointerEvents: "none" }}
                  />
                  {previewLine.isSnapped && (
                    <circle
                      cx={previewLine.x2}
                      cy={previewLine.y2}
                      r={8}
                      className="fill-indigo-500"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </>
              )}
              {/* Hover indicator */}
              {hoveredNode && !dragPreview && hoveredNode.tileIndex === 0 && (() => {
                const pos = nodePosFromIndex(hoveredNode.index, gridSize, nodeGap)
                return (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={8}
                    className="fill-indigo-500/50"
                    style={{ pointerEvents: "none" }}
                  />
                )
              })()}
              {Array.from({ length: gridSize * gridSize }, (_, i) => {
                const { x, y } = nodePosFromIndex(i, gridSize, nodeGap)
                return (
                  <circle
                    key={`hit-${i}`}
                    cx={x}
                    cy={y}
                    r={nodeGap / 2}
                    fill="transparent"
                    onPointerDown={(e) => handlePointerDown(i, 0, e)}
                    onPointerEnter={() => !isDraggingRef.current && setHoveredNode({ index: i, tileIndex: 0 })}
                    onPointerLeave={() => !isDraggingRef.current && setHoveredNode(null)}
                  />
                )
              })}
            </svg>
          </>
        )}
      </div>
    </div>
  )
}
