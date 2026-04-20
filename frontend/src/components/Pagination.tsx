type Props = {
  page: number;
  count: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  count,
  pageSize = 10,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(count / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded border px-2 py-1 text-xs disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded border px-2 py-1 text-xs disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}