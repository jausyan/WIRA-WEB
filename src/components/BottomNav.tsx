import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { isOwnerRole } from '@/auth/context'
import { useMe } from '@/auth/useMe'
import { navFor } from '@/nav'

export function BottomNav() {
  const me = useMe()
  const items = navFor(me.data ? isOwnerRole(me.data.role) : false).filter((n) => n.mobile)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground',
                  isActive && 'font-medium text-primary',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
