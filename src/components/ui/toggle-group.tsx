import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/65 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-[color,background-color,border-color] hover:border-primary/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=on]:border-primary/35 data-[state=on]:bg-primary/14 data-[state=on]:text-[var(--accent-strong)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "min-h-10",
        sm: "min-h-9 px-2.5 py-1.5 text-[0.62rem]",
        lg: "min-h-11 px-4 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function ToggleGroup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleGroupItemVariants({ size }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
