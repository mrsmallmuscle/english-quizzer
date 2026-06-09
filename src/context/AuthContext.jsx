import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getProfile } from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // Supabase auth user
  const [profile, setProfile] = useState(null)   // profiles table row
  const [loading, setLoading] = useState(true)

  async function loadProfile(authUser) {
    if (!authUser) { setProfile(null); return }
    try {
      const p = await getProfile(authUser.id)
      setProfile(p)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    // Lấy session hiện tại khi app khởi động
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u).finally(() => setLoading(false))
    })

    // Lắng nghe thay đổi auth (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin   = profile?.role === 'admin'
  const isStudent = profile?.role === 'student'
  const isGuest   = !user

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isStudent, isGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
