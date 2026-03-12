"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type GalleryPhoto = {
  id: string;
  title: string | null;
  image_url: string;
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<null | {
    src: string;
    title: string;
  }>(null);

  useEffect(() => {
    async function loadPhotos() {
      const res = await fetch("/api/gallery/list", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      setPhotos(data.rows || []);
      setLoading(false);
    }

    loadPhotos();
  }, []);

  return (
    <main>
      <PageHero
        title="Gallery"
        subtitle="Moments from our services and gatherings."
        image="/images/gallery.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {loading ? (
            <div className="grid place-items-center rounded-2xl border bg-slate-50 p-16 text-center">
              <p className="text-slate-600">Loading gallery...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border bg-slate-50 p-16 text-center">
              <p className="text-slate-600">No gallery images available yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {photos.map((photo) => (
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
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Church gallery"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-medium text-slate-700">
                      {photo.title || "Church Gallery Photo"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

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
    </main>
  );
}