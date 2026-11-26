import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from './types'

const tone = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-info/15 text-info',
  muted: 'bg-muted text-muted-foreground',
} as const

export const ORDER_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Belum bayar',
  PAID: 'Dibayar',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  DONE: 'Selesai',
  CANCELLED: 'Batal',
}
const orderTone: Record<OrderStatus, keyof typeof tone> = {
  PENDING_PAYMENT: 'warning', PAID: 'info', PROCESSING: 'info', SHIPPED: 'info', DONE: 'success', CANCELLED: 'danger',
}

const PAY_LABEL: Record<PaymentStatus, string> = { PENDING: 'Menunggu', PAID: 'Lunas', FAILED: 'Gagal', EXPIRED: 'Kedaluwarsa' }
const payTone: Record<PaymentStatus, keyof typeof tone> = { PENDING: 'warning', PAID: 'success', FAILED: 'danger', EXPIRED: 'muted' }

export function OrderBadge({ status }: { status: OrderStatus }) {
  return <Badge variant="secondary" className={cn('border-0 font-medium', tone[orderTone[status]])}>{ORDER_LABEL[status]}</Badge>
}

export function PaymentBadge({ status }: { status: PaymentStatus | null }) {
  if (!status) return <Badge variant="secondary" className={cn('border-0', tone.muted)}>Tanpa pembayaran</Badge>
  return <Badge variant="secondary" className={cn('border-0 font-medium', tone[payTone[status]])}>Bayar: {PAY_LABEL[status]}</Badge>
}
