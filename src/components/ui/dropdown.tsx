"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  title?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  icon?: React.ReactNode;
  disabled?: boolean;
  highlightSelected?: boolean;
  defaultValue?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Dropdown({
  value,
  onChange,
  options,
  title,
  placeholder,
  className,
  buttonClassName,
  menuClassName,
  align = "left",
  icon,
  disabled = false,
  highlightSelected = true,
  defaultValue = "all",
  fullWidth = false,
  size = "sm",
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || value);
  const isActive = highlightSelected && value !== defaultValue;

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-3.5 py-2 text-xs rounded-xl",
    lg: "px-4 py-2.5 text-sm rounded-xl",
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "relative text-left",
        fullWidth ? "w-full block" : "inline-block",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "font-bold border transition-all cursor-pointer flex items-center justify-between gap-1.5 shadow-2xs bg-white text-slate-800 hover:bg-slate-50 select-none whitespace-nowrap",
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          (isOpen || isActive)
            ? "border-[#B5111B] text-[#B5111B] ring-2 ring-[#B5111B]/20 bg-red-50/30 font-extrabold"
            : "border-slate-200 text-slate-700",
          disabled && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5",
            isOpen && "rotate-180 text-[#B5111B]"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-72 overflow-y-auto",
            fullWidth
              ? "w-full left-0 right-0 min-w-full"
              : align === "right"
              ? "right-0 min-w-full w-max max-w-[420px]"
              : "left-0 min-w-full w-max max-w-[420px]",
            menuClassName
          )}
        >
          {title && (
            <div className="px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 select-none whitespace-nowrap">
              {title}
            </div>
          )}

          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer select-none whitespace-nowrap gap-4",
                  isSelected
                    ? "bg-[#B5111B] text-white shadow-xs font-extrabold"
                    : "text-slate-700 hover:bg-red-50 hover:text-[#B5111B]",
                  option.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-400"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className={cn("shrink-0", isSelected ? "text-white" : "text-slate-400")}>
                      {option.icon}
                    </span>
                  )}
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
