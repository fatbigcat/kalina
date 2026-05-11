import Link from "next/link";

type BlogPost = {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

const posts: BlogPost[] = [
  {
    title: "Designing Motion That Feels Human",
    date: "May 08, 2026",
    excerpt:
      "Small animation timing changes can make interfaces feel playful without becoming noisy. Here are the three defaults I keep reusing.",
    tags: ["motion", "ui", "design"],
  },
  {
    title: "Building Visual Identity With Constraints",
    date: "Apr 29, 2026",
    excerpt:
      "A stronger visual system usually starts by saying no: fewer colors, fewer type scales, and one clear personality.",
    tags: ["branding", "css", "product"],
  },
  {
    title: "Shipping 3D on the Web Without Melting Phones",
    date: "Apr 17, 2026",
    excerpt:
      "A practical checklist for balancing scene detail, load time, and battery usage when adding 3D to portfolio pages.",
    tags: ["threejs", "performance", "frontend"],
  },
];

export default function ThoughtsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <Link
        href="/"
        className="fixed left-6 top-6 z-50 inline-flex items-center rounded-full border border-white/35 bg-black/40 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
      >
        Back
      </Link>

      <section className="mx-auto w-full max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Blog</p>
        <h1 className="display_font mt-2 text-6xl leading-none md:text-8xl">Thoughts</h1>

        <div className="mt-10 space-y-5">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">{post.date}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{post.title}</h2>
              <p className="mt-3 text-white/75">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={`${post.title}-${tag}`}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
