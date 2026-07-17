import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9", className)}
      fill="none"
    >
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 18.5c4.2-1.8 6.7-5.7 11.1-6.8 5.7-1.5 8.5 3.3 13.8 3.9M7.7 24c4.8-.4 7.2 4.2 12 4.1 5.8-.1 7-6.5 12.6-7.2"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="4.25" fill="currentColor" />
      <circle cx="20" cy="20" r="8.8" stroke="currentColor" strokeOpacity="0.55" />
    </svg>
  );
}
