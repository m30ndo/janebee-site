"use client";

/** Delete with a confirmation prompt. */
export function DeleteButton({ action, what = "this" }: { action: (d: FormData) => Promise<void>; what?: string }) {
  return (
    <button
      formAction={action}
      formNoValidate
      onClick={(e) => {
        if (!confirm(`Delete ${what}? This can't be undone.`)) e.preventDefault();
      }}
      className="text-sm text-[#a3402d] underline underline-offset-4 hover:no-underline"
    >
      Delete
    </button>
  );
}
