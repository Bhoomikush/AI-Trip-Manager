import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[#2A4568] shadow-sm hover:shadow hover:-translate-y-0.5",
        outline:
          "border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-foreground hover:bg-muted/40",
        ghost:
          "hover:bg-muted hover:text-foreground",
        destructive:
          "bg-[#A34E36] text-white hover:bg-[#8D3B23] shadow-sm hover:shadow hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-6 text-sm tracking-wider uppercase",
        xs: "h-8 gap-1.5 px-3.5 text-xs tracking-wider uppercase",
        sm: "h-9 gap-1.5 px-4 text-xs tracking-wider uppercase",
        lg: "h-13 gap-2.5 px-8 text-base tracking-wider uppercase",
        icon: "size-11 rounded-full",
        "icon-xs":
          "size-8 rounded-full",
        "icon-sm":
          "size-9 rounded-full",
        "icon-lg": "size-13 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
