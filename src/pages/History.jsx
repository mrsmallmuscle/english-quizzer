import { useNavigate } from 'react-router-dom'
import { getHistory, clearHistory } from '../utils/storage'
import { useState } from 'react'

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

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState(getHistory())
  const [expanded, setExpanded] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClear() {
    clearHistory()
    setHistory([])
    setConfirmClear(false)
  }

  if (history.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="quiz-header">
          <button onClick={() => navigate('/')} className="btn-back">← Quay lại</button>
          <span className="text-sm font-bold text-gray-500">Lịch sử thi</span>
          <div className="w-16" />
        </div>
        <div className="flex flex-col items-center justify-center mt-24 px-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 font-semibold">Chưa có lần thi nào được lưu.</p>
          <p className="text-gray-400 text-sm mt-1">Làm một bài test để bắt đầu!</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6 px-8">
            🚀 Làm bài ngay
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper pb-10">
      {/* Header */}
      <div className="quiz-header">
        <button onClick={() => navigate('/')} className="btn-back">← Quay lại</button>
        <span className="text-sm font-bold text-gray-600">📊 Lịch sử thi</span>
        <button
          onClick={() => setConfirmClear(true)}
          className="text-xs text-red-400 font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
        >
          Xoá tất cả
        </button>
      </div>

      {/* Confirm clear */}
      {confirmClear && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-red-700 mb-3">Xoá toàn bộ lịch sử?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmClear(false)} className="btn-secondary flex-1 py-2 text-sm">Huỷ</button>
            <button onClick={handleClear} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold text-sm">Xoá</button>
          </div>
        </div>
      )}

      {/* Stats tổng */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
        <div className="stat-box">
          <span className="stat-num">{history.length}</span>
          <span className="stat-label">Lần thi</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">
            {Math.round(history.reduce((s, h) => s + h.pct, 0) / history.length)}%
          </span>
          <span className="stat-label">TB chính xác</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">
            {Math.max(...history.map(h => h.pct))}%
          </span>
          <span className="stat-label">Cao nhất</span>
        </div>
      </div>

      {/* Danh sách */}
      <div className="px-4 space-y-3">
        {history.map((item, i) => {
          const isOpen = expanded === i
          const emoji  = item.pct === 100 ? '🏆' : item.pct >= 80 ? '🌟' : item.pct >= 60 ? '😊' : item.pct >= 40 ? '💪' : '📖'

          return (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Row tóm tắt */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <span className="text-2xl">{emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{item.correct}/{item.total} câu đúng</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.pct >= 80 ? 'bg-green-100 text-green-700' :
                      item.pct >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>{item.pct}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                </div>
                {/* Mini bar */}
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${item.pct >= 80 ? 'bg-green-400' : item.pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-gray-300 text-sm">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Chi tiết mở rộng */}
              {isOpen && item.answers && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chi tiết từng câu</p>
                  {item.answers.map((ans, j) => (
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
                                  : ans.question?.correct}
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
  )
}
