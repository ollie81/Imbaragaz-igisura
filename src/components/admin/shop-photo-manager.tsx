"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { buttonStyles } from "@/components/ui/button";
import { preparePhoto } from "@/lib/images/prepare-photo";
import { PRODUCT_IMAGE_RULES } from "@/lib/products/images";
import { SITE_MEDIA_BUCKET } from "@/lib/site-media";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";
import {
  discardShopPhotoUploadAction,
  removeShopPhotoAction,
  setShopPhotoAction,
} from "@/server/admin/site-actions";

const MB = 1024 * 1024;

type Status = { tone: "info" | "error" | "success"; text: string } | null;

/**
 * Upload, replace or remove the shop photo shown on the home page. The photo
 * is resized in the browser (which also removes GPS data), uploaded straight
 * to the site-media bucket, then recorded by a server action.
 */
export function ShopPhotoManager({ photoUrl }: { photoUrl: string | null }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [removing, startRemove] = useTransition();
  const [status, setStatus] = useState<Status>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!(PRODUCT_IMAGE_RULES.acceptedInputTypes as readonly string[]).includes(file.type)) {
      setStatus({ tone: "error", text: t("images.errors.type") });
      return;
    }
    if (file.size > PRODUCT_IMAGE_RULES.maxInputBytes) {
      setStatus({
        tone: "error",
        text: t("images.errors.inputSize", { max: PRODUCT_IMAGE_RULES.maxInputBytes / MB }),
      });
      return;
    }

    setBusy(true);
    setStatus({ tone: "info", text: t("images.processing") });
    try {
      let photo: Awaited<ReturnType<typeof preparePhoto>>;
      try {
        photo = await preparePhoto(file, PRODUCT_IMAGE_RULES.maxDimension);
        if (photo.blob.size > PRODUCT_IMAGE_RULES.maxUploadBytes) throw new Error("size");
      } catch {
        setStatus({ tone: "error", text: t("images.errors.process") });
        return;
      }

      setStatus({ tone: "info", text: t("images.uploading") });
      const path = `shop/${crypto.randomUUID()}.${photo.extension}`;
      const { error } = await createSupabaseBrowserClient()
        .storage.from(SITE_MEDIA_BUCKET)
        .upload(path, photo.blob, {
          contentType: photo.blob.type,
          cacheControl: "31536000",
          upsert: false,
        });
      if (error) {
        setStatus({ tone: "error", text: t("images.errors.upload") });
        return;
      }

      const result = await setShopPhotoAction({
        storagePath: path,
        width: photo.width,
        height: photo.height,
      }).catch(() => null);
      if (!result || result.status === "error") {
        await discardShopPhotoUploadAction(path).catch(() => undefined);
        setStatus({
          tone: "error",
          text: result?.message ? t(result.message as never) : t("images.errors.save"),
        });
        return;
      }
      setStatus({ tone: "success", text: t("shopPhoto.saved") });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-card border border-border bg-muted">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of the stored photo
          <img
            src={photoUrl}
            alt={t("shopPhoto.currentAlt")}
            className="mx-auto max-h-[28rem] w-full object-contain"
          />
        ) : (
          <p className="p-8 text-center text-muted-foreground">{t("shopPhoto.none")}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          id={inputId}
          type="file"
          accept={PRODUCT_IMAGE_RULES.acceptedInputTypes.join(",")}
          className="sr-only"
          disabled={busy || removing}
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <label
          htmlFor={inputId}
          aria-disabled={busy || removing}
          className={buttonStyles({
            variant: "accent",
            className: cn("cursor-pointer", (busy || removing) && "pointer-events-none opacity-60"),
          })}
        >
          {photoUrl ? t("shopPhoto.replace") : t("shopPhoto.choose")}
        </label>
        {photoUrl && (
          <button
            type="button"
            disabled={busy || removing}
            onClick={() => {
              if (!window.confirm(t("shopPhoto.removeConfirm"))) return;
              startRemove(async () => {
                const result = await removeShopPhotoAction().catch(() => null);
                if (!result || result.status === "error") {
                  setStatus({ tone: "error", text: t("errors.generic") });
                  return;
                }
                setStatus({ tone: "success", text: t("shopPhoto.removed") });
                router.refresh();
              });
            }}
            className={buttonStyles({ variant: "outline", className: "text-red-800" })}
          >
            {t("shopPhoto.remove")}
          </button>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          "text-sm empty:hidden",
          status?.tone === "error" && "text-red-800",
          status?.tone === "success" && "text-leaf-700",
          status?.tone === "info" && "text-muted-foreground",
        )}
      >
        {status?.text}
      </p>
    </div>
  );
}
