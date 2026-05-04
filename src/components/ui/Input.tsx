"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] uppercase tracking-[0.1em] font-medium text-[#392D2B]/60 font-sans"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border-b border-[#392D2B]/20 py-2.5 text-[14px] text-[#392D2B]",
            "placeholder:text-[#392D2B]/30 font-sans",
            "transition-[border-color] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            "focus:outline-none focus:border-[#392D2B]",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-red-500 font-sans">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-[#392D2B]/40 font-sans">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:     string;
  error?:     string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] uppercase tracking-[0.1em] font-medium text-[#392D2B]/60 font-sans"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            "w-full bg-transparent border-b border-[#392D2B]/20 py-2.5 text-[14px] text-[#392D2B]",
            "placeholder:text-[#392D2B]/30 font-sans resize-none",
            "transition-[border-color] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            "focus:outline-none focus:border-[#392D2B]",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-red-500 font-sans">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-[#392D2B]/40 font-sans">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
