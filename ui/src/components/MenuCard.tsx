import { type ReactNode } from 'react';
import { ChevronRight, Check, Loader2 } from '@/components/icons/UIIcons';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type MenuCardVariant =
  | 'ghost'       // transparent + hover:accent (navigation, unselected items)
  | 'filled'      // accent bg + hover:accent-hover (inactive status with background)
  | 'highlighted' // primary/10 + hover:primary/15 (active status, no border)
  | 'selected'    // primary/10 + border-primary (selected item in lists)
  | 'static'      // transparent, no hover (info display)
  | 'disabled';   // transparent + opacity-60

interface MenuCardProps {
  /** Visual variant of the card */
  variant?: MenuCardVariant;
  /** Icon displayed on the left */
  icon?: ReactNode;
  /** Main title text */
  title: string;
  /** Badge text displayed next to title */
  badge?: string;
  /** Custom badge styling (overrides default primary color) */
  badgeClassName?: string;
  /** Extra element rendered after badge in the title row */
  titleTrailing?: ReactNode;
  /** Secondary description text (string or ReactNode for multi-line content) */
  subtitle?: ReactNode;
  /** Right side element: 'chevron', 'check', 'spinner', 'switch', or custom ReactNode */
  trailing?: 'chevron' | 'check' | 'spinner' | 'switch' | ReactNode;
  /** Switch state (only used when trailing='switch') */
  switchChecked?: boolean;
  /** Switch change handler (only used when trailing='switch') */
  onSwitchChange?: (checked: boolean) => void;
  /** Switch disabled state (only used when trailing='switch') */
  switchDisabled?: boolean;
  /** Click handler - if not provided, card is not interactive */
  onClick?: () => void;
  /** Make title text muted (for inactive states) */
  muted?: boolean;
  /** Icon vertical alignment: 'start' aligns to title, 'center' aligns to card */
  iconAlign?: 'start' | 'center';
  /** Selection checkmark on the right (undefined = hidden, false = hidden, true = show check, 'spinner' = show spinner) */
  checked?: boolean | 'spinner';
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<MenuCardVariant, string> = {
  ghost: 'bg-transparent hover:bg-accent',
  filled: 'bg-accent hover:bg-accent-hover',
  highlighted: 'bg-primary/10 hover:bg-primary/15',
  selected: 'border-primary bg-primary/10 hover:bg-primary/15',
  static: 'bg-transparent',
  disabled: 'bg-accent opacity-60',
};

export function MenuCard({
  variant = 'ghost',
  icon,
  title,
  badge,
  badgeClassName,
  titleTrailing,
  subtitle,
  trailing,
  switchChecked,
  onSwitchChange,
  switchDisabled,
  onClick,
  muted,
  iconAlign = 'start',
  checked,
  className,
}: MenuCardProps) {
  const isInteractive = variant !== 'static' && variant !== 'disabled' && onClick;

  const trailingElement = (() => {
    if (trailing === 'chevron') {
      return <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center rtl-flip" />;
    }
    if (trailing === 'check') {
      return <Check className="w-5 h-5 text-primary shrink-0 self-center" />;
    }
    if (trailing === 'spinner') {
      return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0 self-center" />;
    }
    if (trailing === 'switch') {
      return (
        <div className="shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={switchChecked}
            onCheckedChange={onSwitchChange}
            disabled={switchDisabled}
          />
        </div>
      );
    }
    return trailing;
  })();

  return (
    <Card
      className={cn(
        'transition-colors',
        variantStyles[variant],
        isInteractive && 'cursor-pointer',
        className
      )}
      onClick={isInteractive ? onClick : undefined}
    >
      <CardContent className={cn(
        "flex py-3",
        iconAlign === 'center' ? 'items-center gap-4 px-5' : 'items-start gap-3 px-4'
      )}>
        {icon && (
          <span className={cn("shrink-0", iconAlign === 'start' && "mt-0.5")}>
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "flex items-baseline gap-2 text-base font-medium leading-normal",
            muted && "text-muted-foreground"
          )}>
            <span className="truncate">{title}</span>
            {badge && (
              <span className={cn("text-xs font-normal px-1.5 py-0.5 rounded shrink-0 self-center", badgeClassName || "text-primary bg-primary/10")}>{badge}</span>
            )}
            {titleTrailing && <span className="ml-auto shrink-0">{titleTrailing}</span>}
          </div>
          {subtitle && (
            <div className="text-sm font-normal text-muted-foreground leading-normal mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {trailingElement}
        {checked === 'spinner'
          ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0 self-center" />
          : checked === true
            ? <Check className="w-5 h-5 text-primary shrink-0 self-center" />
            : null
        }
      </CardContent>
    </Card>
  );
}
