import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/25",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-input bg-background text-foreground hover:bg-indigo-50/70 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 dark:hover:border-indigo-800",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-indigo-600 dark:hover:text-indigo-400",
        ghost:
          "text-foreground hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400",
        link: "text-primary underline-offset-4 hover:underline",
        cyber:
          "bg-indigo-600/10 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
