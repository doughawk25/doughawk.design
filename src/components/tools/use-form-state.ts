"use client"

import { useState, useCallback, useRef } from "react"

export const PRESETS = [
  { name: "P", g: 4, n: [0, 1, 2, 3, 4, 5, 6, 7, 8, 12] },
  { name: "F", g: 4, n: [0, 1, 2, 3, 4, 5, 6, 8, 12] },
  { name: "A", g: 4, n: [0, 3, 4, 5, 6, 7, 8, 11, 12, 15] },
  { name: "H", g: 4, n: [0, 3, 4, 5, 6, 7, 8, 11, 12, 15] },
  { name: "B", g: 4, n: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14] },
  { name: "S", g: 4, n: [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15] },
  { name: "\u25C8", g: 4, n: [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15] },
  { name: "T", g: 4, n: [0, 1, 2, 3, 5, 9, 13] },
] as const

export function connectionKey(i: number, j: number): string {
  return i < j ? `${i}_${j}` : `${j}_${i}`
}

/** Check if two nodes are adjacent (all 8 directions) */
export function isAdjacent(i: number, j: number, gridSize: number): boolean {
  const rowA = Math.floor(i / gridSize)
  const colA = i % gridSize
  const rowB = Math.floor(j / gridSize)
  const colB = j % gridSize
  const dr = Math.abs(rowA - rowB)
  const dc = Math.abs(colA - colB)
  return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)
}

function cleanConnectionsForNode(
  connections: Set<string>,
  index: number
): Set<string> {
  let changed = false
  const next = new Set(connections)
  for (const key of connections) {
    const [a, b] = key.split("_").map(Number)
    if (a === index || b === index) {
      next.delete(key)
      changed = true
    }
  }
  return changed ? next : connections
}

export interface TileState {
  activeNodes: Set<number>
  connections: Set<string>
}

function makeDefaultTile(gridSize: number): TileState {
  return {
    activeNodes: new Set(Array.from({ length: gridSize * gridSize }, (_, i) => i)),
    connections: new Set(),
  }
}

/**
 * Generate a letter-like glyph by combining structural strokes.
 * Strokes are defined as runs of connected nodes along edges,
 * through the middle, or diagonally — mimicking how letterforms
 * are constructed from vertical stems, crossbars, and bowls.
 */
function randomizeTile(gridSize: number): TileState {
  const N = gridSize
  const last = N - 1
  const mid = Math.floor(last / 2)

  // Helper: column of nodes
  const col = (c: number, from = 0, to = last) => {
    const nodes: number[] = []
    for (let r = from; r <= to; r++) nodes.push(r * N + c)
    return nodes
  }
  // Helper: row of nodes
  const row = (r: number, from = 0, to = last) => {
    const nodes: number[] = []
    for (let c = from; c <= to; c++) nodes.push(r * N + c)
    return nodes
  }
  // Helper: diagonal ↘
  const diagDown = (fromR: number, fromC: number, len: number) => {
    const nodes: number[] = []
    for (let i = 0; i < len && fromR + i < N && fromC + i < N; i++) {
      nodes.push((fromR + i) * N + (fromC + i))
    }
    return nodes
  }
  // Helper: diagonal ↙
  const diagUp = (fromR: number, fromC: number, len: number) => {
    const nodes: number[] = []
    for (let i = 0; i < len && fromR + i < N && fromC - i >= 0; i++) {
      nodes.push((fromR + i) * N + (fromC - i))
    }
    return nodes
  }

  // Stroke library — each stroke is a run of nodes that get connected sequentially
  const strokes = [
    col(0),                        // left vertical (full)
    col(last),                     // right vertical (full)
    col(0, 0, mid),                // left vertical (top half)
    col(0, mid, last),             // left vertical (bottom half)
    col(last, 0, mid),             // right vertical (top half)
    col(last, mid, last),          // right vertical (bottom half)
    col(mid),                      // center vertical
    row(0),                        // top horizontal
    row(last),                     // bottom horizontal
    row(mid),                      // middle horizontal
    row(0, 0, mid),                // top-left horizontal
    row(0, mid, last),             // top-right horizontal
    row(last, 0, mid),             // bottom-left horizontal
    row(last, mid, last),          // bottom-right horizontal
    diagDown(0, 0, N),             // diagonal ↘
    diagUp(0, last, N),            // diagonal ↙
    diagDown(0, 0, mid + 1),       // half diagonal ↘
    diagUp(0, last, mid + 1),      // half diagonal ↙
  ]

  // Pick 2–4 strokes to combine
  const count = 2 + Math.floor(Math.random() * 3)
  const picked = new Set<number>()
  while (picked.size < count && picked.size < strokes.length) {
    picked.add(Math.floor(Math.random() * strokes.length))
  }

  const activeNodes = new Set<number>()
  const connections = new Set<string>()

  // Collect nodes that participate in strokes
  const connectedNodes = new Set<number>()

  for (const si of picked) {
    const stroke = strokes[si]
    for (const n of stroke) connectedNodes.add(n)
    for (let k = 0; k < stroke.length - 1; k++) {
      const a = stroke[k]
      const b = stroke[k + 1]
      if (isAdjacent(a, b, N)) {
        connections.add(connectionKey(a, b))
      }
    }
  }

  // All connected nodes are active; unconnected nodes have ~40% chance of being turned off
  for (let i = 0; i < N * N; i++) {
    if (connectedNodes.has(i)) {
      activeNodes.add(i)
    } else if (Math.random() > 0.4) {
      activeNodes.add(i)
    }
  }

  return { activeNodes, connections }
}

