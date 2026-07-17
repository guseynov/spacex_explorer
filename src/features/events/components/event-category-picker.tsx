import { cn } from "@/lib/utils";
import { getEventCategoryColor } from "../event-map-utils";
import { EventCategoryIcon } from "./event-category-icon";

const CATEGORY_CHOICES = [
  { value: "wildfires", label: "Wildfires" },
  { value: "severeStorms", label: "Storms" },
  { value: "floods", label: "Floods" },
  { value: "volcanoes", label: "Volcanoes" },
  { value: "seaLakeIce", label: "Sea & ice" },
  { value: "drought", label: "Drought" },
  { value: "dustHaze", label: "Dust & haze" },
  { value: "earthquakes", label: "Quakes" },
  { value: "landslides", label: "Landslides" },
  { value: "manmade", label: "Human-caused" },
] as const;

export function EventCategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (category: string) => void;
}) {
  const selectedChoice = CATEGORY_CHOICES.find((choice) => choice.value === value);

  return (
    <section aria-labelledby="event-category-heading" className="shrink-0 border-b border-border bg-[var(--surface-strong)] px-3 py-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 id="event-category-heading" className="text-sm font-semibold text-foreground">Browse by category</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {selectedChoice ? `${selectedChoice.label} events are shown below.` : "Select one to load the event list."}
          </p>
        </div>
        {selectedChoice ? (
          <button
            type="button"
            onClick={() => onChange("all")}
            className="min-h-8 shrink-0 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1"
        role="group"
        aria-label="Event categories"
      >
        {CATEGORY_CHOICES.map((choice) => {
          const selected = choice.value === value;
          const categoryColor = getEventCategoryColor(choice.value);

          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(choice.value)}
              className={cn(
                "flex min-h-10 shrink-0 items-center gap-1.5 rounded-md border px-2 text-left text-xs font-medium transition-[color,background-color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/12 text-[var(--brand-strong)]"
                  : "border-border bg-background/35 text-muted-foreground hover:border-border-strong hover:bg-secondary hover:text-foreground",
              )}
            >
              <EventCategoryIcon
                aria-hidden="true"
                categoryId={choice.value}
                className="size-4 shrink-0"
                strokeWidth={1.9}
                style={{ color: categoryColor }}
              />
              <span className="min-w-0 whitespace-nowrap">{choice.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
