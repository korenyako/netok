export type Connectivity = "online" | "offline" | "no_router" | "captive_or_no_dns" | "unknown";

export function statusTitle(t: (k: string) => string, c?: Connectivity): string {
  switch (c) {
    case "online": 
      return t("status.online");
    case "no_router": 
      return t("status.no_router");
    case "captive_or_no_dns": 
      return t("status.captive_or_no_dns");
    case "offline": 
      return t("status.offline");
    case "unknown":
    default: 
      return t("status.offline");
  }
}

export function statusHint(t: (k: string) => string, c?: Connectivity): string {
  switch (c) {
    case "no_router": 
      return t("status.hint.no_router");
    case "captive_or_no_dns": 
      return t("status.hint.captive_or_no_dns");
    case "offline": 
      return t("status.hint.offline");
    case "unknown":
    default: 
      return "";
  }
}

export const isOnline = (c?: Connectivity): boolean => c === "online";
