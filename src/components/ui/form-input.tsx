"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  required,
  className,
  id,
  ...props
}: FormInputProps) {
  const inputId = id || React.useId();

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={inputId}
        {...props}
        className={cn(
          "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl transition focus:outline-none text-slate-900",
          error
            ? "bg-red-50/20 border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
            : "bg-white border border-slate-200 focus:border-[#B5111B] focus:ring-1 focus:ring-[#B5111B]/20",
          className
        )}
      />
      {error && (
        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
