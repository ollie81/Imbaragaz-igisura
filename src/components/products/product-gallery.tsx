"use client";

import Image from "next/image";
import { useState } from "react";

import { LeafIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/server/products";

type ProductGalleryProps = {
  images: ProductImage[];
  labels: { photoOf: string; showPhoto: string };
};

const fill = (template: string, values: Record<string, number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));

/** Main photo with thumbnails. Only the main photo loads eagerly. */
export function ProductGallery({ images, labels }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  if (!current) {
    return (
      <div
        className="grid aspect-square place-items-center rounded-card bg-leaf-50 text-leaf-300"
        aria-hidden="true"
      >
        <LeafIcon className="size-20" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card border border-border bg-leaf-50">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
        {images.length > 1 && (
          <p className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-leaf-900">
            {fill(labels.photoOf, { index: index + 1, total: images.length })}
          </p>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={fill(labels.showPhoto, { index: i + 1 })}
                aria-pressed={i === index}
                className={cn(
                  "relative block size-18 overflow-hidden rounded-xl border-2 bg-leaf-50 transition-colors sm:size-20",
                  i === index ? "border-primary" : "border-transparent hover:border-leaf-200",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
