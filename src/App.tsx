import { Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireOwner } from '@/auth/guards'
import { Layout } from '@/components/Layout'
import { PagePlaceholder } from '@/components/PagePlaceholder'
import Login from '@/routes/Login'

const page = (title: string, note: string) => <PagePlaceholder title={title} note={note} />

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={page('Beranda', 'Ringkasan order hari ini, perlu approval, omzet (tahap 4).')} />
          <Route path="orders" element={page('Order', 'Daftar order dari DB (tahap 2).')} />
          <Route path="products" element={page('Produk', 'Produk & stok (tahap 4).')} />
          <Route element={<RequireOwner />}>
            <Route path="sales" element={page('Penjualan', 'Grafik penjualan (tahap 4).')} />
            <Route path="customers" element={page('Customer', 'Daftar customer (tahap 4).')} />
            <Route path="team" element={page('Tim', 'Karyawan & undangan (tahap 4).')} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
