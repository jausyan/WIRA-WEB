import { LogOut } from 'lucide-react'
import { useAuth } from '@/auth/context'
import { useMe } from '@/auth/useMe'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const { session, signOut } = useAuth()
  const me = useMe().data
  if (!me) return null
  const avatar = session?.user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-medium">{me.name}</p>
        <p className="text-xs text-muted-foreground">{me.role === 'STAFF' ? 'Karyawan' : 'Owner'}</p>
      </div>
      <Avatar className="size-8">
        <AvatarImage src={avatar} alt={me.name} referrerPolicy="no-referrer" />
        <AvatarFallback>{me.name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Button variant="ghost" size="icon" onClick={signOut} aria-label="Keluar">
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
