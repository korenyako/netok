import { Copy, Check } from 'lucide-react'

export function CopiedChip() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-primary">
      <Check className="w-3 h-3" />
      Copied
    </span>
  )
}

export function CopyIcon() {
  return <Copy size={14} className="w-3.5 h-3.5 shrink-0" />
}
