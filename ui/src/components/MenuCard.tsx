import { type ReactNode } from 'react';
import { ChevronRight, Check } from '@/components/icons/UIIcons';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type MenuCardVariant =
  | 'ghost'       // transparent + hover:accent (navigation, unselected items)
  | 'filled'      // accent bg + hover:accent/80 (inactive status with background)
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
  /** Secondary description text */
  subtitle?: string;
  /** Right side element: 'chevron', 'check', or custom ReactNode */
  trailing?: 'chevron' | 'check' | ReactNode;
  /** Click handler - if not provided, card is not interactive */
  onClick?: () => void;
  /** Make title text muted (for inactive states) */
  muted?: boolean;
  /** Icon vertical alignment: 'start' aligns to title, 'center' aligns to card */
  iconAlign?: 'start' | 'center';
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<MenuCardVariant, string> = {
  ghost: 'bg-transparent hover:bg-accent',
  filled: 'bg-accent hover:bg-accent/80',
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
  subtitle,
  trailing,
  onClick,
  muted,
  iconAlign = 'start',
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
            "text-base font-medium leading-normal flex items-center gap-2",
            muted && "text-muted-foreground"
          )}>
            {title}
            {badge && (
              <span className="text-xs font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded">{badge}</span>
            )}
          </div>
          {subtitle && (
            <div className="text-sm font-normal text-muted-foreground leading-normal mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {trailingElement}
      </CardContent>
    </Card>
  );
}
