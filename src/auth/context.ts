import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type Me = {
  id: string
  tenantId: string
  tenantName: string | null
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
}

export type AuthState = {
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const isOwnerRole = (role: Me['role']) => role !== 'STAFF'
