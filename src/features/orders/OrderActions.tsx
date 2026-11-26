import { useState } from 'react'
import { Check, X } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { isOwnerRole } from '@/auth/context'
import { useMe } from '@/auth/useMe'
import { formatRupiah } from '@/lib/format'
import { useAdvanceStatus, useApprovePayment, useAssignees, useAssignOrder, useRejectPayment } from './hooks'
import type { OrderDetail } from './types'

const NEXT: Record<string, { status: string; label: string } | undefined> = {
  PAID: { status: 'PROCESSING', label: 'Mulai proses' },
  PROCESSING: { status: 'SHIPPED', label: 'Tandai dikirim' },
  SHIPPED: { status: 'DONE', label: 'Tandai selesai' },
}

export function OrderActions({ order }: { order: OrderDetail }) {
  const me = useMe().data
  const owner = me ? isOwnerRole(me.role) : false
  const paymentId = order.payment?.id ?? ''

  const approve = useApprovePayment(order.id, paymentId)
  const reject = useRejectPayment(order.id, paymentId)
  const advance = useAdvanceStatus(order.id)
  const assign = useAssignOrder(order.id)
  const open = !['DONE', 'CANCELLED'].includes(order.status)
  const assignees = useAssignees(owner && open)

  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')

  const awaiting = order.status === 'PENDING_PAYMENT' && order.payment?.status === 'PENDING'
  const next = NEXT[order.status]
  const mine = order.assignedTo?.id === me?.id
  const canAdvance = next && (owner || mine)

  if (!awaiting && !next && !(owner && open)) return null

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Tindakan</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {awaiting && (
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg" onClick={() => setConfirm('approve')} disabled={approve.isPending}>
              <Check className="size-4" /> Approve
            </Button>
            <Button size="lg" variant="outline" onClick={() => setConfirm('reject')} disabled={reject.isPending}>
              <X className="size-4" /> Reject
            </Button>
          </div>
        )}

        {next && (
          canAdvance ? (
            <Button size="lg" className="w-full" disabled={advance.isPending} onClick={() => advance.mutate(next.status)}>
              {next.label}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Hanya petugas yang ditugaskan yang bisa memperbarui progres.</p>
          )
        )}

        {owner && open && (
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Petugas</p>
            <Select value={order.assignedTo?.id ?? ''} onValueChange={(v) => assign.mutate(v)} disabled={assign.isPending}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Belum ditugaskan" /></SelectTrigger>
              <SelectContent>
                {assignees.data?.assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}{a.role !== 'STAFF' ? ' (owner)' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirm === 'approve'} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Pastikan uang {formatRupiah(order.totalAmount)} sudah masuk. Order akan ditandai dibayar dan otomatis ditugaskan ke karyawan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => approve.mutate()}>Ya, approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirm === 'reject'} onOpenChange={(o) => { if (!o) { setConfirm(null); setReason('') } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>Order akan dibatalkan dan stok dikembalikan. Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="Alasan (opsional)" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => reject.mutate(reason)}>
              Ya, tolak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
