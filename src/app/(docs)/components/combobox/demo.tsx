"use client"

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox"
import { useState } from "react"

import { ComponentPreview } from "@/components/docs/component-preview"


export function ComboboxDemo() {
  const [value, setValue] = useState<string | null>(null)
  return (
    <ComponentPreview
      name="Combobox"
      description="Autocomplete input with a filterable dropdown list."
      showBgToggle={false}
      code={`<Combobox value={value} onValueChange={setValue}>
  <ComboboxTrigger>
    <ComboboxInput placeholder="Search..." />
  </ComboboxTrigger>
  <ComboboxContent>
    <ComboboxList>
      <ComboboxItem value="next">Next.js</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
    >
      <div className="w-[240px]">
      <Combobox value={value} onValueChange={setValue}>
      <ComboboxTrigger>
        <ComboboxInput placeholder="Select framework..." />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxItem value="next">Next.js</ComboboxItem>
          <ComboboxItem value="remix">Remix</ComboboxItem>
          <ComboboxItem value="astro">Astro</ComboboxItem>
          <ComboboxItem value="nuxt">Nuxt</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
    </div>
    </ComponentPreview>
  )
}
