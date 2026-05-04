"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "pixel";
  size?:    "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
}

const variantStyles = {
  primary:   "bg-[#392D2B] text-[#EEE9E3] hover:bg-[#4a3a38] px-6 py-3",
  secondary: "bg-[#EEE9E3] text-[#392D2B] border border-[#392D2B]/20 hover:bg-[#E5DED6] px-6 py-3",
  ghost:     "bg-transparent text-[#392D2B] hover:bg-[#392D2B]/5 px-4 py-2",
  pixel:     "btn-pixel",
};

const sizeStyles = {
  sm: "text-[10px] tracking-[0.08em] h-7",
  md: "text-[11px] tracking-[0.08em] h-[26px]",
  lg: "text-[12px] tracking-[0.08em] h-9",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "btn",
          variantStyles[variant],
          sizeStyles[size],
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="opacity-0 select-none">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size="sm" />
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
