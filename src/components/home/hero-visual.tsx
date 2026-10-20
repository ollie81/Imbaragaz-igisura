import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export type HeroImage = { src: string; alt: string; width: number; height: number };

/**
 * Hero artwork. Until real photography of the shop or products is provided,
 * this renders an abstract botanical composition (pure SVG, no image download).
 * Pass `image` (e.g. from the site-media bucket) to show a real photo inside
 * the same arch frame.
 */
export function HeroVisual({ image, className }: { image?: HeroImage; className?: string }) {
  if (image) {
    return (
      <div className={cn("relative mx-auto aspect-[44/50] w-full max-w-md", className)}>
        <div className="absolute inset-[6%_10%_0] overflow-hidden rounded-t-full bg-leaf-100 shadow-lift">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 420px, 80vw"
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 440 500"
      className={cn("mx-auto h-auto w-full max-w-md", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Soft organic backdrop */}
      <path
        d="M58 128C92 44 204 8 304 40c92 29 138 112 128 212-10 110-92 206-212 226C104 497 22 420 11 312 2 232 34 186 58 128z"
        className="fill-leaf-100"
      />
      {/* Morning sun */}
      <circle cx="334" cy="112" r="64" className="fill-gold-200" />
      <circle cx="334" cy="112" r="44" className="fill-gold-300" />

      {/* Arch with outline */}
      <path
        d="M94 472V232a126 126 0 0 1 252 0v240"
        fill="none"
        strokeWidth="2"
        strokeDasharray="2 8"
        strokeLinecap="round"
        className="stroke-gold-500"
      />
      <path d="M112 472V232a108 108 0 0 1 216 0v240z" className="fill-leaf-700" />

      {/* Plant */}
      <g>
        <path
          d="M220 472c-3-66 8-138 2-218"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-leaf-300"
        />
        <path d="M222 302c18-28 50-36 74-26-11 25-44 38-74 26z" className="fill-leaf-400" />
        <path d="M221 342c-21-24-55-28-75-15 13 22 46 32 75 15z" className="fill-leaf-500" />
        <path d="M221 388c21-20 55-22 73-8-13 20-46 27-73 8z" className="fill-leaf-400" />
        <path d="M220 430c-20-17-50-17-67-5 13 18 43 23 67 5z" className="fill-leaf-500" />
        <path d="M223 262c-11-19-6-38 4-48 10 13 10 33-4 48z" className="fill-gold-300" />
        <path d="M223 262c12-15 30-17 40-11-7 14-24 19-40 11z" className="fill-gold-400" />
      </g>

      {/* Ground */}
      <path d="M84 472h272" strokeWidth="3" strokeLinecap="round" className="stroke-leaf-900" />

      {/* Drifting leaves */}
      <path d="M58 250c10-24 32-34 52-30-6 22-28 34-52 30z" className="fill-leaf-500" />
      <path
        d="M58 250c14-8 30-16 52-30"
        fill="none"
        strokeWidth="1.5"
        className="stroke-leaf-100"
      />
      <path d="M372 300c-4-22 8-40 26-46 4 20-8 38-26 46z" className="fill-gold-400" />
      <path d="M380 210c-2-14 6-26 18-30 2 13-5 25-18 30z" className="fill-leaf-400" />

      {/* Seeds */}
      <circle cx="96" cy="176" r="5" className="fill-gold-400" />
      <circle cx="120" cy="150" r="3" className="fill-gold-300" />
      <circle cx="388" cy="372" r="4" className="fill-leaf-300" />
      <circle cx="44" cy="356" r="3.5" className="fill-gold-300" />
    </svg>
  );
}