export function useFormState() {
  const [gridSize, setGridSizeRaw] = useState(3)
  const [tiles, setTiles] = useState<[TileState, TileState, TileState, TileState]>(() => [
    makeDefaultTile(3),
    makeDefaultTile(3),
    makeDefaultTile(3),
    makeDefaultTile(3),
  ])
  const [nodeRadius, setNodeRadius] = useState(14)
  const [cornerRadius, setCornerRadius] = useState(0) // 0–100%, 100 = circle, 0 = square
  const [neckWidth, setNeckWidth] = useState(4)
  const [nodeGap, setNodeGap] = useState(80) // cell size in px (gap between node centers)
  const blur = 4
  const threshold = 36
  const [tiled, setTiled] = useState(false)

  const gridSizeRef = useRef(gridSize)
  gridSizeRef.current = gridSize

  const updateTile = useCallback(
    (tileIndex: number, updater: (prev: TileState) => TileState) => {
      setTiles((prev) => {
        const next = [...prev] as [TileState, TileState, TileState, TileState]
        next[tileIndex] = updater(prev[tileIndex])
        return next
      })
    },
    []
  )

  const setGridSize = useCallback((size: number) => {
    setGridSizeRaw(size)
    const def = makeDefaultTile(size)
    setTiles([
      { ...def, activeNodes: new Set(def.activeNodes), connections: new Set(def.connections) },
      { ...def, activeNodes: new Set(def.activeNodes), connections: new Set(def.connections) },
      { ...def, activeNodes: new Set(def.activeNodes), connections: new Set(def.connections) },
      { ...def, activeNodes: new Set(def.activeNodes), connections: new Set(def.connections) },
    ])
  }, [])

  const toggleNode = useCallback((index: number, tileIndex = 0) => {
    updateTile(tileIndex, (tile) => {
      const next = new Set(tile.activeNodes)
      let conns = tile.connections
      if (next.has(index)) {
        next.delete(index)
        conns = cleanConnectionsForNode(conns, index)
      } else {
        next.add(index)
      }
      return { activeNodes: next, connections: conns }
    })
  }, [updateTile])

  const toggleConnection = useCallback((i: number, j: number, tileIndex = 0) => {
    if (i === j) return
    if (!isAdjacent(i, j, gridSizeRef.current)) return
    const key = connectionKey(i, j)
    updateTile(tileIndex, (tile) => {
      const next = new Set(tile.connections)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...tile, connections: next }
    })
  }, [updateTile])

  const clearConnections = useCallback((tileIndex?: number) => {
    if (tileIndex !== undefined) {
      updateTile(tileIndex, (tile) => ({ ...tile, connections: new Set() }))
    } else {
      setTiles((prev) => prev.map((t) => ({ ...t, connections: new Set() })) as [TileState, TileState, TileState, TileState])
    }
  }, [updateTile])

  const randomize = useCallback(() => {
    setTiles([
      randomizeTile(gridSize),
      randomizeTile(gridSize),
      randomizeTile(gridSize),
      randomizeTile(gridSize),
    ])
  }, [gridSize])

  const clearAll = useCallback(() => {
    const empty: TileState = { activeNodes: new Set(), connections: new Set() }
    setTiles([
      { ...empty, activeNodes: new Set(), connections: new Set() },
      { ...empty, activeNodes: new Set(), connections: new Set() },
      { ...empty, activeNodes: new Set(), connections: new Set() },
      { ...empty, activeNodes: new Set(), connections: new Set() },
    ])
  }, [])

  const fillAll = useCallback(() => {
    const total = gridSize * gridSize
    const full = new Set(Array.from({ length: total }, (_, i) => i))
    setTiles([
      { activeNodes: new Set(full), connections: new Set() },
      { activeNodes: new Set(full), connections: new Set() },
      { activeNodes: new Set(full), connections: new Set() },
      { activeNodes: new Set(full), connections: new Set() },
    ])
  }, [gridSize])

  // Convenience: total connection count across all tiles (or just tile 0 when not tiled)
  const connectionCount = tiled
    ? tiles.reduce((sum, t) => sum + t.connections.size, 0)
    : tiles[0].connections.size

  return {
    gridSize,
    setGridSize,
    tiles,
    nodeRadius,
    setNodeRadius,
    cornerRadius,
    setCornerRadius,
    neckWidth,
    setNeckWidth,
    nodeGap,
    setNodeGap,
    blur,
    threshold,
    tiled,
    setTiled,
    toggleNode,
    toggleConnection,
    clearConnections,
    connectionCount,
    randomize,
    clearAll,
    fillAll,
  }
}
