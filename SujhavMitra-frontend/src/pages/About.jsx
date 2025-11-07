export default function About() {
  return (
    <div className="wrapper pb-16">
      <section className="relative px-4 pt-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-50 via-white to-white" />
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">About SujhavMitra</h1>
            <p className="mx-auto mt-3 max-w-2xl text-gray-700">
              AI-driven recommendations for books and movies. We help you discover what to read and watch next—fast and delightfully.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">What we offer</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>📚 Smart book recommendations</li>
                <li>🎬 Relevant movie suggestions</li>
                <li>⚡ Snappy, modern UI</li>
                <li>💡 Context-aware search</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Our mission</div>
              <p className="mt-3 text-sm text-gray-700">
                Help you make smarter entertainment choices—without endless scrolling—using practical AI that respects your time.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Why it matters</div>
              <p className="mt-3 text-sm text-gray-700">
                Discovery should be simple. We surface quality suggestions so you can enjoy more of what you love.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Tech stack</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">React</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Vite</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Tailwind</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Flask</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Pandas</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">NumPy</span>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                A pragmatic stack focused on speed and reliability. The frontend is fast and responsive; the backend serves relevant recommendations using similarity models.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Quick stats</h2>
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
                Built for responsiveness, clarity, and usefulness across devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-6 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Get in touch</h3>
          <p className="mt-2 text-sm text-gray-700">Have ideas or feedback? We’d love to hear from you.</p>
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
  );
}
