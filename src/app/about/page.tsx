import PageHero from "@/components/PageHero";

export default function AboutPage() {
  const missionPoints = [
    "Grounded in the undiluted Word of God",
    "Committed to true discipleship",
    "Passionate about missions",
    "Devoted to a lifestyle of long, fervent, and consistent prayers",
  ];

  const beliefs = [
    {
      title: "Excellence",
      text: "We pursue excellence in all things—spiritually, morally, intellectually, and in service—reflecting the excellence of God.",
      refs: "Ecclesiastes 9:10 • Philippians 1:10",
      icon: "fa-solid fa-award",
      accent: "border-l-teal-600",
    },
    {
      title: "Authority of Scripture",
      text: "We believe the Bible is the inspired, infallible Word of God and the final authority in matters of life and faith.",
      refs: "2 Timothy 3:16",
      icon: "fa-solid fa-book-bible",
      accent: "border-l-purple-600",
    },
    {
      title: "Salvation Through Christ Alone",
      text: "We believe in the death, burial, and resurrection of Jesus Christ as the only way to salvation.",
      refs: "John 14:6",
      icon: "fa-solid fa-cross",
      accent: "border-l-fuchsia-600",
    },
    {
      title: "A Life of Prayer",
      text: "We uphold prayer as a core lifestyle: long, fervent, and consistent communion with God.",
      refs: "1 Thessalonians 5:17 • Luke 18:1",
      icon: "fa-solid fa-person-praying",
      accent: "border-l-red-600",
    },
    {
      title: "Holiness & Consecration",
      text: "We pursue a lifestyle that reflects Christ, marked by integrity, purity, and obedience to God.",
      refs: "1 Peter 1:15–16",
      icon: "fa-solid fa-shield-heart",
      accent: "border-l-teal-600",
    },
    {
      title: "The Working of the Supernatural",
      text: "We believe in the empowerment of the Holy Spirit for healing, guidance, miracles, deliverance, prophetic operations, and daily Christian living.",
      refs: "Acts 1:8",
      icon: "fa-solid fa-bolt",
      accent: "border-l-purple-600",
    },
    {
      title: "Discipleship & Spiritual Growth",
      text: "We believe in raising mature Christians through intentional discipleship, mentorship, and accountability.",
      refs: "Mark 3:14",
      icon: "fa-solid fa-people-group",
      accent: "border-l-fuchsia-600",
    },
    {
      title: "Evangelism & Missions",
      text: "We are called to reach the lost, both locally and globally, through mission-focused outreach and soul-winning.",
      refs: "Mark 16:15",
      icon: "fa-solid fa-earth-africa",
      accent: "border-l-red-600",
    },
    {
      title: "Kingdom Identity & Purpose",
      text: "We believe every believer is a new creature in Christ, called to walk in kingdom identity, live with purpose, and represent God’s glory on earth.",
      refs: "1 Peter 2:9 • Ephesians 2:10 • 1 John 4:17",
      icon: "fa-solid fa-crown",
      accent: "border-l-teal-600",
    },
    {
      title: "Influence with Integrity",
      text: "We believe believers are called to be salt and light, shaping society with godly influence, integrity, honesty, and righteous character.",
      refs: "Matthew 5:14–16 • Proverbs 11:3 • Romans 12:2",
      icon: "fa-solid fa-lightbulb",
      accent: "border-l-purple-600",
    },
  ];

  return (
    <main>
      <PageHero
        title="About"
        subtitle="Learn about our vision, mission, message, and what we believe at Gloryrealm Christian Centre (GRCC)."
      />

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              About Gloryrealm Christian Centre
              <span className="block mt-3 h-1 w-20 bg-teal-600" />
            </h2>

            <p className="mt-5 text-slate-700 leading-relaxed">
              Gloryrealm Christian Centre (GRCC) is a Christ-centered ministry
              committed to raising believers who reflect the glory, character,
              and authority of Jesus Christ in every sphere of life.
            </p>

            <p className="mt-4 text-slate-700 leading-relaxed">
              Our mandate is to establish a people grounded in the Word of God,
              strengthened through prayer, formed through discipleship, and
              empowered by the Holy Spirit to live lives of purpose, holiness,
              and kingdom influence.
            </p>
          </div>

          {/* Vision / Mission / Message / Motto cards */}
          <div className="grid gap-5">
            <InfoCard
              title="Our Vision"
              text="To raise glory-revealing Christians in every sphere of influence."
              icon="fa-solid fa-eye"
            />

            <InfoCard
              title="Our Mission"
              text="To raise a people grounded in the Word, committed to discipleship, passionate about missions, and devoted to long, fervent, consistent prayers."
              icon="fa-solid fa-bullseye"
            />

            <InfoCard
              title="Our Message"
              text="Christ and The Cross."
              icon="fa-solid fa-cross"
            />

            <InfoCard
              title="Our Motto"
              text="Glory-Revealing Christians."
              icon="fa-solid fa-fire"
            />
          </div>
        </div>
      </section>

      {/* Mission bullets (clean list like original) */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl border bg-white p-8">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Our Mission Focus
              <span className="block mt-3 h-1 w-16 bg-fuchsia-600" />
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {missionPoints.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white">
                    <i className="fa-solid fa-check text-[12px]" />
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              What We Believe
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-700 leading-relaxed">
              Our faith and practice are rooted in Scripture and centered on Christ.
              These core convictions shape our worship, discipleship, and mission.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {beliefs.map((b) => (
              <div
                key={b.title}
                className={`rounded-2xl bg-white p-7 shadow-md border border-slate-100 border-l-[6px] ${b.accent}
                transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl text-teal-600">
                    <i className={b.icon} />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[18px] text-slate-900">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-slate-700 text-sm leading-relaxed">
                      {b.text}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">{b.refs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/** Reusable small info card for Vision/Mission/Message/Motto */
function InfoCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-7 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="text-purple-600 text-2xl">
          <i className={icon} />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          <p className="mt-2 text-slate-700 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}
