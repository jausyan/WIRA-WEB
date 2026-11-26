import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { BottomNav } from './BottomNav'
import { UserMenu } from './UserMenu'

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="hidden md:inline-flex" />
          <span className="font-semibold tracking-tight md:hidden">Wira</span>
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  )
}
