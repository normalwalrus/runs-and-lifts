"use client";

export default function DeleteButton({
  action,
  confirmMessage,
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "rounded-lg px-3 py-2 text-sm font-medium text-lift hover:bg-lift/10"
        }
      >
        Delete
      </button>
    </form>
  );
}
