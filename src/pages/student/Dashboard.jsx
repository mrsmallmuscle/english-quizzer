import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { fetchUserStats, fetchSessionHistory } from '../../utils/sessions'
import { supabase } from '../../utils/supabase'

export default function StudentDashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]           = useState(null)
  const [recent, setRecent]         = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchUserStats(user.id),
      fetchSessionHistory(user.id, 3),
      supabase.from('assignments').select('*').eq('student_id', user.id).order('assigned_at'),
    ]).then(([s, r, { data: assigns }]) => {
      setStats(s)
      setRecent(r)
      setAssignments(assigns || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  function startQuiz(curriculum, unit) {
    navigate('/', {
      state: { preselect: { curriculum, unit } }
    })
  }

  return (
    <div className="page-wrapper pb-10">
      <Navbar />
      <div className="px-4 pt-4 space-y-4">

        {/* Greeting */}
        <div className="pt-2">
          <p className="text-xl font-black text-gray-800">
            Xin chào, {profile?.display_name}! 👋
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Hôm nay học gì nhỉ?</p>
        </div>

        {/* Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-box">
              <span className="stat-num">{stats.totalSessions}</span>
              <span className="stat-label">Lần thi</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{stats.avgPct}%</span>
              <span className="stat-label">TB chính xác</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{stats.bestPct}%</span>
              <span className="stat-label">Cao nhất</span>
            </div>
          </div>
        )}

        {/* Bài được gán */}
        {!loading && (
          <div className="card">
            <p className="text-sm font-bold text-gray-700 mb-3">📋 Bài học được gán</p>
            {assignments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Chưa có bài nào được gán.</p>
                <p className="text-xs text-gray-300 mt-1">Liên hệ giáo viên để được gán bài học.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignments.map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100">
                    <span className="text-xl">📖</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-blue-800">
                        {a.curriculum}
                        {a.unit && <span className="text-blue-600"> · {a.unit}</span>}
                        {!a.unit && <span className="text-blue-400 text-xs"> (tất cả unit)</span>}
                      </p>
                      {a.note && (
                        <p className="text-xs text-blue-500 mt-0.5 italic">💬 {a.note}</p>
                      )}
                      {a.due_date && (
                        <p className="text-xs text-orange-500 mt-0.5">
                          ⏰ Hạn: {new Date(a.due_date).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => startQuiz(a.curriculum, a.unit)}
                      className="shrink-0 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all"
                    >
                      Ôn →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/" className="action-card blue">
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-bold mt-1">Làm bài tự do</span>
          </Link>
          <Link to="/student/history" className="action-card green">
            <span className="text-2xl">📊</span>
            <span className="text-sm font-bold mt-1">Lịch sử thi</span>
          </Link>
        </div>

        {/* Lần thi gần đây */}
        {!loading && recent.length > 0 && (
          <div className="card">
            <p className="text-sm font-bold text-gray-600 mb-3">🕐 Lần thi gần đây</p>
            <div className="space-y-2">
              {recent.map(s => {
                const emoji = s.pct === 100 ? '🏆' : s.pct >= 80 ? '🌟' : s.pct >= 60 ? '😊' : '💪'
                return (
                  <div key={s.id} className="flex items-center gap-3 py-1">
                    <span className="text-xl">{emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">
                        {s.score}/{s.total} câu đúng
                        {s.curriculum && (
                          <span className="text-xs text-blue-500 ml-2">
                            {s.curriculum}{s.unit ? ` · ${s.unit}` : ''}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.pct >= 80 ? 'bg-green-100 text-green-700' :
                      s.pct >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>{s.pct}%</span>
                  </div>
                )
              })}
            </div>
            <Link to="/student/history" className="block text-center text-xs text-blue-500 font-bold mt-3">
              Xem tất cả →
            </Link>
          </div>
        )}

        {!loading && !stats && (
          <div className="card text-center py-6">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-500 font-semibold text-sm">Chưa có lần thi nào.</p>
            <p className="text-gray-400 text-xs mt-1">Bắt đầu làm bài để thấy thống kê!</p>
          </div>
        )}

      </div>
    </div>
  )
}
