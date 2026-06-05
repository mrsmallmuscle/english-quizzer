import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { saveResult } from '../utils/storage'
import { playComplete } from '../utils/sounds'

const TYPE_LABEL = {
  multiple_choice:  '🔤 Trắc nghiệm',
  fill_in_blank:    '✏️ Điền từ',
  reorder:          '🔀 Sắp xếp',
  error_correction: '🔍 Sửa lỗi',
  matching:         '🔗 Nối từ',
}

export default function Result() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { answers, questions } = state || { answers: [], questions: [] }

  const [showReview, setShowReview] = useState(false)

  const correct = answers.filter(a => a.isCorrect).length
  const total   = answers.length
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0

  useEffect(() => {
    if (total > 0) {
      saveResult({ correct, total, pct, answers })
      const t = setTimeout(() => playComplete(correct / total), 400)
      return () => clearTimeout(t)
    }
  }, [])

  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '😊' : pct >= 40 ? '💪' : '📖'
  const msg   = pct === 100 ? 'Xuất sắc! Hoàn hảo!' : pct >= 80 ? 'Rất giỏi!' : pct >= 60 ? 'Khá tốt, cố thêm nhé!' : pct >= 40 ? 'Cần ôn thêm!' : 'Hãy ôn lại nhé!'

  return (
    <div className="page-wrapper pb-10">
      <div className="result-hero">
        <div className="result-emoji">{emoji}</div>
        <h2 className="result-msg">{msg}</h2>
        <div className="result-score">
          <span className="score-big">{correct}</span>
          <span className="score-sep">/{total}</span>
        </div>
        <div className="score-pct-bar">
          <div className="score-pct-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-gray-500 text-sm mt-2">{pct}% chính xác</p>
      </div>

      <div className="px-4 space-y-3 mt-2">
        <button onClick={() => setShowReview(!showReview)} className="btn-secondary w-full">
          {showReview ? '🙈 Ẩn xem lại' : '🔍 Xem lại từng câu'}
        </button>
        <button onClick={() => navigate('/history')} className="btn-secondary w-full">
          📊 Xem lịch sử các lần thi
        </button>
        <button onClick={() => navigate('/')} className="btn-primary w-full">
          🏠 Về trang chủ
        </button>
      </div>

      {showReview && (
        <div className="px-4 mt-6 space-y-4">
          <h3 className="font-bold text-gray-700 text-center">📋 Chi tiết từng câu</h3>
          {answers.map((ans, i) => (
            <div key={i} className={`review-card ${ans.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="flex items-start gap-2 mb-2">
                <span>{ans.isCorrect ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <span className="text-xs text-gray-400">{TYPE_LABEL[ans.question.type]} · Câu {i + 1}</span>
                  <p className="font-semibold text-sm text-gray-800 mt-0.5">{ans.question.question}</p>
                </div>
              </div>
              <div className="text-sm bg-white/60 rounded-lg p-2 mt-1">
                <span className="font-bold text-green-700">✓ Đúng: </span>
                <span className="text-green-800">
                  {Array.isArray(ans.question.correct)
                    ? ans.question.correct.join(' ')
                    : typeof ans.question.correct === 'number'
                      ? ans.question.options?.[ans.question.correct]
                      : ans.question.correct}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-2 bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                💡 {ans.question.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
