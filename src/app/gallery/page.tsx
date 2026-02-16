import PageHero from "@/components/PageHero";
import Image from "next/image";

// FRONTEND ONLY: replace with real images later
const photos = [
  "/images/gallery1.jpg",
  "/images/gallery2.jpg",
  "/images/gallery3.jpg",
  "/images/gallery4.jpg",
  "/images/gallery5.jpg",
  "/images/gallery6.jpg",
];

export default function GalleryPage() {
  return (
    <main>
      <PageHero title="Gallery" subtitle="Moments from our services and gatherings." />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((src) => (
              <div
                key={src}
                className="group overflow-hidden rounded-2xl border bg-slate-50 shadow-sm"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={src}
                    alt="Church gallery"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <p className="text-sm text-slate-600">
                    Church Gallery Photo
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* If no images yet, comment out above and use this block:
          <div className="grid place-items-center rounded-2xl border bg-slate-50 p-16 text-center">
            <p className="text-slate-600">No gallery images available yet.</p>
          </div>
          */}
        </div>
      </section>
    </main>
  );
}
