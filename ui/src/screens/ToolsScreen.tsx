import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { CloseButton } from '../components/WindowControls';
import { DiagnosticsIcon, DeviceScanIcon, FlushDnsIcon, SpeedTestIcon } from '../components/icons/ToolIcons';

interface ToolsScreenProps {
  onBack?: () => void;
  onOpenDiagnostics: () => void;
}

export function ToolsScreen({ onBack, onOpenDiagnostics }: ToolsScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('settings.tabs.tools')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">
        <div className="space-y-2">
          <MenuCard
            variant="ghost"
            icon={<DiagnosticsIcon size={24} />}
            title={t('diagnostics.title')}
            subtitle={t('settings.tools.diagnostics_desc')}
            trailing="chevron"
            iconAlign="center"
            onClick={onOpenDiagnostics}
          />

          <MenuCard
            variant="ghost"
            icon={<SpeedTestIcon size={24} />}
            title={t('settings.tools.speed_test')}
            subtitle={t('settings.tools.speed_test_desc')}
            trailing="chevron"
            iconAlign="center"
            onClick={() => {}}
          />

          <MenuCard
            variant="ghost"
            icon={<FlushDnsIcon size={24} />}
            title={t('settings.tools.flush_dns')}
            subtitle={t('settings.tools.flush_dns_desc')}
            trailing="chevron"
            iconAlign="center"
            onClick={() => {}}
          />

          <MenuCard
            variant="ghost"
            icon={<DeviceScanIcon size={24} />}
            title={t('settings.tools.device_scan')}
            subtitle={t('settings.tools.device_scan_desc')}
            trailing="chevron"
            iconAlign="center"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
