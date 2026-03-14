"use client"

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

import { ComponentPreview } from "@/components/docs/component-preview"

export function DrawerDemo() {
  return (
    <ComponentPreview
      name="Drawer"
      description="A panel that slides in from the edge of the screen."
      showBgToggle={false}
      code={`<Drawer>
  <DrawerTrigger asChild><Button>Open</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader><DrawerTitle>Title</DrawerTitle></DrawerHeader>
    <DrawerFooter><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
  </DrawerContent>
</Drawer>`}
    >
      <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Open Drawer</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>This is a drawer description.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4"><p className="text-sm text-muted-foreground">Drawer content goes here.</p></div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    </ComponentPreview>
  )
}
