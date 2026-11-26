const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
export const formatRupiah = (n: number) => rupiah.format(n)

const dt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const formatDateTime = (iso: string) => dt.format(new Date(iso))

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'baru saja'
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`
  return dt.format(new Date(iso))
}

/** "0812…" / "62812…" → "62812…" untuk tautan wa.me */
export function waLink(phone: string) {
  const d = phone.replace(/\D/g, '')
  return `https://wa.me/${d.startsWith('0') ? '62' + d.slice(1) : d}`
}
