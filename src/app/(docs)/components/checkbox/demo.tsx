"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { ComponentPreview } from "@/components/docs/component-preview"

export function CheckboxDemo() {
  
  return (
    <ComponentPreview
      name="Checkbox"
      description="A control that allows the user to toggle between checked and not checked."
      showBgToggle={false}
      code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>`}
    >
      <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="newsletter" defaultChecked />
        <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled">Disabled option</Label>
      </div>
    </div>
    </ComponentPreview>
  )
}
