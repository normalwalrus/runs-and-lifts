"use client";

export default function DeleteButton({
  onDelete,
  confirmMessage,
  className,
}: {
  onDelete: () => void;
  confirmMessage: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(confirmMessage)) onDelete();
      }}
      className={
        className ??
        "rounded-lg px-3 py-2 text-sm font-medium text-lift hover:bg-lift/10"
      }
    >
      Delete
    </button>
  );
}
