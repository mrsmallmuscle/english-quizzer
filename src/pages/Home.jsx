import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurriculums, getUnits, filterQuestions, pickRandom } from '../utils/filterQuestions'
import { getHistory } from '../utils/storage'

const QUESTION_COUNTS = [5, 10, 15, 20]

export default function Home() {
  const navigate    = useNavigate()
  const curriculums = getCurriculums()
  const history     = getHistory()

  const [curriculum, setCurriculum] = useState('')
  const [unit, setUnit]             = useState('')
  const [count, setCount]           = useState(10)

  const units = curriculum ? getUnits(curriculum) : []
  const pool  = filterQuestions(curriculum || null, unit || null)

  function handleStart() {
    const questions = pickRandom(pool, count)
    navigate('/quiz', { state: { questions } })
  }

  return (
    <div className="page-wrapper">
      <div className="home-hero">
        <div className="hero-icon">📚</div>
        <h1 className="hero-title">English Quizzer</h1>
        <p className="hero-sub">Ôn luyện tiếng Anh thật vui!</p>
      </div>

      <div className="card">
        {/* Chọn chương trình */}
        <div className="form-group">
          <label className="form-label">📖 Chương trình học</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCurriculum(''); setUnit('') }}
              className={`filter-chip ${!curriculum ? 'active' : ''}`}
            >Tất cả</button>
            {curriculums.map(c => (
              <button
                key={c}
                onClick={() => { setCurriculum(c); setUnit('') }}
                className={`filter-chip ${curriculum === c ? 'active' : ''}`}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Chọn unit */}
        {curriculum && (
          <div className="form-group">
            <label className="form-label">📝 Bài / Unit</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setUnit('')}
                className={`filter-chip ${!unit ? 'active' : ''}`}
              >Tất cả unit</button>
              {units.map(u => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`filter-chip ${unit === u ? 'active' : ''}`}
                >{u}</button>
              ))}
            </div>
          </div>
        )}

        {/* Số câu */}
        <div className="form-group">
          <label className="form-label">🔢 Số câu hỏi</label>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`filter-chip flex-1 justify-center ${count === n ? 'active' : ''}`}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Pool info */}
        <div className="pool-info">
          <span>🎯</span>
          <span>
            <strong>{pool.length}</strong> câu hỏi có sẵn
            {curriculum && <> · <strong>{curriculum}</strong></>}
            {unit && <> · <strong>{unit}</strong></>}
          </span>
        </div>

        {/* Nút bắt đầu */}
        <button
          onClick={handleStart}
          disabled={pool.length === 0}
          className="btn-start w-full mt-2"
        >
          🚀 Bắt đầu làm bài ({Math.min(count, pool.length)} câu)
        </button>
      </div>

      {/* Nút lịch sử */}
      {history.length > 0 && (
        <div className="mx-4 mt-4">
          <button
            onClick={() => navigate('/history')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm font-semibold text-gray-600 active:scale-95 transition-all"
          >
            <span>📊 Lịch sử thi ({history.length} lần)</span>
            <span className="text-gray-300">→</span>
          </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-6 pb-8">
        Đáp án được xáo trộn mỗi lần làm bài 🔀
      </p>
    </div>
  )
}
