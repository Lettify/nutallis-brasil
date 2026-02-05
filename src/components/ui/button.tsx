import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  asChild?: boolean;
};

const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-forest text-cream hover:bg-[#162b22] shadow-[0_16px_30px_rgba(30,58,47,0.25)]",
  outline:
    "border border-forest/30 text-forest hover:border-forest/60 hover:bg-forest/5",
  ghost: "text-forest hover:bg-forest/10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40",
        styles[variant],
        className
      )}
      {...props}
      />
    );
  }
);

Button.displayName = "Button";
