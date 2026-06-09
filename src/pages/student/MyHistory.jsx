import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { fetchSessionHistory, fetchUserStats } from '../../utils/sessions'

const TYPE_LABEL = {
  multiple_choice:  '🔤 Trắc nghiệm',
  fill_in_blank:    '✏️ Điền từ',
  reorder:          '🔀 Sắp xếp',
  error_correction: '🔍 Sửa lỗi',
  matching:         '🔗 Nối từ',
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function StudentHistory() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [sessions, setSessions]   = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchSessionHistory(user.id),
      fetchUserStats(user.id),
    ]).then(([s, st]) => {
      setSessions(s)
      setStats(st)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">📊</div>
            <p className="text-gray-400 text-sm">Đang tải lịch sử...</p>
          </div>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-20 px-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 font-semibold">Chưa có lần thi nào.</p>
          <p className="text-gray-400 text-sm mt-1">Làm một bài để bắt đầu!</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6 px-8">
            🚀 Làm bài ngay
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper pb-10">
      <Navbar />

      <div className="px-4 pt-4 space-y-4">
        <h2 className="text-lg font-black text-gray-800">📊 Lịch sử thi</h2>

        {/* Stats */}
        {stats && (
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

        {/* Danh sách */}
        <div className="space-y-3">
          {sessions.map((session, i) => {
            const isOpen = expanded === i
            const emoji  = session.pct === 100 ? '🏆' : session.pct >= 80 ? '🌟' : session.pct >= 60 ? '😊' : session.pct >= 40 ? '💪' : '📖'

            return (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Row tóm tắt */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">
                        {session.score}/{session.total} câu đúng
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        session.pct >= 80 ? 'bg-green-100 text-green-700' :
                        session.pct >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>{session.pct}%</span>
                      {session.curriculum && (
                        <span className="text-xs text-blue-500 font-semibold">
                          {session.curriculum}{session.unit ? ` · ${session.unit}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(session.played_at)}</p>
                  </div>
                  <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-2 rounded-full ${session.pct >= 80 ? 'bg-green-400' : session.pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${session.pct}%` }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Chi tiết */}
                {isOpen && session.answers?.length > 0 && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chi tiết từng câu</p>
                    {session.answers.map((ans, j) => (
                      <div key={j} className={`review-card ${ans.isCorrect ? 'correct' : 'wrong'}`}>
                        <div className="flex items-start gap-2 mb-1">
                          <span>{ans.isCorrect ? '✅' : '❌'}</span>
                          <div className="flex-1">
                            <span className="text-xs text-gray-400">
                              {TYPE_LABEL[ans.question?.type]} · Câu {j + 1}
                            </span>
                            <p className="font-semibold text-sm text-gray-800 mt-0.5">
                              {ans.question?.question}
                            </p>
                          </div>
                        </div>
                        {!ans.isCorrect && (
                          <>
                            <div className="text-sm bg-white/70 rounded-lg p-2 mt-1">
                              <span className="font-bold text-green-700">✓ Đáp án đúng: </span>
                              <span className="text-green-800">
                                {Array.isArray(ans.question?.correct)
                                  ? ans.question.correct.join(' ')
                                  : typeof ans.question?.correct === 'number'
                                    ? ans.question.options?.[ans.question.correct]
                                    : ans.question?.correct ?? '(xem giải thích)'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-2 bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                              💡 {ans.question?.explanation}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
