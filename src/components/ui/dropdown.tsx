"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
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
  direction?: "down" | "up";
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
  direction = "down",
  icon,
  disabled = false,
  highlightSelected = false,
  defaultValue = "all",
  fullWidth = false,
  size = "sm",
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = React.useCallback(() => {
    const trigger = dropdownRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 100,
      minWidth: rect.width,
      maxWidth: Math.max(rect.width, 420),
    };

    if (fullWidth) {
      style.width = rect.width;
      style.maxWidth = rect.width;
    }

    if (direction === "up") {
      style.bottom = window.innerHeight - rect.top + gap;
    } else {
      style.top = rect.bottom + gap;
    }

    if (align === "right") {
      style.right = window.innerWidth - rect.right;
      style.left = "auto";
    } else {
      style.left = rect.left;
      style.right = "auto";
    }

    setMenuStyle(style);
  }, [align, direction, fullWidth]);

  React.useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = dropdownRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inTrigger && !inMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || value);
  const isActive = highlightSelected && value !== defaultValue;

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-3.5 py-2.5 text-xs rounded-xl",
    lg: "px-4 py-2.5 text-sm rounded-xl",
  };

  const menu = isOpen && mounted
    ? createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className={cn(
            "bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-72 overflow-y-auto",
            !fullWidth && "w-max",
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
                {isSelected && <CheckIcon weight="bold" className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

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
          "border transition-all cursor-pointer flex items-center justify-between gap-1.5 shadow-2xs bg-white text-slate-800 hover:bg-slate-50/80 select-none whitespace-nowrap",
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          isOpen
            ? "border-[#B5111B] ring-2 ring-[#B5111B]/15 text-slate-900 font-medium"
            : isActive
            ? "border-[#B5111B] text-[#B5111B] ring-1 ring-[#B5111B]/20 bg-red-50/20 font-bold"
            : "border-slate-200 text-slate-800 hover:border-slate-300 font-medium",
          disabled && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          <span className="truncate">{displayLabel}</span>
        </div>
        <CaretDownIcon
          weight="bold"
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5",
            isOpen && "rotate-180 text-slate-600"
          )}
        />
      </button>

      {menu}
    </div>
  );
}
