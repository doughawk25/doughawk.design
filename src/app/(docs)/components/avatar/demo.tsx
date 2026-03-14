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

const avatarSizes = [
  { size: "sm" as const, label: "Small", dimensions: "24px" },
  { size: "default" as const, label: "Default", dimensions: "32px" },
  { size: "lg" as const, label: "Large", dimensions: "40px" },
]

export function AvatarDemo() {
  return (
    <>
      <ComponentPreview
        name="Avatar"
        description="An image element with a fallback for representing the user."
        showBgToggle={false}
        code={`<Avatar>
  <AvatarImage src="/example-bg.png" className="object-top" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
<Avatar>
  <AvatarFallback variant="blue">DH</AvatarFallback>
</Avatar>`}
      >
        <div className="flex flex-wrap gap-4">
          <Avatar>
            <AvatarImage src="/example-bg.png" alt="User" className="object-top" />
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
      <ComponentPreview
        name="Sizes"
        description="Built-in sizes: sm (24px), default (32px), lg (40px)."
        showBgToggle={false}
        code={`<Avatar size="sm">
  <AvatarImage src="/example-bg.png" className="object-top" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
<Avatar>
  <AvatarImage src="/example-bg.png" className="object-top" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
<Avatar size="lg">
  <AvatarImage src="/example-bg.png" className="object-top" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
      >
        <div className="flex flex-wrap items-end gap-6">
          {avatarSizes.map(({ size, label, dimensions }) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Avatar size={size}>
                <AvatarImage src="/example-bg.png" alt="User" className="object-top" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {label}
                <br />
                {dimensions}
              </span>
            </div>
          ))}
        </div>
      </ComponentPreview>
    </>
  )
}
