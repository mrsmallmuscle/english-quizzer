import { useAuth } from '../context/AuthContext'
import { signOut } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Navbar() {
  const { user, profile, isAdmin, isGuest } = useAuth()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Load pending join requests count cho admin
  useEffect(() => {
    if (!isAdmin) return
    supabase.from('join_requests').select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count || 0))
  }, [isAdmin])

  async function handleLogout() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        📚 <span>English Quizzer</span>
      </Link>

      {/* Right side */}
      {isGuest ? (
        <Link to="/login" className="btn-login-sm">Đăng nhập</Link>
      ) : (
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="navbar-avatar">
            <div className="relative">
              <span className="avatar-circle">
                {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
              </span>
              {/* Badge pending cho admin */}
              {isAdmin && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
              {profile?.display_name}
            </span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="navbar-dropdown">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-800 text-sm">{profile?.display_name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  <span className={`role-badge ${isAdmin ? 'admin' : 'student'}`}>
                    {isAdmin ? '⚙️ Admin' : '🎓 Học viên'}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {isAdmin ? (
                    <>
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        ⚙️ Admin Dashboard
                      </Link>
                      <Link to="/admin/students" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        👥 Quản lý học viên
                      </Link>
                      <Link to="/admin/join-requests" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        <span className="flex items-center justify-between">
                          <span>📬 Yêu cầu tham gia</span>
                          {pendingCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full ml-2">
                              {pendingCount}
                            </span>
                          )}
                        </span>
                      </Link>
                      <Link to="/admin/questions" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        📝 Quản lý câu hỏi
                      </Link>
                      <Link to="/admin/ai-import" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        🤖 AI Import
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/student" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        🎓 Dashboard của tôi
                      </Link>
                      <Link to="/student/history" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        📊 Lịch sử thi
                      </Link>
                      <Link to="/student/join" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        📬 Xin tham gia lớp
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button onClick={handleLogout} className="dropdown-item text-red-500 w-full text-left">
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
