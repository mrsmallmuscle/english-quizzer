import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

/**
 * Bảo vệ route theo role
 * @param {string} role - 'student' | 'admin' | undefined (chỉ cần login)
 */
export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">📚</div>
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (role === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
