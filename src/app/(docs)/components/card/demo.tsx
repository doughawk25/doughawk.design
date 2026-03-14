"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { ComponentPreview } from "@/components/docs/component-preview"

export function CardDemo() {
  return (
    <ComponentPreview
      name="Card"
      description="Contained surface for grouping related content."
      code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`}
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Card content</p>
        </CardContent>
      </Card>
    </ComponentPreview>
  )
}
