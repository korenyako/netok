import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from '../components/icons/UIIcons';
import { useCloseBehaviorStore } from '../stores/closeBehaviorStore';
import type { CloseBehavior } from '../stores/closeBehaviorStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { cn } from '@/lib/utils';

interface CloseBehaviorSettingsScreenProps {
  onBack: () => void;
}

export function CloseBehaviorSettingsScreen({ onBack }: CloseBehaviorSettingsScreenProps) {
  const { t } = useTranslation();
  const { closeBehavior, setCloseBehavior } = useCloseBehaviorStore();

  const options: Array<{
    id: CloseBehavior;
    title: string;
    description: string;
  }> = [
    {
      id: 'minimize_to_tray',
      title: t('settings.general.close_minimize'),
      description: t('settings.general.close_minimize_desc'),
    },
    {
      id: 'close_app',
      title: t('settings.general.close_quit'),
      description: t('settings.general.close_quit_desc'),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('settings.general.close_behavior')}</h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = closeBehavior === option.id;
            return (
              <Card
                key={option.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected
                    ? 'border-muted-foreground/30 bg-accent hover:bg-accent/80'
                    : 'bg-transparent hover:bg-accent'
                )}
                onClick={() => setCloseBehavior(option.id)}
              >
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-base font-medium leading-normal">{option.title}</span>
                    <div className="text-sm text-muted-foreground leading-normal mt-0.5">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
