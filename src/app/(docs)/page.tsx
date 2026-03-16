'use client'

import { HomeNav } from "@/components/docs/home-nav"
import { DrawingProvider, useDrawingContext } from "@/context/drawing-context"
import { DrawingToolbar, DrawingCanvasOverlay } from "@/components/docs/drawing-tools"
import { AnimatePresence } from "framer-motion"

function HomeContent() {
  const { mode } = useDrawingContext()

  return (
    <main className="flex min-h-full w-full flex-col justify-center bg-background">
      <div className="relative w-full h-full flex items-center justify-end">
        <AnimatePresence>
          {mode !== 'pen' && (
            <div className="relative z-40 pointer-events-auto">
              <HomeNav />
            </div>
          )}
        </AnimatePresence>
        <DrawingToolbar />
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
