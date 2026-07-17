import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-2 border-black bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[transform,box-shadow] outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:not-aria-[haspopup]:translate-x-[1px] active:not-aria-[haspopup]:translate-y-[1px] active:not-aria-[haspopup]:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[2px_2px_0_#000] hover:brightness-105",
        outline:
          "border-black bg-background text-foreground shadow-[2px_2px_0_#000] hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[2px_2px_0_#000] hover:bg-neutral-200",
        ghost:
          "border-transparent shadow-none hover:bg-muted hover:text-foreground active:not-aria-[haspopup]:translate-x-0 active:not-aria-[haspopup]:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-[2px_2px_0_#000] hover:brightness-110",
        link: "border-transparent shadow-none text-foreground underline-offset-4 hover:underline active:not-aria-[haspopup]:translate-x-0 active:not-aria-[haspopup]:translate-y-0",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-[0.8rem]",
        lg: "h-12 gap-2 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
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
