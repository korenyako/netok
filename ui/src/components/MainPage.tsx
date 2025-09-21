import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDiagnostics } from "../store/useDiagnostics";
import { NodeCard } from "../components/NodeCard";

export default function MainPage() {
  const navigate = useNavigate();
  const { snapshot, isLoading, refresh, error } = useDiagnostics();

  useEffect(() => { refresh(); }, [refresh]);

  const title =
    snapshot?.overall === "ok" ? "Интернет доступен."
    : snapshot?.overall === "partial" ? "Интернет частично доступен."
    : "Интернет недоступен.";

  const speed =
    snapshot?.speed
      ? `${snapshot.speed.down ?? "–"}/${snapshot.speed.up ?? "–"} Мбит/с`
      : "—";

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="mb-2">{title}</div>
          <div className="mb-4">Скорость: {speed}</div>

          <NodeCard title="Компьютер" lines={[
            ["Имя", snapshot?.computer?.hostname ?? "неизвестно"],
            ["Модель", snapshot?.computer?.model ?? "неизвестно"],
            ["Сетевой адаптер", snapshot?.computer?.adapter ?? "неизвестно"],
            ["IP в локальной сети", snapshot?.computer?.local_ip ?? "неизвестно"],
          ]} />

          <NodeCard title="Сеть" lines={[
            renderNetworkKind(snapshot),
            renderNetworkMetric(snapshot),
          ]} />

          <NodeCard title="Роутер/Точка доступа" lines={[
            `${snapshot?.router.brand ?? ""} ${snapshot?.router.model ?? ""}`.trim() || "неизвестно",
            `IP в локальной сети: ${snapshot?.router.localIp ?? "неизвестно"}`,
          ]} />

          <NodeCard title="Интернет" lines={[
            snapshot?.internet.provider ?? "неизвестно",
            `IP: ${snapshot?.internet.publicIp ?? "неизвестно"}`,
            renderGeo(snapshot),
          ]} />

          {error && <div className="mt-2 text-red-500">Ошибка: {error}</div>}
          <div className="text-xs mt-3 opacity-70">
            Обновлено: {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleTimeString() : "—"}
          </div>
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3 z-10">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 text-[13px] self-center">
            {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleTimeString() : "—"}
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
                {isLoading ? "Обновляю…" : "Обновить"}
              </span>
              {isLoading && (
                <span className="absolute inset-0 grid place-items-center">
                  <div className="size-4 animate-spin text-white">⟳</div>
                </span>
              )}
            </button>
            <button 
              onClick={handleSettings}
              className="h-10 px-4 shrink-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium"
            >
              Настройки
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function renderNetworkKind(s?: any) {
  const map: Record<string, string> = {
    wifi: "Wi-Fi",
    ethernet: "Кабель",
    usb_modem: "USB-модем",
    bt: "Bluetooth",
    cellular: "Мобильный модем",
    unknown: "Неизвестно",
  };
  return map[s?.network?.type ?? "unknown"];
}

function renderNetworkMetric(s?: any) {
  const signal = s?.network?.signal;
  if (!signal) return "—";
  if (signal.dbm) {
    const lvl =
      signal.dbm >= -55 ? "Сигнал: отличный"
      : signal.dbm >= -67 ? "Сигнал: хороший"
      : signal.dbm >= -75 ? "Сигнал: средний"
      : "Сигнал: слабый";
    return `${lvl} (${signal.dbm} dBm)`;
  }
  return "—";
}

function renderGeo(s?: any) {
  const country = s?.internet?.country;
  const city = s?.internet?.city;
  if (!country && !city) return "—";
  const place = [city, country].filter(Boolean).join(", ");
  return place || "—";
}
