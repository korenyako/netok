import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertTriangle } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';

import { CloseButton } from '../components/WindowControls';
import { useVpnStore, type VpnConfig } from '../stores/vpnStore';
import { lookupIpLocation, validateVpnKey } from '../api/tauri';
import { notifications } from '../utils/notifications';

interface AddVpnScreenProps {
  onBack: () => void;
  onAdded: () => void;
}

type ValidationPhase = 'idle' | 'validating' | 'looking_up';

export function AddVpnScreen({ onBack, onAdded }: AddVpnScreenProps) {
  const { t } = useTranslation();
  const { configs, editingIndex, addConfig, updateConfig, removeConfig, hasDuplicateHost } = useVpnStore();

  const isEditMode = editingIndex !== null;
  const editingConfig = isEditMode ? configs[editingIndex] : null;

  const [keyValue, setKeyValue] = useState(editingConfig?.rawKey ?? '');
  const [phase, setPhase] = useState<ValidationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = async () => {
    const trimmed = keyValue.trim();
    if (!trimmed) return;

    setError(null);
    setWarning(null);

    // Step 1: Validate URI + ping server
    setPhase('validating');
    let validation;
    try {
      validation = await validateVpnKey(trimmed);
    } catch (e) {
      setError(String(e));
      setPhase('idle');
      return;
    }

    if (!validation.valid) {
      setError(validation.error || t('vpn.invalid_key'));
      setPhase('idle');
      return;
    }

    if (!validation.reachable && !warning) {
      setWarning(t('vpn.server_unreachable'));
      setPhase('idle');
      return;
    }

    // Check for duplicate server host
    if (hasDuplicateHost(validation.server, isEditMode ? editingIndex : undefined)) {
      notifications.error(t('vpn.duplicate_server'));
      setPhase('idle');
      return;
    }

    // Step 2: GeoIP lookup
    setPhase('looking_up');
    let country = '';
    let city = '';
    try {
      const location = await lookupIpLocation(validation.server);
      country = location.country ?? '';
      city = location.city ?? '';
    } catch (e) {
      console.error('IP location lookup failed:', e);
    }

    const newConfig: VpnConfig = {
      protocol: validation.protocol,
      serverHost: validation.server,
      country,
      city,
      ping: 0,
      rawKey: trimmed,
    };

    if (isEditMode) {
      updateConfig(editingIndex, newConfig);
    } else {
      addConfig(newConfig);
    }

    setPhase('idle');
    onAdded();
  };

  const handleDelete = () => {
    if (isEditMode) {
      removeConfig(editingIndex);
      onBack();
    }
  };

  const isBusy = phase !== 'idle';

  const buttonLabel = phase === 'validating'
    ? t('vpn.validating')
    : phase === 'looking_up'
      ? t('vpn.detecting_location')
      : isEditMode
        ? t('vpn.save_button')
        : t('vpn.add_button');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('vpn.title')}
          </h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 space-y-6 overflow-y-auto">
        {/* Server info card (edit mode) */}
        {isEditMode && editingConfig && (() => {
          const location = [editingConfig.city, editingConfig.country].filter(Boolean).join(', ');
          return (
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{editingConfig.serverHost || editingConfig.protocol}</p>
              {location && <p className="text-sm text-muted-foreground">{location}</p>}
              {editingConfig.protocol && (
                <span className="inline-block text-xs font-normal px-1.5 py-0.5 rounded text-purple-500 bg-purple-500/10 mt-1">{editingConfig.protocol}</span>
              )}
            </div>
          );
        })()}

        <p className="text-sm font-normal text-muted-foreground">
          {isEditMode ? t('vpn.key_hint_edit') : t('vpn.key_hint')}
        </p>

        <div className="flex-1 flex flex-col min-h-0 gap-3">
          {!isEditMode && (
            <span className="text-xs text-muted-foreground/60">{t('vpn.key_example')}</span>
          )}
          <textarea
            placeholder=""
            value={keyValue}
            onChange={(e) => { setKeyValue(e.target.value); setError(null); setWarning(null); }}
            className="flex-1 min-h-0 w-full rounded-lg bg-accent/50 p-3 text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-ring placeholder:font-light placeholder:text-muted-foreground/60 custom-scrollbar"
          />

          {/* Validation error */}
          {error && (
            <div className="flex items-start gap-2 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Reachability warning */}
          {warning && !error && (
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
              <span className="text-muted-foreground">{warning}</span>
            </div>
          )}

          <Button
            className="w-full text-sm font-medium shrink-0"
            onClick={handleSave}
            disabled={!keyValue.trim() || isBusy}
          >
            {buttonLabel}
          </Button>

          {isEditMode && !confirmingDelete && (
            <Button
              variant="ghost"
              className="w-full text-sm font-medium shrink-0"
              onClick={() => setConfirmingDelete(true)}
              disabled={isBusy}
            >
              {t('vpn.delete')}
            </Button>
          )}

          {isEditMode && confirmingDelete && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">{t('vpn.delete_confirm')}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-sm font-medium"
                  onClick={() => setConfirmingDelete(false)}
                >
                  {t('vpn.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 text-sm font-medium"
                  onClick={handleDelete}
                >
                  {t('vpn.delete')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
