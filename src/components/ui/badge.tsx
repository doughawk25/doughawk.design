import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "border-transparent hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
        neutral: "border-tint-neutral-border bg-tint-neutral text-tint-neutral-fg",
        zinc: "border-tint-zinc-border bg-tint-zinc text-tint-zinc-fg",
        slate: "border-tint-slate-border bg-tint-slate text-tint-slate-fg",
        stone: "border-tint-stone-border bg-tint-stone text-tint-stone-fg",
        gray: "border-tint-gray-border bg-tint-gray text-tint-gray-fg",
        red: "border-tint-red-border bg-tint-red text-tint-red-fg",
        orange: "border-tint-orange-border bg-tint-orange text-tint-orange-fg",
        amber: "border-tint-amber-border bg-tint-amber text-tint-amber-fg",
        yellow: "border-tint-yellow-border bg-tint-yellow text-tint-yellow-fg",
        green: "border-tint-green-border bg-tint-green text-tint-green-fg",
        teal: "border-tint-teal-border bg-tint-teal text-tint-teal-fg",
        cyan: "border-tint-cyan-border bg-tint-cyan text-tint-cyan-fg",
        blue: "border-tint-blue-border bg-tint-blue text-tint-blue-fg",
        indigo: "border-tint-indigo-border bg-tint-indigo text-tint-indigo-fg",
        violet: "border-tint-violet-border bg-tint-violet text-tint-violet-fg",
        purple: "border-tint-purple-border bg-tint-purple text-tint-purple-fg",
        pink: "border-tint-pink-border bg-tint-pink text-tint-pink-fg",
        rose: "border-tint-rose-border bg-tint-rose text-tint-rose-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
