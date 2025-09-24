import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDiagnostics } from "../store/useDiagnostics";
import { useSettings } from "../store/useSettings";
import { NodeCard } from "../components/NodeCard";
import Spinner from "./Spinner";

function UpdatedAt({ time }: { time?: string | number }) {
  const { t } = useTranslation();
  return (
    <span className="text-xs mt-3 opacity-70">
      {t('updated_at')} {time ? new Date(time).toLocaleTimeString() : t('dash')}
    </span>
  );
}

export default function MainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { snapshot, isLoading, refresh, error } = useDiagnostics();
  const { geoEnabled } = useSettings();

  useEffect(() => { refresh(); }, [refresh]);

  const title =
    snapshot?.overall === "ok" ? t('internet.full')
    : snapshot?.overall === "partial" ? t('internet.partial')
    : t('internet.down');

  const speed = snapshot?.speed
    ? t('speed.value', { 
        down: snapshot.speed.down ?? t('dash'), 
        up: snapshot.speed.up ?? t('dash') 
      })
    : t('dash');

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="mb-2">{title}</div>
          <div className="mb-4">{t('speed.label', { speed })}</div>

          <NodeCard title={t('nodes.computer.name')} lines={[
            [t('nodes.computer.name_field'), snapshot?.computer?.hostname ?? t('unknown')],
            [t('nodes.computer.model_field'), snapshot?.computer?.model ?? t('unknown')],
            [t('nodes.computer.adapter_field'), snapshot?.computer?.adapter ?? t('unknown')],
            [t('nodes.computer.local_ip_field'), snapshot?.computer?.local_ip ?? t('unknown')],
          ]} />

          <NodeCard title={t('nodes.network.name')} lines={[
            renderNetworkKind(snapshot || undefined, t),
            renderNetworkMetric(snapshot || undefined, t),
          ]} />

          <NodeCard title={t('nodes.router.name')} lines={[
            `${snapshot?.router.brand ?? ""} ${snapshot?.router.model ?? ""}`.trim() || t('unknown'),
            `${t('nodes.router.local_ip_field')}: ${snapshot?.router.localIp ?? t('unknown')}`,
          ]} />

          <NodeCard title={t('nodes.internet.name')} lines={[
            snapshot?.internet.provider ?? t('unknown'),
            `${t('nodes.internet.ip_field')}: ${snapshot?.internet.publicIp ?? t('unknown')}`,
            ...(geoEnabled ? [renderGeo(snapshot || undefined, t)] : []),
          ]} />

          {error && <div className="mt-2 text-red-500">{t('status.error_prefix')} {error}</div>}
          <UpdatedAt time={snapshot?.updatedAt} />
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3 z-10">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 text-[13px] self-center">
            {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleTimeString() : t('dash')}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="relative h-10 px-4 shrink-0 rounded-lg border bg-neutral-600 text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              aria-live="polite"
              aria-busy={isLoading}
            >
              <span className={isLoading ? "opacity-0" : "opacity-100"}>
                {isLoading ? t('status.waiting') : t('buttons.refresh')}
              </span>
              {isLoading && (
                <span className="absolute inset-0 grid place-items-center">
                  <Spinner className="size-4 animate-spin text-white" />
                </span>
              )}
            </button>
            <button 
              onClick={handleSettings}
              className="h-10 px-4 shrink-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium"
            >
              {t('buttons.settings')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function renderNetworkKind(s: { network?: { type?: string } } | undefined, t: (key: string) => string) {
  const map: Record<string, string> = {
    wifi: t('nodes.network.type_wifi'),
    ethernet: t('nodes.network.type_cable'),
    usb_modem: t('nodes.network.type_usb_modem'),
    bt: t('nodes.network.type_bt'),
    cellular: t('nodes.network.type_mobile'),
    unknown: t('unknown'),
  };
  return map[s?.network?.type ?? "unknown"];
}

function renderNetworkMetric(s: { network?: { signal?: { dbm?: number } } } | undefined, t: (key: string) => string) {
  const signal = s?.network?.signal;
  if (!signal) return t('dash');
  if (signal.dbm) {
    const lvl =
      signal.dbm >= -55 ? t('nodes.network.signal_excellent')
      : signal.dbm >= -67 ? t('nodes.network.signal_good')
      : signal.dbm >= -75 ? t('nodes.network.signal_fair')
      : t('nodes.network.signal_weak');
    return `${t('nodes.network.signal_field')}: ${lvl} (${signal.dbm} dBm)`;
  }
  return t('dash');
}

function renderGeo(s: { internet?: { country?: string; city?: string } } | undefined, t: (key: string) => string) {
  const country = s?.internet?.country;
  const city = s?.internet?.city;
  if (!country && !city) return t('dash');
  const place = [city, country].filter(Boolean).join(", ");
  return place || t('dash');
}
