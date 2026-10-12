"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { PRODUCT_IMAGE_RULES, PRODUCT_IMAGES_BUCKET } from "@/lib/products/images";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";
import {
  deleteImageAction,
  discardUploadedImageAction,
  registerProductImageAction,
  saveImageAltAction,
  setPrimaryImageAction,
} from "@/server/admin/product-actions";
import { idleState } from "@/server/admin/form";

import { FormMessage, inputClass, SubmitButton } from "./fields";

export type ImageValues = {
  id: string;
  url: string;
  isPrimary: boolean;
  alts: Partial<Record<string, string>>;
};

type UploadStatus = "processing" | "uploading" | "done" | "error";
type UploadItem = {
  key: string;
  name: string;
  preview: string;
  status: UploadStatus;
  error?: string;
};

const MB = 1024 * 1024;

/**
 * Resizes a photo in the browser before upload: at most 1600px on the longest
 * edge, re-encoded as WebP (JPEG fallback). This keeps pages fast on mobile
 * data and removes hidden metadata such as the GPS location of the camera.
 */
async function preparePhoto(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(
    1,
    PRODUCT_IMAGE_RULES.maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob) throw new Error("encode");

  return { blob, width, height, extension: blob.type === "image/webp" ? "webp" : "jpg" };
}

function Uploader({ productId }: { productId: string }) {
  const t = useTranslations("admin.images");
  const router = useRouter();
  const inputId = useId();
  const [items, setItems] = useState<UploadItem[]>([]);
  const busy = items.some((i) => i.status === "processing" || i.status === "uploading");

  // Free preview memory when the list is replaced or the page closes.
  const previews = useRef<string[]>([]);
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const update = (key: string, patch: Partial<UploadItem>) =>
    setItems((list) => list.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const queue = Array.from(files).map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      return {
        file,
        item: { key: crypto.randomUUID(), name: file.name, preview, status: "processing" as const },
      };
    });
    setItems((list) => [...queue.map((q) => q.item), ...list]);

    const supabase = createSupabaseBrowserClient();
    // One at a time: gentle on phone memory and slow connections.
    for (const { file, item } of queue) {
      if (!(PRODUCT_IMAGE_RULES.acceptedInputTypes as readonly string[]).includes(file.type)) {
        update(item.key, { status: "error", error: t("errors.type") });
        continue;
      }
      if (file.size > PRODUCT_IMAGE_RULES.maxInputBytes) {
        update(item.key, {
          status: "error",
          error: t("errors.inputSize", { max: PRODUCT_IMAGE_RULES.maxInputBytes / MB }),
        });
        continue;
      }

      let photo: Awaited<ReturnType<typeof preparePhoto>>;
      try {
        photo = await preparePhoto(file);
        if (photo.blob.size > PRODUCT_IMAGE_RULES.maxUploadBytes) throw new Error("size");
      } catch {
        update(item.key, { status: "error", error: t("errors.process") });
        continue;
      }

      update(item.key, { status: "uploading" });
      const path = `${productId}/${crypto.randomUUID()}.${photo.extension}`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, photo.blob, {
          contentType: photo.blob.type,
          cacheControl: "31536000",
          upsert: false,
        });
      if (uploadError) {
        update(item.key, { status: "error", error: t("errors.upload") });
        continue;
      }

      const result = await registerProductImageAction({
        productId,
        storagePath: path,
        width: photo.width,
        height: photo.height,
      }).catch(() => null);
      if (!result || result.status === "error") {
        await discardUploadedImageAction(path).catch(() => undefined);
        update(item.key, { status: "error", error: t("errors.save") });
        continue;
      }
      update(item.key, { status: "done" });
    }
    router.refresh();
  }

  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept={PRODUCT_IMAGE_RULES.acceptedInputTypes.join(",")}
        multiple
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          void handleFiles(event.target.files);
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
        {t("choose")}
      </label>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a file not yet uploaded */}
              <img src={item.preview} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{item.name}</p>
                <p
                  className={cn(
                    item.status === "error" && "text-red-700",
                    item.status === "done" && "text-leaf-700",
                    (item.status === "processing" || item.status === "uploading") &&
                      "text-muted-foreground",
                  )}
                >
                  {item.status === "error" ? item.error : t(item.status)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImageCard({ productId, image }: { productId: string; image: ImageValues }) {
  const t = useTranslations("admin");
  const [state, action] = useActionState(saveImageAltAction, idleState);

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="relative aspect-square bg-leaf-50">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail; no optimisation needed */}
        <img src={image.url} alt="" loading="lazy" className="size-full object-cover" />
        {image.isPrimary && (
          <span className="absolute top-2 left-2 rounded-full bg-gold-300 px-2.5 py-1 text-xs font-semibold text-leaf-950">
            {t("images.primary")}
          </span>
        )}
      </div>
      <div className="space-y-3 p-3">
        <form action={action} className="space-y-2">
          <input type="hidden" name="id" value={image.id} />
          {(["rw", "en"] as const).map((l) => (
            <div key={l}>
              <label htmlFor={`alt-${image.id}-${l}`} className="mb-1 block text-xs font-semibold">
                {t("images.altLabel", { language: t(`productForm.language.${l}`) })}
              </label>
              <input
                id={`alt-${image.id}-${l}`}
                name={`alt_${l}`}
                lang={l}
                defaultValue={image.alts[l] ?? ""}
                maxLength={300}
                className={inputClass}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">{t("images.altHelp")}</p>
          <FormMessage state={state} />
          <SubmitButton label={t("images.save")} variant="outline" className="w-full" />
        </form>
        <div className="flex gap-2">
          {!image.isPrimary && (
            <form action={setPrimaryImageAction} className="flex-1">
              <input type="hidden" name="id" value={image.id} />
              <input type="hidden" name="product_id" value={productId} />
              <SubmitButton label={t("images.makePrimary")} variant="ghost" className="w-full" />
            </form>
          )}
          <form action={deleteImageAction} className={image.isPrimary ? "flex-1" : ""}>
            <input type="hidden" name="id" value={image.id} />
            <SubmitButton
              label={t("images.delete")}
              variant="ghost"
              confirm={t("images.deleteConfirm")}
              className="w-full text-red-700"
            />
          </form>
        </div>
      </div>
    </li>
  );
}

export function ImageManager({ productId, images }: { productId: string; images: ImageValues[] }) {
  const t = useTranslations("admin.images");

  return (
    <section className="rounded-card border border-border bg-muted/50 p-5 sm:p-6">
      <h2 className="font-sans text-lg font-semibold text-leaf-900">{t("title")}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{t("intro")}</p>
      <Uploader productId={productId} />
      {images.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <ImageCard key={image.id} productId={productId} image={image} />
          ))}
        </ul>
      )}
    </section>
  );
}
