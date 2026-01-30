import { useState, type MouseEvent } from 'react';
import { ChevronDown, ChevronUp, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { DNS_VARIANT_IP_CLASS } from '../constants/dnsVariantStyles';

interface DnsVariantCardProps {
  title: string;
  description?: string;
  dnsAddresses: string;
  isSelected: boolean;
  isActive?: boolean;
  onApply: () => void;
  applyLabel: string;
  isApplying?: boolean;
  applyDisabled?: boolean;
  /** Controlled expansion state. If provided, internal state is ignored. */
  expanded?: boolean;
  /** Called when the user toggles the card open/closed. */
  onToggle?: () => void;
}

export function DnsVariantCard({
  title,
  description,
  dnsAddresses,
  isSelected,
  isActive = false,
  onApply,
  applyLabel,
  isApplying = false,
  applyDisabled = false,
  expanded,
  onToggle,
}: DnsVariantCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;
  const setIsExpanded = onToggle
    ? (open: boolean) => { if (open !== isExpanded) onToggle(); }
    : (open: boolean) => setInternalExpanded(open);

  const handleApplyClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onApply();
  };

  return (
    <Card
      className={cn(
        'w-full p-4 text-left transition-colors',
        'hover:bg-accent',
        !isSelected && 'bg-transparent',
        !isExpanded && 'cursor-pointer'
      )}
      onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div
            className="flex items-start justify-between gap-2 cursor-pointer"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center flex-1 gap-2">
              <span className={cn(
                'flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 mt-px',
                isSelected ? 'border-primary' : 'border-muted-foreground'
              )}>
                {isSelected && (
                  <Circle className="w-2 h-2 fill-primary text-primary" />
                )}
              </span>
              <h3 className="text-base font-medium text-foreground leading-normal">
                {title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 space-y-3">
            {description && (
              <p className="text-sm text-muted-foreground leading-normal">
                {description}
              </p>
            )}
            <p className={DNS_VARIANT_IP_CLASS}>{dnsAddresses}</p>
            <Button
              variant="default"
              onClick={handleApplyClick}
              disabled={applyDisabled || isApplying}
              className="w-full h-10"
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                applyLabel
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
