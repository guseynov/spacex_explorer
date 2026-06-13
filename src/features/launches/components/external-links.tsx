export function ExternalLinks({
  externalLinks,
}: {
  externalLinks: [string, string][];
}) {
  if (externalLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        External links
      </h2>
      <div className="flex flex-wrap gap-3">
        {externalLinks.map(([label, href], index) => (
          <a
            key={`${label}-${href}-${index}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="button-secondary px-4 py-2 text-sm font-semibold transition"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
