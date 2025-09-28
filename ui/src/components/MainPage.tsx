import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDiagnostics } from "../store/useDiagnostics";
import { useSettings } from "../store/useSettings";
import { NodeCard } from "../components/NodeCard";
import { HeaderStatus } from "../components/HeaderStatus";
import Spinner from "./Spinner";
import { formatOperator } from "../utils/formatOperator";
import { isOnline, type Connectivity } from "../utils/netStatus";
import { signalLabel } from "../utils/netFormat";

export default function MainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { snapshot, isLoading, refresh, error } = useDiagnostics();
  const { geoEnabled } = useSettings();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  // Debug logging for verification
  useEffect(() => {
    if (snapshot) {
      console.log("[Netok UI] Internet:", snapshot.internet);
      console.log("[Netok UI] Computer:", snapshot.computer);
    }
  }, [snapshot]);

  const handleSettings = () => {
    navigate('/settings');
  };

  // Format updated time for footer
  const updatedAtHMS = snapshot?.updatedAt 
    ? new Date(snapshot.updatedAt).toLocaleTimeString() 
    : '';

  // VPN detection (placeholder - would need actual VPN detection logic)
  const vpnDetected = false;

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <HeaderStatus 
            connectivity={snapshot?.connectivity || 'unknown'}
            publicIp={snapshot?.internet?.public_ip}
            city={geoEnabled ? snapshot?.internet?.city : undefined}
            country={geoEnabled ? snapshot?.internet?.country : undefined}
            vpnDetected={vpnDetected}
          />

          <NodeCard 
            baseTitleKey="node.computer.title"
            metaText={snapshot?.computer?.hostname ? t('meta.computer', { hostname: snapshot.computer.hostname }) : undefined}
            facts={[
              (() => {
                const comp = snapshot?.computer;
                const adapter = comp?.adapter_model?.trim() || 
                               comp?.adapter_friendly?.trim() || 
                               comp?.interface_name?.trim() || 
                               t('unknown');
                return t('node.computer.adapter', { name: adapter });
              })(),
              // Only show local IP if connectivity is not offline
              ...(snapshot?.connectivity !== 'offline' ? [
                t('node.computer.lan_ip', { ip: snapshot?.computer?.local_ip ?? t('unknown') })
              ] : []),
            ]} 
          />

          <NodeCard 
            title={(() => {
              type Conn = "wifi" | "ethernet" | "usb_modem" | "tethering" | "vpn" | "unknown";
              
              const titleKeyMap: Record<Conn, string> = {
                wifi: "node.network.title.wifi",
                ethernet: "node.network.title.ethernet", 
                usb_modem: "node.network.title.usb_modem",
                tethering: "node.network.title.tethering",
                vpn: "node.network.title.vpn",
                unknown: "node.network.title.unknown",
              };
              
              const connType = (snapshot?.computer?.connection_type ?? "unknown") as Conn;
              const title = t(titleKeyMap[connType]);
              
              console.log("[Netok UI] connection_type:", connType, "title:", title);
              
              return title;
            })()}
            subtitle={snapshot?.computer?.connection_type === 'wifi' && snapshot?.computer?.wifi_ssid ? snapshot.computer.wifi_ssid : undefined}
            facts={[
              // Show signal only for Wi-Fi when RSSI is available and connectivity is not offline
              ...(snapshot?.computer?.connection_type === 'wifi' && 
                  snapshot?.connectivity !== 'offline' && 
                  typeof snapshot?.computer?.rssi_dbm === 'number' ? [
                    t('node.network.signal', { 
                      grade: signalLabel(t, snapshot.computer.rssi_dbm),
                      dbm: snapshot.computer.rssi_dbm
                    })
                  ] : []),
            ]} 
          />

          <NodeCard 
            baseTitleKey="node.router.title"
            metaText={undefined}
            facts={[
              // Only show router IP if connectivity is not offline
              ...(snapshot?.connectivity !== 'offline' ? [
                t('node.router.lan_ip', { ip: snapshot?.router?.local_ip ?? t('unknown') })
              ] : []),
            ]} 
          />

          <NodeCard 
            baseTitleKey="node.internet.title"
            metaText={snapshot?.internet?.provider ? t('meta.internet', { operator: snapshot.internet.provider }) : undefined}
            facts={[
              // Only show internet data if connectivity is online
              ...(isOnline(snapshot?.connectivity as Connectivity) ? [
                t('node.internet.public_ip', { ip: snapshot?.internet?.public_ip ?? t('unknown') }),
                (() => {
                  const net = snapshot?.internet;
                  const operator = formatOperator(net?.operator);
                  return t('node.internet.operator', { operator: operator ?? t('unknown') });
                })(),
                ...(geoEnabled && snapshot?.internet?.city && snapshot?.internet?.country ? [
                  t('node.internet.location', { 
                    city: snapshot.internet.city, 
                    country: snapshot.internet.country 
                  })
                ] : []),
              ] : [
                t('node.internet.public_ip', { ip: t('unknown') }),
                t('node.internet.operator', { operator: t('unknown') }),
              ]),
            ]} 
          />

          {error && <div className="mt-2 text-red-500">{t('status.error_prefix')} {error}</div>}
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3 z-10">
        <div className="flex justify-center gap-2 mb-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="relative h-10 px-4 shrink-0 rounded-lg border bg-neutral-600 text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            aria-live="polite"
            aria-busy={isLoading}
          >
            <span className={isLoading ? "opacity-0" : "opacity-100"}>
              {isLoading ? t('status.waiting') : t('actions.refresh')}
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
            {t('actions.settings')}
          </button>
        </div>
        <div className="text-xs opacity-70 text-center">
          {t('footer.updated', { time: updatedAtHMS })}
        </div>
        
        {/* Debug section */}
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Debug → {showDebug ? 'hide' : 'show'} raw JSON
          </button>
        </div>
        
        {showDebug && snapshot?.rawSnapshot && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {snapshot.rawSnapshot}
            </pre>
          </div>
        )}
      </footer>
    </div>
  );
}

