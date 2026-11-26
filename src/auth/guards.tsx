import { Loader2 } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api'
import { isOwnerRole, useAuth } from './context'
import { useMe } from './useMe'

function FullScreen({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-svh place-items-center bg-background p-6">{children}</div>
}

export function RequireAuth() {
  const { session, loading, signOut } = useAuth()
  const me = useMe()

  if (loading || (session && me.isPending)) {
    return <FullScreen><Loader2 className="size-6 animate-spin text-muted-foreground" /></FullScreen>
  }
  if (!session) return <Navigate to="/login" replace />

  if (me.isError) {
    const denied = me.error instanceof ApiError && (me.error.status === 403 || me.error.status === 401)
    return (
      <FullScreen>
        <div className="max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold">{denied ? 'Akun belum terdaftar' : 'Server tidak dapat dihubungi'}</h1>
          <p className="text-sm text-muted-foreground">
            {denied
              ? `${session.user.email} belum terdaftar. Minta owner mengundang email ini.`
              : 'Coba lagi beberapa saat.'}
          </p>
          <div className="flex justify-center gap-2">
            {!denied && <Button variant="outline" onClick={() => me.refetch()}>Coba lagi</Button>}
            <Button onClick={signOut}>Keluar</Button>
          </div>
        </div>
      </FullScreen>
    )
  }
  return <Outlet />
}

export function RequireOwner() {
  const me = useMe()
  if (me.data && !isOwnerRole(me.data.role)) return <Navigate to="/" replace />
  return <Outlet />
}
