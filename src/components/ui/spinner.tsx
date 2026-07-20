import * as React from "react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-3 w-3",
  default: "h-4 w-4",
  lg: "h-6 w-6",
} as const;

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: keyof typeof sizeClasses;
}

const Spinner = ({ className, size = "default", ...props }: SpinnerProps) => (
  <svg
    className={cn("animate-spin text-current", sizeClasses[size], className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
    />
  </svg>
);

export { Spinner };
