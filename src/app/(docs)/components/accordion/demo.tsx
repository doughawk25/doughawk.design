"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { ComponentPreview } from "@/components/docs/component-preview"

export function AccordionDemo() {
  return (
    <ComponentPreview
      name="Accordion"
      description="Vertically stacked set of interactive headings that reveal content."
      showBgToggle={false}
      code={`<Accordion className="w-full">
  <AccordionItem>
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes.</AccordionContent>
  </AccordionItem>
</Accordion>`}
    >
      <Accordion className="w-full max-w-md">
      <AccordionItem>
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default styles via Tailwind CSS.</AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It uses CSS animations by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
    </ComponentPreview>
  )
}
