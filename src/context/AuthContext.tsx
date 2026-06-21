import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '@/services/api'

interface User {
  id: string; firstName: string; lastName: string
  email: string; phone?: string; role: string
  avatar?: string; _count?: { orders:number; wishlistItems:number; reviews:number }
}
interface AuthCtx {
  user: User|null; loading: boolean
  login: (email:string, password:string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  isAdmin: boolean; isLoggedIn: boolean
}

const Ctx = createContext<AuthCtx>(null!)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User|null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authAPI.profile()
      setUser(data.data)
    } catch {
      // token invalid - clear storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password })
    // backend returns { success, data: { user, accessToken, refreshToken } }
    const { user: u, accessToken, refreshToken } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(u)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') || ''
    try { await authAPI.logout(refreshToken) } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <Ctx.Provider value={{
      user, loading, login, logout, refresh,
      isAdmin: user?.role==='ADMIN',
      isLoggedIn: !!user,
    }}>
      {children}
    </Ctx.Provider>
  )
}
