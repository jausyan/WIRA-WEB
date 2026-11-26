import { BarChart3, Home, Package, ShoppingBag, Users, UserCog, type LucideIcon } from 'lucide-react'

export type NavItem = { to: string; label: string; icon: LucideIcon; mobile?: boolean; ownerOnly?: boolean }

export const NAV: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home, mobile: true },
  { to: '/orders', label: 'Order', icon: ShoppingBag, mobile: true },
  { to: '/sales', label: 'Penjualan', icon: BarChart3, mobile: true, ownerOnly: true },
  { to: '/customers', label: 'Customer', icon: Users, ownerOnly: true },
  { to: '/products', label: 'Produk', icon: Package },
  { to: '/team', label: 'Tim', icon: UserCog, ownerOnly: true },
]

export function navFor(isOwner: boolean) {
  return NAV.filter((n) => isOwner || !n.ownerOnly)
}
