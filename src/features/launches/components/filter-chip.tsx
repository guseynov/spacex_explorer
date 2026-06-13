import type { ReactNode } from "react";

export function FilterChip({
  active,
  disabled = false,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      data-active={active ? "true" : "false"}
      onClick={onClick}
      className={`filter-chip ${active ? "filter-chip-active" : ""}`}
    >
      {children}
    </button>
  );
}
