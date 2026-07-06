"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const timer = setTimeout(() => setOpen(false), 2000);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div
          ref={ref}
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium rounded-md bg-foreground text-background whitespace-nowrap shadow-premium-sm animate-in",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-1.5",
            side === "left" && "right-full top-1/2 -translate-y-1/2 mr-1.5",
            side === "right" && "left-full top-1/2 -translate-y-1/2 ml-1.5"
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
