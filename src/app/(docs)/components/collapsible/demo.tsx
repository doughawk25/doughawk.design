"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDownIcon } from "lucide-react"
import { useState } from "react"

import { ComponentPreview } from "@/components/docs/component-preview"


export function CollapsibleDemo() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ComponentPreview
      name="Collapsible"
      description="An interactive component which expands/collapses a panel."
      showBgToggle={false}
      code={`<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full max-w-sm space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">3 items</h4>
        <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}><ChevronsUpDownIcon className="h-4 w-4" /></CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 text-sm">Item 1</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">Item 2</div>
        <div className="rounded-md border px-4 py-2 text-sm">Item 3</div>
      </CollapsibleContent>
    </Collapsible>
    </ComponentPreview>
  )
}
