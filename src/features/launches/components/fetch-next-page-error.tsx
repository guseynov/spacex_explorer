export function FetchNextPageError({
  isFetchNextPageError,
  loadNextPage,
}: {
  isFetchNextPageError: boolean;
  loadNextPage: () => void;
}) {
  if (!isFetchNextPageError) {
    return null;
  }

  return (
    <div className="panel px-5 py-4 text-sm text-[var(--muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>We could not load more launches.</p>
        <button
          type="button"
          onClick={loadNextPage}
          className="button-secondary px-4 py-2 font-semibold transition"
        >
          Load more again
        </button>
      </div>
    </div>
  );
}
