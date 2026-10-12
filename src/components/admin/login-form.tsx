"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { signInAction } from "@/server/admin/auth-actions";
import { idleState } from "@/server/admin/form";

import { Field, FormMessage, inputClass, SubmitButton } from "./fields";

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("admin.login");
  const [state, action] = useActionState(signInAction, idleState);

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <FormMessage state={state} />
      <Field id="email" label={t("email")}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          className={inputClass}
        />
      </Field>
      <Field id="password" label={t("password")}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <SubmitButton label={t("submit")} pendingLabel={t("submitting")} className="w-full" />
    </form>
  );
}
