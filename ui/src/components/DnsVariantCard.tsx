import { useState, KeyboardEvent, MouseEvent } from 'react';
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
}: DnsVariantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  const handleChevronClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleExpanded();
  };

  const handleApplyClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onApply();
  };

  return (
    <div
      className={`w-full rounded-[12px] p-4 text-left focus:outline-none transition-colors ${
        isActive ? 'ring-2 ring-primary' : ''
      } bg-background-tertiary hover:bg-neutral-100 dark:hover:bg-background-hover`}
    >
      <div
        className="flex items-start justify-between gap-2 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={handleHeaderKeyDown}
      >
        <div className={`flex items-start flex-1 ${isSelected ? 'gap-2' : ''}`}>
          {isSelected && (
            <span className="text-primary mt-0.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 16 16"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8l3 3 7-7" />
              </svg>
            </span>
          )}
          <h3 className="text-base font-medium text-foreground leading-5">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleChevronClick}
          className="w-6 h-6 flex items-center justify-center text-foreground-tertiary hover:text-foreground transition-colors"
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {description && (
            <p className="text-sm text-foreground-secondary leading-[19.6px]">
              {description}
            </p>
          )}
          <p className={DNS_VARIANT_IP_CLASS}>{dnsAddresses}</p>
          <button
            type="button"
            onClick={handleApplyClick}
            disabled={applyDisabled || isApplying}
            className="w-full h-10 rounded-[10px] bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center"
          >
            {isApplying ? (
              <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              applyLabel
            )}
          </button>
        </div>
      )}
    </div>
  );
}
