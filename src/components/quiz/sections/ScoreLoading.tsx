export default function ScoreLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent"></div>
        <p className="font-satoshi font-bold text-black dark:text-white">
          Loading results...
        </p>
      </div>
    </div>
  );
}
