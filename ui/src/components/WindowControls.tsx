import { X } from './icons/UIIcons';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Button } from '@/components/ui/button';
import { useCloseBehaviorStore } from '../stores/closeBehaviorStore';

export function CloseButton() {
  const closeBehavior = useCloseBehaviorStore((s) => s.closeBehavior);

  const handleClose = () => {
    const win = getCurrentWindow();
    if (closeBehavior === 'minimize_to_tray') {
      win.hide();
    } else {
      win.close();
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClose}>
      <X className="w-5 h-5 text-muted-foreground" />
    </Button>
  );
}
