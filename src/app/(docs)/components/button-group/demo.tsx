"use client"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

import { ComponentPreview } from "@/components/docs/component-preview"

export function ButtonGroupDemo() {
  
  return (
    <ComponentPreview
      name="Button Group"
      description="Groups multiple buttons together visually."
      showBgToggle={false}
      code={`<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>`}
    >
      <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
    </ComponentPreview>
  )
}
