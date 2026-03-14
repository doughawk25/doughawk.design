"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

import { ComponentPreview } from "@/components/docs/component-preview"

export function CarouselDemo() {
  
  return (
    <ComponentPreview
      name="Carousel"
      description="A slideshow component for cycling through elements."
      showBgToggle={false}
      code={`<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
    >
      <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((i) => (
          <CarouselItem key={i}>
            <Card><CardContent className="flex aspect-square items-center justify-center p-6"><span className="text-3xl font-semibold">{i}</span></CardContent></Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
    </ComponentPreview>
  )
}
