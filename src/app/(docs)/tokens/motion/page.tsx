"use client"

import { PageHeader } from "@/components/docs/page-header"
import { Card } from "@/components/ui/card"
import { TokenTable } from "@/components/docs/token-table"
import { motionTokens } from "@/lib/tokens"

function parseCubicBezier(value: string): [number, number, number, number] | null {
  const match = value.match(/cubic-bezier\(([^)]+)\)/)
  if (!match) return null
  const parts = match[1].split(",").map((s) => parseFloat(s.trim()))
  if (parts.length !== 4) return null
  return parts as [number, number, number, number]
}

// Velocity (derivative) of cubic bezier y-component at t
// By(t) = 3(1-t)²t·y1 + 3(1-t)t²·y2 + t³  =>  dBy/dt = 3(1-t)(1-3t)y1 + 3t(2-3t)y2 + 3t²
function bezierVelocity(t: number, y1: number, y2: number): number {
  const mt = 1 - t
  return 3 * mt * (1 - 3 * t) * y1 + 3 * t * (2 - 3 * t) * y2 + 3 * t * t
}

function EasingCurveGraph({ value }: { value: string }) {
  const coords = parseCubicBezier(value)
  if (!coords) return null

  const [x1, y1, x2, y2] = coords
  const w = 80
  const h = 48
  const padding = 4

  // Scale y to fit overshoot (e.g. spring has y1=1.56)
  const yMin = Math.min(0, y1, y2)
  const yMax = Math.max(1, y1, y2)
  const yRange = yMax - yMin || 1

  const toSvg = (x: number, y: number) => {
    const sx = padding + (x * (w - padding * 2))
    const sy = h - padding - ((y - yMin) / yRange) * (h - padding * 2)
    return `${sx},${sy}`
  }

  const path = `M ${toSvg(0, 0)} C ${toSvg(x1, y1)} ${toSvg(x2, y2)} ${toSvg(1, 1)}`

  // Speed graph: sample velocity at many t values
  const samples = 50
  const velocities: number[] = []
  for (let i = 0; i <= samples; i++) {
    velocities.push(bezierVelocity(i / samples, y1, y2))
  }
  const vMin = Math.min(0, ...velocities)
  const vMax = Math.max(1, ...velocities)
  const vRange = vMax - vMin || 1
  const speedPath = Array.from({ length: samples + 1 }, (_, i) => {
    const t = i / samples
    const v = velocities[i]!
    const sy = h - padding - ((v - vMin) / vRange) * (h - padding * 2)
    return `${padding + t * (w - padding * 2)},${sy}`
  }).join(" L ")

  return (
    <div className="space-y-2">
      {/* Progress curve (easing) */}
      <div>
        <p className="text-[10px] text-muted-foreground/70 mb-0.5">Progress</p>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10 text-muted-foreground" preserveAspectRatio="xMidYMid meet">
          <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
          <line x1={padding} y1={padding} x2={padding} y2={h - padding} stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
          <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Speed graph (velocity) */}
      <div>
        <p className="text-[10px] text-muted-foreground/70 mb-0.5">Speed</p>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10 text-muted-foreground" preserveAspectRatio="xMidYMid meet">
          <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
          <line x1={padding} y1={padding} x2={padding} y2={h - padding} stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
          <path d={`M ${speedPath}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export default function TokensMotionPage() {
  const durationRows = Object.entries(motionTokens.duration).map(
    ([name, token]) => ({
      name,
      values: { value: token.value, description: token.description },
    })
  )

  const easingRows = Object.entries(motionTokens.easing).map(
    ([name, token]) => ({
      name,
      values: { value: token.value, description: token.description },
    })
  )

  return (
    <>
      <PageHeader
        title="Motion Tokens"
        description="Duration and easing values for consistent animation timing."
      />

      <section className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Duration</h2>
          <TokenTable
            tokens={durationRows}
            columns={[
              { key: "value", label: "Value" },
              { key: "description", label: "Usage" },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(motionTokens.duration).map(([key, token]) => (
              <Card key={key} className="p-4 group cursor-pointer">
                <p className="text-sm font-medium mb-2">{token.label}</p>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary w-0 group-hover:w-full"
                    style={{
                      transition: `width ${token.value} ease-out`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {token.value}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Easing</h2>
          <TokenTable
            tokens={easingRows}
            columns={[
              { key: "value", label: "Value" },
              { key: "description", label: "Usage" },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(motionTokens.easing).map(([key, token]) => (
              <Card key={key} className="p-4 group cursor-pointer">
                <p className="text-sm font-medium mb-2">{token.label}</p>
                <EasingCurveGraph value={token.value} />
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-primary w-0 group-hover:w-full"
                    style={{
                      transition: `width 400ms ${token.value}`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono truncate" title={token.value}>
                  {token.value}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
