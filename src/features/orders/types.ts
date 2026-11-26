export const ORDER_STATUSES = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'

export type OrderListItem = {
  id: string
  status: OrderStatus
  totalAmount: number
  checkoutMethod: string
  createdAt: string
  customerName: string | null
  phone: string | null
  paymentStatus: PaymentStatus | null
  assignedTo: { id: string; name: string } | null
  itemCount: number
}

export type OrderDetail = {
  id: string
  status: OrderStatus
  totalAmount: number
  checkoutMethod: string
  notes: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  customer: { id: string; name: string | null; address: string | null } | null
  payment: { id: string; status: PaymentStatus; method: string; amount: number; paidAt: string | null; createdAt: string } | null
  assignedTo: { id: string; name: string } | null
  events: OrderEvent[]
  items: { id: string; qty: number; unitPrice: number; subtotal: number; product: { name: string; sku: string | null } | null }[]
}

export type OrderEvent = {
  id: string
  type: 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'ASSIGNED' | 'STATUS_CHANGED'
  fromStatus: string | null
  toStatus: string | null
  note: string | null
  createdAt: string
  actor: string | null
  assignee: string | null
}

export type Assignee = { id: string; name: string; role: 'OWNER' | 'ADMIN' | 'STAFF' }
