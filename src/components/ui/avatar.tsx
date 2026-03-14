"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tintFallbackVariants = cva(
  "flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs",
  {
    variants: {
      variant: {
        neutral: "bg-tint-neutral text-tint-neutral-fg",
        zinc: "bg-tint-zinc text-tint-zinc-fg",
        slate: "bg-tint-slate text-tint-slate-fg",
        stone: "bg-tint-stone text-tint-stone-fg",
        gray: "bg-tint-gray text-tint-gray-fg",
        red: "bg-tint-red text-tint-red-fg",
        orange: "bg-tint-orange text-tint-orange-fg",
        amber: "bg-tint-amber text-tint-amber-fg",
        yellow: "bg-tint-yellow text-tint-yellow-fg",
        green: "bg-tint-green text-tint-green-fg",
        teal: "bg-tint-teal text-tint-teal-fg",
        cyan: "bg-tint-cyan text-tint-cyan-fg",
        blue: "bg-tint-blue text-tint-blue-fg",
        indigo: "bg-tint-indigo text-tint-indigo-fg",
        violet: "bg-tint-violet text-tint-violet-fg",
        purple: "bg-tint-purple text-tint-purple-fg",
        pink: "bg-tint-pink text-tint-pink-fg",
        rose: "bg-tint-rose text-tint-rose-fg",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export type TintVariant =
  | "neutral"
  | "zinc"
  | "slate"
  | "stone"
  | "gray"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "pink"
  | "rose"

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  variant = "neutral",
  ...props
}: AvatarPrimitive.Fallback.Props &
  VariantProps<typeof tintFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-variant={variant}
      className={cn(tintFallbackVariants({ variant }), className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
