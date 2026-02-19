import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '../components/icons/UIIcons';
import { MenuCard } from '../components/MenuCard';
import { useTheme } from '../hooks/useTheme';
import type { DnsProvider } from '../api/types';
import { setDns } from '../api/network';

interface DnsProvidersScreenProps {
  onBack?: () => void;
}

interface ProviderCard {
  id: string;
  nameKey: string;
  descKey: string;
  dnsPayload: DnsProvider;
}

const PROVIDER_CARDS: ProviderCard[] = [
  {
    id: 'cloudflare',
    nameKey: 'dns_providers.cloudflare',
    descKey: 'dns_providers.goal_fast_desc',
    dnsPayload: { type: 'Cloudflare', variant: 'Standard' },
  },
  {
    id: 'adguard',
    nameKey: 'dns_providers.adguard',
    descKey: 'dns_providers.goal_adblock_desc',
    dnsPayload: { type: 'AdGuard', variant: 'Standard' },
  },
  {
    id: 'quad9',
    nameKey: 'dns_providers.quad9',
    descKey: 'dns_providers.goal_secure_desc',
    dnsPayload: { type: 'Quad9', variant: 'Recommended' },
  },
];

function RadioDot({ selected, applying, color, primaryColor }: {
  selected: boolean;
  applying: boolean;
  color: string;
  primaryColor: string;
}) {
  if (applying) return <ActivityIndicator size="small" color={color} />;
  return (
    <View style={[styles.radioDot, { borderColor: selected ? primaryColor : color + '66' }]}>
      {selected && <View style={[styles.radioDotInner, { backgroundColor: primaryColor }]} />}
    </View>
  );
}

export function DnsProvidersScreen({ onBack }: DnsProvidersScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const [selectedId, setSelectedId] = useState<string>('system');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleSelect = async (id: string, payload: DnsProvider) => {
    if (applyingId) return;
    if (id === selectedId) return;
    setApplyingId(id);
    try {
      await setDns(payload);
      setSelectedId(id);
    } catch (err) {
      console.error('Failed to set DNS:', err);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.headerButton}>
            <ArrowLeft size={20} color={themeColors.mutedForeground} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('dns_providers.title')}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <View style={styles.cardList}>
          {/* System DNS */}
          <MenuCard
            variant="ghost"
            icon={
              <RadioDot
                selected={selectedId === 'system'}
                applying={applyingId === 'system'}
                color={themeColors.mutedForeground}
                primaryColor={themeColors.primary}
              />
            }
            title={t('dns_providers.system')}
            subtitle={t('dns_providers.system_desc')}
            onClick={() => handleSelect('system', { type: 'Auto' })}
          />

          {PROVIDER_CARDS.map((card) => (
            <MenuCard
              key={card.id}
              variant="ghost"
              icon={
                <RadioDot
                  selected={selectedId === card.id}
                  applying={applyingId === card.id}
                  color={themeColors.mutedForeground}
                  primaryColor={themeColors.primary}
                />
              }
              title={t(card.nameKey)}
              subtitle={t(card.descKey)}
              onClick={() => handleSelect(card.id, card.dnsPayload)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingBottom: 16,
  },
  cardList: {
    gap: 8,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
