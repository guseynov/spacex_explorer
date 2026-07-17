const SOURCE_NAMES: Record<string, string> = {
  IRWIN: "IRWIN wildfire data",
  GDACS: "Global Disaster Alert and Coordination System",
  JTWC: "Joint Typhoon Warning Center",
  NATICE: "U.S. National Ice Center",
  BYU_ICE: "BYU ice tracking",
  SIVolcano: "Smithsonian Global Volcanism Program",
  EO: "NASA Earth Observatory",
  EONET: "NASA EONET",
};

export function getEventSourceDisplayName(source: string) {
  return SOURCE_NAMES[source] ?? source;
}
