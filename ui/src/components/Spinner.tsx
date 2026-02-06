import { Loader2 } from './icons/UIIcons'
import { cn } from '@/lib/utils'

export default function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />
}
