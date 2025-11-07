const Hero = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-8">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="inline-flex items-center rounded-full bg-amber-800 px-3 py-1 text-xs font-medium text-white ring-1 ring-amber-700">
          Smart Recommendations
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-900">
          SujhavMitra
        </h1>
        <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-600 font-light">
          Personalized suggestions for the books you love and the movies you’ll enjoy next.
        </p>
        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
            <svg aria-hidden="true" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.3 0 .6.1.8.3l7.5 4.4c.3.2.5.5.5.9v8.8c0 .4-.2.7-.5.9l-7.5 4.4c-.2.1-.5.3-.8.3s-.6-.1-.8-.3l-7.5-4.4c-.3-.2-.5-.5-.5-.9V7.6c0-.4.2-.7.5-.9L11.2 2.3c.2-.2.5-.3.8-.3Zm-1.3 14.1 6-6a1 1 0 1 0-1.4-1.4l-5.3 5.3-2.1-2.1a1 1 0 1 0-1.4 1.4l2.8 2.8c.4.4 1 .4 1.4 0Z"/></svg>
            Privacy first
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
            <svg aria-hidden="true" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm.75 4.5a.75.75 0 0 0-1.5 0v4.19l-2.03 2.03a.75.75 0 1 0 1.06 1.06l2.22-2.22a1 1 0 0 0 .25-.66Z"/></svg>
            Fast results
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
            <svg aria-hidden="true" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75V15A3.75 3.75 0 0 1 17.25 18.75H9.5L5.28 21.4a.75.75 0 0 1-1.14-.64V15A8.25 8.25 0 0 1 3 15Z"/></svg>
            No ads
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
