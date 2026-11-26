import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import { ORDER_LABEL } from './StatusBadge'
import type { OrderDetail, OrderEvent, OrderStatus } from './types'

const label = (s: string | null) => (s ? (ORDER_LABEL[s as OrderStatus] ?? s) : '')

function describe(e: OrderEvent) {
  switch (e.type) {
    case 'PAYMENT_APPROVED': return 'Pembayaran disetujui'
    case 'PAYMENT_REJECTED': return 'Pembayaran ditolak, order dibatalkan'
    case 'ASSIGNED': return `${e.note === 'otomatis' ? 'Otomatis ditugaskan' : 'Ditugaskan'} ke ${e.assignee ?? '—'}`
    case 'STATUS_CHANGED': return `Status: ${label(e.fromStatus)} → ${label(e.toStatus)}`
  }
}

export function Timeline({ order }: { order: OrderDetail }) {
  const rows = [
    { id: 'created', at: order.createdAt, text: 'Order dibuat oleh AI Agent', by: null as string | null, note: null as string | null },
    ...order.events.map((e) => ({
      id: e.id, at: e.createdAt, text: describe(e), by: e.actor, note: e.type === 'PAYMENT_REJECTED' ? e.note : null,
    })),
  ]
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Riwayat</CardTitle></CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l pl-5">
          {rows.map((r) => (
            <li key={r.id} className="relative text-sm">
              <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-primary" />
              <p className="font-medium">{r.text}</p>
              {r.note && <p className="text-muted-foreground">Alasan: {r.note}</p>}
              <p className="text-xs text-muted-foreground">{formatDateTime(r.at)}{r.by ? ` · ${r.by}` : ''}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
