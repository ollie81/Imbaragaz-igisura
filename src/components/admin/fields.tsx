"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { buttonStyles, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { FormState } from "@/server/admin/form";

export const inputClass =
  "block min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-leaf-500 focus:outline-none aria-[invalid=true]:border-red-600";

export const textareaClass = cn(inputClass, "min-h-24 leading-relaxed");

type FieldProps = {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

/** Label + control + help text + error, wired up for screen readers. */
export function Field({ id, label, help, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-leaf-900">
        {label}
      </label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Translates a field error key from a FormState, if any. */
export function useFieldError(state: FormState) {
  const t = useTranslations("admin");
  return (name: string) => {
    const key = state.fieldErrors?.[name];
    return key ? t(key as never, state.values as never) : undefined;
  };
}

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  className?: string;
  confirm?: string;
  name?: string;
  value?: string;
  /** Pending state for forms submitted with onSubmit (useFormStatus only sees `action` forms). */
  pending?: boolean;
};

/** Submit button that disables itself while the form is being saved. */
export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  className,
  confirm,
  name,
  value,
  pending: pendingProp,
}: SubmitButtonProps) {
  const pending = useFormStatus().pending || Boolean(pendingProp);
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-disabled={pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      className={buttonStyles({ variant, className })}
    >
      {pending ? (pendingLabel ?? label) : label}
    </button>
  );
}

/** Success / error message for a form, announced to screen readers. */
export function FormMessage({ state, className }: { state: FormState; className?: string }) {
  const t = useTranslations("admin");
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status === "error") ref.current?.scrollIntoView({ block: "nearest" });
  }, [state.at, state.status]);

  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      ref={ref}
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-medium",
        state.status === "error" ? "bg-red-50 text-red-800" : "bg-leaf-50 text-leaf-800",
        className,
      )}
    >
      {t(state.message as never, state.values as never)}
    </p>
  );
}
