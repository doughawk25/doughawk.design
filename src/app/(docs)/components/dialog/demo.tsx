"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ComponentPreview } from "@/components/docs/component-preview"

export function DialogDemo() {
  
  return (
    <ComponentPreview
      name="Dialog"
      description="A window overlaid on the primary content, rendering content on top."
      showBgToggle={false}
      code={`<Dialog>
  <DialogTrigger render={<Button />}>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
    >
      <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit Profile</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" defaultValue="Doug Hawk" className="col-span-3" />
          </div>
        </div>
        <DialogFooter><Button type="submit">Save changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    </ComponentPreview>
  )
}
