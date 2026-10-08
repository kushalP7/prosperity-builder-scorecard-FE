"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  className?: string;
  name?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      checked = false,
      onCheckedChange,
      onChange,
      disabled = false,
      label,
      description,
      className,
      name,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-2.5 cursor-pointer select-none group",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={cn(
              "w-4.5 h-4.5 rounded-md border transition-all duration-200 flex items-center justify-center shadow-2xs",
              checked
                ? "bg-[#B5111B] border-[#B5111B] text-white shadow-xs ring-2 ring-[#B5111B]/20"
                : "bg-white border-slate-300 group-hover:border-[#B5111B]/70 group-hover:bg-rose-50/20",
              disabled && "cursor-not-allowed bg-slate-100 border-slate-200"
            )}
          >
            <Check
              className={cn(
                "w-3 h-3 stroke-[3] transition-transform duration-200",
                checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="text-left">
            {label && (
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 leading-none block">
                {label}
              </span>
            )}
            {description && (
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
