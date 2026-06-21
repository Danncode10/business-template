import businessConfig from "../../business.json";

export type DashboardTabId =
  | "overview"
  | "sales"
  | "services"
  | "leads"
  | "bookings"
  | "blog"
  | "analytics"
  | "logs"
  | "settings";

export type FeatureFlag =
  | "always"
  | "pricing"
  | "contactForm"
  | "gallery"
  | "analytics"
  | "testimonials"
  | "teamPage"
  | "blog";

interface TabConfig {
  id: DashboardTabId;
  label: string;
  feature: FeatureFlag;
}

export const TAB_CONFIG: TabConfig[] = [
  { id: "overview",   label: "Overview",   feature: "always" },
  { id: "sales",      label: "Sales",      feature: "always" },
  { id: "services",   label: "Services",   feature: "pricing" },
  { id: "leads",      label: "Leads",      feature: "contactForm" },
  { id: "bookings",   label: "Bookings",   feature: "contactForm" },
  { id: "blog",       label: "Blog",       feature: "blog" },
  { id: "analytics",  label: "Analytics",  feature: "analytics" },
  { id: "logs",       label: "Logs",       feature: "always" },
  { id: "settings",   label: "Settings",   feature: "always" },
];

type FeatureMap = Record<FeatureFlag, boolean>;

const features: FeatureMap = {
  always: true,
  ...((businessConfig as { features?: Partial<FeatureMap> }).features ?? {}),
} as FeatureMap;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (flag === "always") return true;
  return Boolean(features[flag]);
}

export function getEnabledTabs(): TabConfig[] {
  return TAB_CONFIG.filter((t) => isFeatureEnabled(t.feature));
}
