// This is the homepage. We assemble all sections here.

import {
  HeroSection,
  WhoWeAreSection,
  SupportMissionSection,
  VerseOfDaySection,
  PlaceholderBlock,
} from "@/components/Sections";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <WhoWeAreSection />
      <SupportMissionSection />
      <VerseOfDaySection />

      <PlaceholderBlock
        title="Upcoming Events"
        emptyText="No upcoming events at the moment. Check back soon for updates!"
        viewAllHref="/events"
      />

      <PlaceholderBlock
        title="Latest Sermons"
        emptyText="No sermons available yet. Please check back later."
        viewAllHref="/sermons"
      />

      <PlaceholderBlock
        title="Recent Blog Posts"
        emptyText="No blog posts available yet."
        viewAllHref="/blog"
      />
    </main>
  );
}
