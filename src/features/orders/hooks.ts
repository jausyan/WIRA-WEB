import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Assignee, OrderDetail, OrderListItem, OrderStatus } from './types'

const POLL_MS = 10_000

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', status ?? 'all'],
    queryFn: () => api<{ orders: OrderListItem[]; total: number }>(`/admin/orders${status ? `?status=${status}` : ''}`),
    refetchInterval: POLL_MS,
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api<OrderDetail>(`/admin/orders/${id}`),
    enabled: Boolean(id),
    refetchInterval: POLL_MS,
  })
}

// ── Aksi ────────────────────────────────────────────────────────────────────

const ERRORS: Record<string, string> = {
  not_awaiting_payment: 'Pembayaran ini sudah diproses.',
  already_processed: 'Sudah diproses oleh orang lain. Data diperbarui.',
  invalid_transition: 'Status tidak bisa diubah ke tahap itu.',
  not_assigned_to_you: 'Order ini bukan tugas kamu.',
  invalid_assignee: 'Petugas tidak valid.',
  order_closed: 'Order sudah selesai/dibatalkan.',
  forbidden: 'Tidak punya izin.',
}

function useAction<V>(orderId: string, fn: (v: V) => Promise<unknown>, success: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => toast.success(success),
    onError: (e) => toast.error(e instanceof ApiError ? (ERRORS[e.code] ?? 'Gagal, coba lagi.') : 'Gagal, coba lagi.'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

const post = (path: string, body?: unknown, method = 'POST') =>
  api(path, { method, body: body ? JSON.stringify(body) : undefined })

export const useApprovePayment = (orderId: string, paymentId: string) =>
  useAction<void>(orderId, () => post(`/admin/payments/${paymentId}/approve`), 'Pembayaran disetujui')

export const useRejectPayment = (orderId: string, paymentId: string) =>
  useAction<string>(orderId, (reason) => post(`/admin/payments/${paymentId}/reject`, { reason }), 'Pembayaran ditolak, order dibatalkan')

export const useAdvanceStatus = (orderId: string) =>
  useAction<string>(orderId, (status) => post(`/admin/orders/${orderId}/status`, { status }, 'PATCH'), 'Status diperbarui')

export const useAssignOrder = (orderId: string) =>
  useAction<string>(orderId, (userId) => post(`/admin/orders/${orderId}/assign`, { userId }), 'Petugas diperbarui')

export function useAssignees(enabled: boolean) {
  return useQuery({
    queryKey: ['assignees'],
    queryFn: () => api<{ assignees: Assignee[] }>('/admin/assignees'),
    enabled,
    staleTime: 5 * 60_000,
  })
}
