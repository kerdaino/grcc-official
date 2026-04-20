import PageHero from "@/components/PageHero";
import { supabaseServer } from "@/lib/supabaseServer";
import GalleryClient from "./GalleryClient";

export const revalidate = 300;

export type GalleryPhoto = {
  id: string;
  title: string | null;
  image_url: string;
};

export default async function GalleryPage() {
  const { data, error } = await supabaseServer
    .from("gallery")
    .select("id, title, image_url")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const photos: GalleryPhoto[] = error ? [] : data || [];

  return (
    <main>
      <PageHero
        title="Gallery"
        subtitle="Moments from our services and gatherings."
        image="/images/gallery.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <GalleryClient photos={photos} />
        </div>
      </section>
    </main>
  );
}
