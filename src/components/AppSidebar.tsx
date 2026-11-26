import { NavLink } from 'react-router-dom'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar'
import { isOwnerRole } from '@/auth/context'
import { useMe } from '@/auth/useMe'
import { navFor } from '@/nav'

export function AppSidebar() {
  const me = useMe()
  const items = navFor(me.data ? isOwnerRole(me.data.role) : false)
  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="px-4 py-5 text-lg font-semibold tracking-tight">Wira</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <NavLink to={to} end={to === '/'}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip={label} asChild>
                        <span><Icon /><span>{label}</span></span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
