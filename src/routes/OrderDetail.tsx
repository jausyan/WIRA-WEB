import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrder } from '@/features/orders/hooks'
import { OrderActions } from '@/features/orders/OrderActions'
import { OrderBadge, PaymentBadge } from '@/features/orders/StatusBadge'
import { Timeline } from '@/features/orders/Timeline'
import { formatDateTime, formatRupiah, waLink } from '@/lib/format'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { data: o, isPending, error } = useOrder(id)

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/orders"><ArrowLeft className="size-4" /> Order</Link>
    </Button>
  )

  if (isPending) return <div className="space-y-4">{back}<Skeleton className="h-40 rounded-xl" /><Skeleton className="h-56 rounded-xl" /></div>
  if (error || !o) {
    const nf = error instanceof ApiError && error.status === 404
    return <div className="space-y-4">{back}<Card className="p-8 text-center text-sm text-muted-foreground">{nf ? 'Order tidak ditemukan.' : 'Gagal memuat order.'}</Card></div>
  }

  return (
    <div className="space-y-4">
      {back}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order #{o.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)} · {o.checkoutMethod.toUpperCase()}</p>
        </div>
        <div className="flex gap-2"><OrderBadge status={o.status} /><PaymentBadge status={o.payment?.status ?? null} /></div>
      </div>

      <OrderActions order={o} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Nama">{o.customer?.name ?? '—'}</Row>
            <Row label="Alamat">{o.customer?.address ?? '—'}</Row>
            <Row label="WhatsApp">{o.phone ?? '—'}</Row>
            {o.phone && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href={waLink(o.phone)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Chat di WhatsApp</a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pembayaran & Petugas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Status"><PaymentBadge status={o.payment?.status ?? null} /></Row>
            <Row label="Metode">{o.payment?.method?.toUpperCase() ?? '—'}</Row>
            <Row label="Jumlah">{o.payment ? formatRupiah(o.payment.amount) : '—'}</Row>
            <Row label="Dibayar">{o.payment?.paidAt ? formatDateTime(o.payment.paidAt) : '—'}</Row>
            <Separator />
            <Row label="Petugas">{o.assignedTo?.name ?? 'Belum ditugaskan'}</Row>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {o.items.map((i) => (
            <div key={i.id} className="flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{i.product?.name ?? 'Produk dihapus'}</p>
                <p className="text-xs text-muted-foreground">{i.qty} × {formatRupiah(i.unitPrice)}</p>
              </div>
              <p>{formatRupiah(i.subtotal)}</p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatRupiah(o.totalAmount)}</span></div>
          {o.notes && <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">Catatan: {o.notes}</p>}
        </CardContent>
      </Card>
    
      <Timeline order={o} />
    </div>
  )
}
