'use client'

import { HomeNav } from "@/components/docs/home-nav"
import { DrawingProvider, useDrawingContext } from "@/context/drawing-context"
import { DrawingToolToggle, DrawingCanvasOverlay, DrawingControls } from "@/components/docs/drawing-tools"

function HomeContent() {
  const { mode } = useDrawingContext()

  return (
    <main className="flex min-h-full w-full flex-col items-center justify-center bg-background">
      <div className="relative w-full h-full flex items-center justify-center">
        {mode !== 'pen' && (
          <div className="relative z-40 pointer-events-auto">
            <HomeNav />
          </div>
        )}
        <DrawingToolToggle />
        <DrawingControls />
      </div>
      <DrawingCanvasOverlay />
    </main>
  )
}

export default function Home() {
  return (
    <DrawingProvider>
      <HomeContent />
    </DrawingProvider>
  )
}
