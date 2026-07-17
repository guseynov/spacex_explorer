import {
  Activity,
  CloudLightning,
  Droplets,
  Factory,
  Flame,
  Mountain,
  MountainSnow,
  Snowflake,
  Sun,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

export function EventCategoryIcon({
  categoryId,
  ...props
}: LucideProps & { categoryId: string }) {
  switch (categoryId) {
    case "wildfires":
      return <Flame {...props} />;
    case "severeStorms":
      return <CloudLightning {...props} />;
    case "floods":
      return <Droplets {...props} />;
    case "volcanoes":
      return <Mountain {...props} />;
    case "seaLakeIce":
      return <Snowflake {...props} />;
    case "drought":
      return <Sun {...props} />;
    case "dustHaze":
      return <Wind {...props} />;
    case "earthquakes":
      return <Activity {...props} />;
    case "landslides":
      return <MountainSnow {...props} />;
    case "manmade":
      return <Factory {...props} />;
    default:
      return <Zap {...props} />;
  }
}

export function getEventCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case "wildfires":
      return Flame;
    case "severeStorms":
      return CloudLightning;
    case "floods":
      return Droplets;
    case "volcanoes":
      return Mountain;
    case "seaLakeIce":
      return Snowflake;
    case "drought":
      return Sun;
    case "dustHaze":
      return Wind;
    case "earthquakes":
      return Activity;
    case "landslides":
      return MountainSnow;
    case "manmade":
      return Factory;
    default:
      return Zap;
  }
}
