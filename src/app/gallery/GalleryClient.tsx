"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryPhoto } from "./page";

const INITIAL_PHOTO_COUNT = 9;
const LOAD_MORE_COUNT = 12;

function GalleryCardImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      ) : null}

      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        quality={70}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default function GalleryClient({ photos }: { photos: GalleryPhoto[] }) {
  const [activeImage, setActiveImage] = useState<null | {
    src: string;
    title: string;
  }>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PHOTO_COUNT);
  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <>
      {photos.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border bg-slate-50 p-16 text-center">
          <p className="text-slate-600">No gallery images available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {visiblePhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() =>
                  setActiveImage({
                    src: photo.image_url,
                    title: photo.title || "Church Gallery Photo",
                  })
                }
                className="group overflow-hidden rounded-2xl border bg-slate-50 text-left shadow-sm transition hover:shadow-md"
              >
                <GalleryCardImage
                  src={photo.image_url}
                  alt={photo.title || "Church gallery"}
                  priority={index < 3}
                />

                <div className="p-4">
                  <p className="text-sm font-medium text-slate-700">
                    {photo.title || "Church Gallery Photo"}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {visibleCount < photos.length ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + LOAD_MORE_COUNT, photos.length)
                  )
                }
                className="rounded-lg border px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Load More
              </button>
            </div>
          ) : null}
        </>
      )}

      {activeImage ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setActiveImage(null)}
            aria-label="Close gallery image"
          />

          <div className="relative z-10 w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              ✕
            </button>

            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="w-full bg-black">
                <div className="h-[70vh] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage.src}
                    alt={activeImage.title}
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="border-t bg-white px-5 py-4">
                <p className="font-semibold text-slate-900">
                  {activeImage.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
