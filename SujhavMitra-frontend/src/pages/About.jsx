export default function About() {
  return (
    <div className="content">
      <div className="wrapper pb-16">
        {/* ===================== INTRO SECTION ===================== */}
        <section className="relative px-4 pt-12">
          <div className="">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              About Us
            </h1>

            <p className="mx-auto mt-3  text-gray-700 text-sm md:text-base leading-relaxed">
              SujhavMitra is a full-stack recommendation system built to deliver
              fast, meaningful suggestions for both books and movies through a
              modern, responsive web app. <br />
              <br />
              For <strong>books</strong>, SujhavMitra uses collaborative
              filtering (matrix factorization + cosine similarity) along with
              popularity ranking to uncover meaningful reading patterns from
              user ratings. A Book–User interaction matrix and precomputed
              similarity vectors allow instant nearest-neighbour lookups. <br />
              <br />
              For <strong>movies</strong>, a content-based pipeline powered by
              TF-IDF and cosine similarity compares plot overviews, genres, and
              cast metadata—enabling semantically rich recommendations even
              without user history. Precomputed similarity matrices ensure
              low-latency results. <br />
              <br />
              These systems together create a balanced recommendation engine
              that blends speed, accuracy, and scalable engineering with smooth
              UI/UX to help you discover the right books and movies
              effortlessly.
            </p>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-50 via-white to-white" />
          <div className="mx-auto max-w-6xl">
            {/* Highlights */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">
                  What we offer
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>📚 Smart book recommendations</li>
                  <li>🎬 Relevant movie suggestions</li>
                  <li>⚡ Snappy, modern UI</li>
                  <li>💡 Context-aware search</li>
                </ul>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">
                  Our mission
                </div>
                <p className="mt-3 text-sm text-gray-700">
                  Help you make smarter entertainment choices—without endless
                  scrolling—using practical AI that respects your time.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">
                  Why it matters
                </div>
                <p className="mt-3 text-sm text-gray-700">
                  Discovery should be simple. We surface quality suggestions so
                  you can enjoy more of what you love.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== ALGORITHMS SECTION ===================== */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              How SujhavMitra Works
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Book Algorithm */}
              <div className="rounded-lg border bg-white p-5">
                <h3 className="font-semibold text-gray-900">
                  Book Recommendation Algorithm
                </h3>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  • Uses <strong>Item-Based Collaborative Filtering</strong>
                  (Book–User rating matrix). <br />•{" "}
                  <strong>Matrix Factorization</strong> uncovers hidden patterns
                  between readers and books. <br />•{" "}
                  <strong>Cosine Similarity</strong> between book vectors is
                  precomputed for fast nearest-neighbour search. <br />•{" "}
                  <strong>Popularity-based ranking</strong> refines results
                  using average rating + rating count. <br />
                  This produces accurate book suggestions in categories with
                  rich rating data.
                </p>
              </div>

              {/* Movie Algorithm */}
              <div className="rounded-lg border bg-white p-5">
                <h3 className="font-semibold text-gray-900">
                  Movie Recommendation Algorithm
                </h3>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  • Uses <strong>Content-Based Filtering</strong> (no user
                  history required). <br />• Movie overviews processed using{" "}
                  <strong>TF-IDF</strong>. <br />
                  • Genres, cast & keywords tokenized into feature vectors.{" "}
                  <br />• <strong>Cosine Similarity</strong> identifies
                  semantically similar films. <br />
                  • Precomputed similarity matrices guarantee low-latency
                  recommendations. <br />
                  This allows SujhavMitra to find movies with similar themes,
                  moods, or storytelling styles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== TECH STACK ===================== */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tech stack
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                    React
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                    Vite
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                    Tailwind
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                    Flask
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                    Pandas
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                    NumPy
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-700">
                  A pragmatic stack focused on speed and reliability. The
                  frontend is fast and responsive; the backend serves relevant
                  recommendations using similarity models.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick stats
                </h2>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="mt-1 text-xs text-gray-600">Categories</div>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-2xl font-bold text-gray-900">Fast</div>
                    <div className="mt-1 text-xs text-gray-600">Search</div>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-2xl font-bold text-gray-900">AI</div>
                    <div className="mt-1 text-xs text-gray-600">Powered</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-700">
                  Built for responsiveness, clarity, and usefulness across
                  devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT ===================== */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl rounded-xl border bg-white p-6 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Get in touch
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              Have ideas or feedback? We’d love to hear from you.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=hellosujhavmitra@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700"
            >
              Contact us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
