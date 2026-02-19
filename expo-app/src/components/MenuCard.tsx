import React, { type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Check, Loader2 } from './icons/UIIcons';
import { useTheme } from '../hooks/useTheme';

export type MenuCardVariant =
  | 'ghost'
  | 'filled'
  | 'highlighted'
  | 'selected'
  | 'static'
  | 'disabled';

interface MenuCardProps {
  variant?: MenuCardVariant;
  icon?: ReactNode;
  title: string;
  badge?: string;
  subtitle?: string | ReactNode;
  trailing?: 'chevron' | 'check' | 'spinner' | ReactNode;
  onClick?: () => void;
  muted?: boolean;
  checked?: boolean | 'spinner';
}

export function MenuCard({
  variant = 'ghost',
  icon,
  title,
  badge,
  subtitle,
  trailing,
  onClick,
  muted,
  checked,
}: MenuCardProps) {
  const { themeColors } = useTheme();
  const isInteractive = variant !== 'static' && variant !== 'disabled' && onClick;

  const bgColor = (() => {
    switch (variant) {
      case 'filled': return themeColors.accent;
      case 'highlighted': return themeColors.primary + '1A';
      case 'selected': return themeColors.primary + '1A';
      case 'disabled': return themeColors.accent;
      default: return 'transparent';
    }
  })();

  const trailingElement = (() => {
    if (trailing === 'chevron') {
      return <ChevronRight size={16} color={themeColors.mutedForeground} />;
    }
    if (trailing === 'check') {
      return <Check size={20} color={themeColors.primary} />;
    }
    if (trailing === 'spinner') {
      return <Loader2 size={20} color={themeColors.mutedForeground} />;
    }
    return trailing;
  })();

  const content = (
    <View style={[
      styles.card,
      {
        backgroundColor: bgColor,
        borderColor: variant === 'selected' ? themeColors.primary : 'transparent',
        borderWidth: variant === 'selected' ? 1 : 0,
        opacity: variant === 'disabled' ? 0.6 : 1,
      },
    ]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: muted ? themeColors.mutedForeground : themeColors.foreground },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: themeColors.primary + '1A' }]}>
              <Text style={[styles.badgeText, { color: themeColors.primary }]}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && (
          typeof subtitle === 'string' ? (
            <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : (
            <View style={styles.subtitleContainer}>{subtitle}</View>
          )
        )}
      </View>
      {trailingElement && <View style={styles.trailing}>{trailingElement}</View>}
      {checked === 'spinner' ? (
        <View style={styles.trailing}>
          <Loader2 size={20} color={themeColors.mutedForeground} />
        </View>
      ) : checked === true ? (
        <View style={styles.trailing}>
          <Check size={20} color={themeColors.primary} />
        </View>
      ) : null}
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onClick}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    marginTop: 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  subtitleContainer: {
    marginTop: 2,
  },
  trailing: {
    flexShrink: 0,
    alignSelf: 'center',
  },
});
