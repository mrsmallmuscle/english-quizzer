import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { supabase } from '../../utils/supabase'

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: totalQuestions },
        { count: totalStudents },
        { count: totalSessions },
        { data: recentSessions },
      ] = await Promise.all([
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('quiz_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_sessions')
          .select('score, total, pct, played_at, curriculum, unit, profiles(display_name)')
          .order('played_at', { ascending: false })
          .limit(5),
      ])

      setStats({ totalQuestions, totalStudents, totalSessions })
      setRecent(recentSessions || [])
      setLoading(false)
    }
    load().catch(console.error)
  }, [])

  return (
    <div className="page-wrapper pb-10">
      <Navbar />
      <div className="px-4 pt-4 space-y-4">

        <div className="pt-2">
          <p className="text-xl font-black text-gray-800">⚙️ Admin Dashboard</p>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý hệ thống English Quizzer</p>
        </div>

        {/* Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-box">
              <span className="stat-num">{stats.totalQuestions}</span>
              <span className="stat-label">Câu hỏi</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{stats.totalStudents}</span>
              <span className="stat-label">Học viên</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{stats.totalSessions}</span>
              <span className="stat-label">Lần thi</span>
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/students" className="action-card blue">
            <span className="text-2xl">👥</span>
            <span className="text-sm font-bold mt-1">Học viên</span>
          </Link>
          <Link to="/admin/questions" className="action-card green">
            <span className="text-2xl">📝</span>
            <span className="text-sm font-bold mt-1">Câu hỏi</span>
          </Link>
          <Link to="/admin/ai-import" className="action-card purple">
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-bold mt-1">AI Import</span>
          </Link>
          <Link to="/" className="action-card orange">
            <span className="text-2xl">🎮</span>
            <span className="text-sm font-bold mt-1">Xem app</span>
          </Link>
        </div>

        {/* Lần thi gần đây */}
        {!loading && recent.length > 0 && (
          <div className="card">
            <p className="text-sm font-bold text-gray-600 mb-3">🕐 Lần thi gần đây</p>
            <div className="space-y-2">
              {recent.map((s, i) => {
                const emoji = s.pct === 100 ? '🏆' : s.pct >= 80 ? '🌟' : s.pct >= 60 ? '😊' : '💪'
                return (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <span className="text-lg">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {s.profiles?.display_name ?? 'Guest'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {s.score}/{s.total} câu
                        {s.curriculum && ` · ${s.curriculum}${s.unit ? ` ${s.unit}` : ''}`}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      s.pct >= 80 ? 'bg-green-100 text-green-700' :
                      s.pct >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>{s.pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
