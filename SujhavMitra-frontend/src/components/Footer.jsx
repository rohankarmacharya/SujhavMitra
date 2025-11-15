import "../index.css";
const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-[#4fb4ce] text-white">
      <div className="wrapper">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <div className="text-xl font-bold">SujhavMitra</div>
              <p className="mt-2 text-sm">
                AI-driven recommendations for books and movies. Fast, relevant,
                and delightful.
              </p>
              {/* Newsletter */}
              <form
                className="mt-4 flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  // no-op; hook up to backend/service if desired
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  className="w-full sm:flex-1 rounded-lg border p-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Explore</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a className="hover:text-cyan-700" href="/books">
                    Books
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-700" href="/movies">
                    Movies
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-700" href="/about-us">
                    About
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-700" href="/profile">
                    Wishlist
                  </a>
                </li>
              </ul>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Resources</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a className="hover:text-cyan-700" href="/about-us">
                    Docs
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-700" href="/dashboard">
                    Changelog
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-700" href="/about-us">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Contact</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    className="hover:text-cyan-700"
                    href="mailto:hellosujhavmitra@gmail.com"
                  >
                    hellosujhavmitra@gmail.com
                  </a>
                </li>
              </ul>
              <div className="mt-4 flex gap-3">
                <a
                  aria-label="Twitter"
                  href="#"
                  className="rounded-full p-2 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M19.633 7.997c.013.18.013.36.013.54 0 5.5-4.187 11.84-11.84 11.84-2.355 0-4.543-.69-6.382-1.878.33.038.647.051.99.051a8.37 8.37 0 005.191-1.787 4.184 4.184 0 01-3.907-2.9c.254.038.508.064.775.064.37 0 .74-.051 1.083-.14a4.176 4.176 0 01-3.35-4.1v-.051c.558.306 1.2.495 1.882.52a4.168 4.168 0 01-1.863-3.48c0-.77.204-1.472.558-2.085a11.87 11.87 0 008.62 4.374 4.71 4.71 0 01-.102-.958 4.176 4.176 0 017.226-2.856 8.21 8.21 0 002.652-1.007 4.187 4.187 0 01-1.838 2.31 8.37 8.37 0 002.402-.64 8.965 8.965 0 01-2.09 2.165z" />
                  </svg>
                </a>
                <a
                  aria-label="GitHub"
                  href="#"
                  className="rounded-full p-2 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12a9.996 9.996 0 006.838 9.488c.5.094.682-.217.682-.482 0-.238-.01-1.024-.014-1.858-2.782.604-3.37-1.183-3.37-1.183-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.07 1.532 1.03 1.532 1.03.892 1.53 2.34 1.087 2.91.832.09-.646.35-1.087.636-1.337-2.22-.252-4.555-1.11-4.555-4.944 0-1.09.39-1.984 1.03-2.683-.103-.252-.447-1.268.098-2.64 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.852.004 1.71.115 2.51.338 1.91-1.295 2.75-1.026 2.75-1.026.545 1.372.201 2.388.098 2.64.64.699 1.03 1.593 1.03 2.683 0 3.842-2.34 4.688-4.566 4.936.36.31.682.92.682 1.853 0 1.337-.012 2.415-.012 2.743 0 .265.18.58.688.48A10 10 0 0022 12c0-5.523-4.477-10-10-10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  aria-label="LinkedIn"
                  href="#"
                  className="rounded-full p-2 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M19 0h-14C2.2 0 1 1.2 1 3v18c0 1.8 1.2 3 3 3h14c1.8 0 3-1.2 3-3V3c0-1.8-1.2-3-3-3zM8 19H5V9h3v10zM6.5 7.7C5.5 7.7 4.7 6.9 4.7 6s.8-1.7 1.8-1.7c1 0 1.8.8 1.8 1.7s-.8 1.7-1.8 1.7zM20 19h-3v-5.3c0-1.3-.5-2.2-1.7-2.2-.9 0-1.4.6-1.7 1.1-.1.2-.1.5-.1.8V19h-3s.1-9 0-10h3v1.5c.4-.7 1.2-1.8 3-1.8 2.2 0 3.6 1.4 3.6 4.3V19z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row">
            <div>
              {" "}
              {new Date().getFullYear()} SujhavMitra. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">
                Built with React · Vite · Flask
              </span>
              <a href="#" className="hover:text-cyan-700">
                Privacy
              </a>
              <a href="#" className="hover:text-cyan-700">
                Terms
              </a>
              <a href="#" className="hover:text-cyan-700">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
