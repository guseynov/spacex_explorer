import Image from "next/image";

export function MissionGallery({
  launchName,
  images,
}: {
  launchName: string;
  images: string[];
}) {
  if (images.length === 0) {
    return (
      <div className="panel px-6 py-8 text-[var(--muted)]">
        No related imagery is available for this event.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <div
          key={image}
          className="overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-2"
        >
          <Image
            src={image}
            alt={`${launchName} event image ${index + 1}`}
            width={720}
            height={480}
            className="h-72 w-full object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
