"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useActionState, useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { preparePhoto } from "@/lib/images/prepare-photo";
import { PRODUCT_IMAGE_RULES } from "@/lib/products/images";
import { SITE_MEDIA_BUCKET } from "@/lib/site-media";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";
import { idleState } from "@/server/admin/form";
import {
  addLocationPhotoAction,
  deleteLocationPhotoAction,
  discardLocationPhotoUploadAction,
  moveLocationPhotoAction,
  saveLocationPhotoCaptionsAction,
} from "@/server/admin/site-actions";

import { Field, FormMessage, inputClass, SubmitButton } from "./fields";

export type LocationPhotoValues = {
  id: string;
  url: string;
  captions: Partial<Record<string, string>>;
};

const CONTENT_LOCALES = ["rw", "en"] as const;

type Status = { tone: "info" | "error" | "success"; text: string } | null;

/** Upload, caption, reorder and delete the "How to find us" photos. */
export function LocationPhotosManager({ photos }: { photos: LocationPhotoValues[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    let added = 0;
    let failed = 0;
    try {
      // One at a time: gentle on phone memory and slow connections.
      for (const [index, file] of Array.from(files).entries()) {
        setStatus({
          tone: "info",
          text: t("locationPhotos.progress", { current: index + 1, total: files.length }),
        });
        if (
          !(PRODUCT_IMAGE_RULES.acceptedInputTypes as readonly string[]).includes(file.type) ||
          file.size > PRODUCT_IMAGE_RULES.maxInputBytes
        ) {
          failed++;
          continue;
        }
        try {
          const photo = await preparePhoto(file, PRODUCT_IMAGE_RULES.maxDimension);
          if (photo.blob.size > PRODUCT_IMAGE_RULES.maxUploadBytes) throw new Error("size");
          const path = `location/${crypto.randomUUID()}.${photo.extension}`;
          const { error } = await supabase.storage
            .from(SITE_MEDIA_BUCKET)
            .upload(path, photo.blob, {
              contentType: photo.blob.type,
              cacheControl: "31536000",
              upsert: false,
            });
          if (error) throw new Error("upload");
          const result = await addLocationPhotoAction({
            storagePath: path,
            width: photo.width,
            height: photo.height,
          }).catch(() => null);
          if (!result || result.status === "error") {
            await discardLocationPhotoUploadAction(path).catch(() => undefined);
            throw new Error("save");
          }
          added++;
        } catch {
          failed++;
        }
      }
    } finally {
      setBusy(false);
    }
    setStatus(
      failed > 0
        ? { tone: "error", text: t("locationPhotos.someFailed", { added, failed }) }
        : { tone: "success", text: t("locationPhotos.added", { count: added }) },
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <input
          id={inputId}
          type="file"
          multiple
          accept={PRODUCT_IMAGE_RULES.acceptedInputTypes.join(",")}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            void upload(event.target.files);
            event.target.value = "";
          }}
        />
        <label
          htmlFor={inputId}
          aria-disabled={busy}
          className={buttonStyles({
            variant: "accent",
            className: cn("cursor-pointer", busy && "pointer-events-none opacity-60"),
          })}
        >
          {t("locationPhotos.choose")}
        </label>
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mt-3 text-sm empty:hidden",
            status?.tone === "error" && "text-red-800",
            status?.tone === "success" && "text-leaf-700",
            status?.tone === "info" && "text-muted-foreground",
          )}
        >
          {status?.text}
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="text-muted-foreground">{t("locationPhotos.empty")}</p>
      ) : (
        <ol className="space-y-4">
          {photos.map((photo, index) => (
            <PhotoRow
              key={photo.id}
              photo={photo}
              number={index + 1}
              isFirst={index === 0}
              isLast={index === photos.length - 1}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function PhotoRow({
  photo,
  number,
  isFirst,
  isLast,
}: {
  photo: LocationPhotoValues;
  number: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const t = useTranslations("admin");
  const [state, action] = useActionState(saveLocationPhotoCaptionsAction, idleState);

  return (
    <li className="rounded-card border border-border bg-background p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a stored photo */}
          <img
            src={photo.url}
            alt=""
            className="aspect-[4/3] w-full rounded-xl bg-muted object-cover"
          />
          <span className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-leaf-900 text-sm font-bold text-white">
            {number}
          </span>
        </div>

        <form action={action} className="space-y-3">
          <input type="hidden" name="id" value={photo.id} />
          {CONTENT_LOCALES.map((l) => (
            <Field
              key={l}
              id={`caption_${l}_${photo.id}`}
              label={`${t("locationPhotos.caption")} (${t(`productForm.language.${l}`)})`}
            >
              <input
                id={`caption_${l}_${photo.id}`}
                name={`caption_${l}`}
                lang={l}
                defaultValue={photo.captions[l] ?? ""}
                maxLength={200}
                placeholder={t(`locationPhotos.captionExample.${l}`)}
                className={inputClass}
              />
            </Field>
          ))}
          <FormMessage state={state} />
          <SubmitButton label={t("images.save")} pendingLabel={t("productForm.saving")} />
        </form>
      </div>

      {/* Separate forms: a named submit button inside an action form would
          replace the identifier React uses to route the submission. */}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-1 border-t border-border pt-3">
        {(["up", "down"] as const).map((direction) => (
          <form key={direction} action={moveLocationPhotoAction}>
            <input type="hidden" name="id" value={photo.id} />
            <input type="hidden" name="direction" value={direction} />
            <button
              type="submit"
              disabled={direction === "up" ? isFirst : isLast}
              aria-label={t(direction === "up" ? "categories.moveUp" : "categories.moveDown")}
              title={t(direction === "up" ? "categories.moveUp" : "categories.moveDown")}
              className={buttonStyles({ variant: "ghost", className: "px-3" })}
            >
              {direction === "up" ? "↑" : "↓"}
            </button>
          </form>
        ))}
        <form action={deleteLocationPhotoAction}>
          <input type="hidden" name="id" value={photo.id} />
          <SubmitButton
            label={t("images.delete")}
            variant="ghost"
            confirm={t("images.deleteConfirm")}
            className="text-red-800"
          />
        </form>
      </div>
    </li>
  );
}
