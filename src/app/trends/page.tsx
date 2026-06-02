import type { Metadata } from "next";
import { LaunchTrendsPanel } from "@/features/launches/components/launch-trends-panel";

export const metadata: Metadata = {
  title: "Launch Trends",
};

export default function TrendsPage() {
  return <LaunchTrendsPanel />;
}
