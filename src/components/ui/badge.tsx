import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "rounded-full border border-forest/20 bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest",
      className
    )}
    {...props}
  />
);
