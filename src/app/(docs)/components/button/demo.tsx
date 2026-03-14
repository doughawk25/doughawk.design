"use client"

import { Button } from "@/components/ui/button"

import { ComponentPreview } from "@/components/docs/component-preview"

export function ButtonDemo() {
  
  return (
    <ComponentPreview
      name="Button"
      description="Primary action element with multiple variants and sizes."
      showBgToggle={false}
      code={`<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>`}
    >
      <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
    </ComponentPreview>
  )
}
