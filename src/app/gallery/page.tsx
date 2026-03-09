"use client";

import PageHero from "@/components/PageHero";
import Image from "next/image";
import { useState } from "react";

// TEMP FRONTEND DATA
// Later this can come from Supabase database/storage
const photos = [
  {
    src: "/images/gallery1.jpg",
    title: "Church Service Moment",
  },
  {
    src: "/images/gallery2.jpg",
    title: "Church Service Moment",
  },
  {
    src: "/images/gallery3.jpg",
    title: "Church Service Moment",
  },
  {
    src: "/images/gallery4.jpg",
    title: "Church Service Moment",
  },
  {
    src: "/images/gallery5.jpg",
    title: "Church Service Moment",
  },
  {
    src: "/images/gallery6.jpg",
    title: "Church Service Moment",
  },
];

export default function GalleryPage() {
  const [activeImage, setActiveImage] = useState<null | {
    src: string;
    title: string;
  }>(null);

  return (
    <main>
      <PageHero
        title="Gallery"
        subtitle="Moments from our services and gatherings."
        image="/images/gallery.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {photos.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border bg-slate-50 p-16 text-center">
              <p className="text-slate-600">No gallery images available yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {photos.map((photo) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setActiveImage(photo)}
                  className="group overflow-hidden rounded-2xl border bg-slate-50 shadow-sm text-left hover:shadow-md transition"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Caption */}
                  <div className="p-4">
                    <p className="text-sm font-medium text-slate-700">
                      {photo.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* POPUP MODAL */}
      {activeImage ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4">
          {/* Close when background is clicked */}
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setActiveImage(null)}
            aria-label="Close gallery image"
          />

          <div className="relative z-10 w-full max-w-5xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              ✕
            </button>

            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="relative w-full bg-black">
                <div className="relative h-[70vh] w-full">
                  <Image
                    src={activeImage.src}
                    alt={activeImage.title}
                    fill
                    className="object-contain"
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
    </main>
  );
}