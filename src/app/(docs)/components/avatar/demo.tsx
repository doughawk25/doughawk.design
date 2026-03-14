"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { TintVariant } from "@/components/ui/avatar"

import { ComponentPreview } from "@/components/docs/component-preview"

const tintVariants: TintVariant[] = [
  "neutral",
  "blue",
  "green",
  "amber",
  "red",
  "violet",
]

export function AvatarDemo() {
  return (
    <ComponentPreview
      name="Avatar"
      description="An image element with a fallback for representing the user."
      code={`<Avatar>
  <AvatarImage src="/avatar-fill.png" className="object-top" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
<Avatar>
  <AvatarFallback variant="blue">DH</AvatarFallback>
</Avatar>`}
    >
      <div className="flex flex-wrap gap-4">
        <Avatar>
          <AvatarImage src="/avatar-fill.png" alt="User" className="object-top" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        {tintVariants.map((variant) => (
          <Avatar key={variant}>
            <AvatarFallback variant={variant}>
              {variant.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </ComponentPreview>
  )
}
