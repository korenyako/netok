export type Conn = "wifi" | "ethernet" | "usb_modem" | "tethering" | "vpn" | "unknown";

export function connectionTitle(t: (k: string) => string, c?: Conn) {
  const key = c ?? "unknown";
  return t(`node.network.title.${key}`);
}

export function signalLabel(t: (k: string) => string, dbm: number) {
  if (dbm >= -55) return t("signal.excellent");
  if (dbm >= -70) return t("signal.good");
  if (dbm >= -80) return t("signal.fair");
  return t("signal.poor");
}
