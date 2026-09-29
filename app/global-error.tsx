"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#faf5ec] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-amber-300 text-center shadow-lg">
          <div className="text-4xl mb-3">👑</div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-stone-600 mb-6">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#7a1526] text-amber-100 font-semibold rounded-xl hover:bg-[#5c0612] transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
