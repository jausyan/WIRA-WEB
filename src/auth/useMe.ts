import { useQuery } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { useAuth, type Me } from './context'

export function useMe() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['me', session?.user.id],
    queryFn: () => api<Me>('/admin/me'),
    enabled: Boolean(session),
    retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
    staleTime: 5 * 60_000,
  })
}
