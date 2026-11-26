import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useOrders } from '@/features/orders/hooks'
import { ORDER_LABEL, OrderBadge, PaymentBadge } from '@/features/orders/StatusBadge'
import { ORDER_STATUSES, type OrderStatus } from '@/features/orders/types'
import { formatRupiah, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const raw = params.get('status')
  const status = ORDER_STATUSES.find((s) => s === raw) as OrderStatus | undefined
  const { data, isPending, isError, refetch } = useOrders(status)

  const setStatus = (s?: OrderStatus) => setParams(s ? { status: s } : {}, { replace: true })
  const tabs: { key?: OrderStatus; label: string }[] = [{ label: 'Semua' }, ...ORDER_STATUSES.map((s) => ({ key: s, label: ORDER_LABEL[s] }))]

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
        {data && <span className="text-sm text-muted-foreground">{data.total} order</span>}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setStatus(t.key)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              t.key === status ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isPending ? (
        <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : isError ? (
        <Card className="p-6 text-center text-sm">
          Gagal memuat order. <button className="underline" onClick={() => refetch()}>Coba lagi</button>
        </Card>
      ) : data.orders.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">Belum ada order{status ? ' dengan status ini' : ''}.</Card>
      ) : (
        <>
          {/* Phone: cards */}
          <ul className="space-y-3 md:hidden">
            {data.orders.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`}>
                  <Card className="space-y-2 p-4 transition-colors active:bg-accent">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{o.customerName ?? 'Tanpa nama'}</p>
                        <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {o.itemCount} item · {timeAgo(o.createdAt)}</p>
                      </div>
                      <p className="shrink-0 font-semibold">{formatRupiah(o.totalAmount)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderBadge status={o.status} />
                      <PaymentBadge status={o.paymentStatus} />
                      {o.assignedTo && <span className="text-xs text-muted-foreground">→ {o.assignedTo.name}</span>}
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <Card className="hidden overflow-hidden p-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead>
                  <TableHead>Pembayaran</TableHead><TableHead>Petugas</TableHead><TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orders.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <TableCell>
                      <Link to={`/orders/${o.id}`} className="font-medium hover:underline">#{o.id.slice(0, 8)}</Link>
                      <p className="text-xs text-muted-foreground">{timeAgo(o.createdAt)}</p>
                    </TableCell>
                    <TableCell>{o.customerName ?? '—'}<p className="text-xs text-muted-foreground">{o.itemCount} item</p></TableCell>
                    <TableCell><OrderBadge status={o.status} /></TableCell>
                    <TableCell><PaymentBadge status={o.paymentStatus} /></TableCell>
                    <TableCell className="text-muted-foreground">{o.assignedTo?.name ?? 'Belum ditugaskan'}</TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(o.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
