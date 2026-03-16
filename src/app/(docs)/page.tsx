'use client'

import { HomeNav } from "@/components/docs/home-nav"
import { DrawingProvider, useDrawingContext } from "@/context/drawing-context"
import { DrawingToolToggle, DrawingCanvasOverlay, DrawingControls } from "@/components/docs/drawing-tools"
import { Toaster } from "@/components/ui/sonner"

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
        <div className="fixed left-4 top-4 z-40 flex items-start gap-1 pointer-events-none [&>*]:pointer-events-auto">
          <DrawingToolToggle />
          <DrawingControls />
        </div>
      </div>
      <DrawingCanvasOverlay />
      <Toaster position="bottom-center" />
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
