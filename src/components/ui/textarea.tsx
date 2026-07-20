import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-16 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink transition-colors",
      "placeholder:text-muted",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
