import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getHistory } from '../utils/storage'
import { fetchCurriculums, fetchUnits, fetchRandomQuestions } from '../hooks/useQuestions'
import { getCurriculums as getFallbackCurriculums, getUnits as getFallbackUnits, filterQuestions, pickRandom } from '../utils/filterQuestions'

const QUESTION_COUNTS = [5, 10, 15, 20]

/** Normalize DB row → format component cũ đang dùng */
function normalizeQuestion(q) {
  return {
    id:          q.id,
    curriculum:  q.curriculum,
    unit:        q.unit,
    type:        q.type,
    question:    q.question,
    explanation: q.explanation,
    correct:     q.correct,
    ...q.payload,   // spread options/words/pairs/word_bank vào root
  }
}

export default function Home() {
  const navigate = useNavigate()
  const { user, isAdmin, isStudent } = useAuth()
  const history = getHistory()

  const [curriculums, setCurriculums] = useState([])
  const [units, setUnits]             = useState([])
  const [curriculum, setCurriculum]   = useState('')
  const [unit, setUnit]               = useState('')
  const [count, setCount]             = useState(10)
  const [poolSize, setPoolSize]       = useState(0)
  const [loadingPool, setLoadingPool] = useState(true)
  const [starting, setStarting]       = useState(false)
  const [useDB, setUseDB]             = useState(true)

  // Load curriculums
  useEffect(() => {
    fetchCurriculums()
      .then(list => { setCurriculums(list); setUseDB(true) })
      .catch(() => { setCurriculums(getFallbackCurriculums()); setUseDB(false) })
  }, [])

  // Load units khi đổi curriculum
  useEffect(() => {
    setUnit('')
    if (!curriculum) { setUnits([]); return }
    if (useDB) {
      fetchUnits(curriculum).then(setUnits).catch(() => setUnits(getFallbackUnits(curriculum)))
    } else {
      setUnits(getFallbackUnits(curriculum))
    }
  }, [curriculum, useDB])

  // Đếm pool size
  useEffect(() => {
    setLoadingPool(true)
    if (useDB) {
      fetchRandomQuestions({ curriculum: curriculum || null, unit: unit || null, count: 9999 })
        .then(list => { setPoolSize(list.length); setLoadingPool(false) })
        .catch(() => { setLoadingPool(false) })
    } else {
      setPoolSize(filterQuestions(curriculum || null, unit || null).length)
      setLoadingPool(false)
    }
  }, [curriculum, unit, useDB])

  async function handleStart() {
    setStarting(true)
    try {
      let questions
      if (useDB) {
        const raw = await fetchRandomQuestions({ curriculum: curriculum || null, unit: unit || null, count })
        questions = raw.map(normalizeQuestion)
      } else {
        const pool = filterQuestions(curriculum || null, unit || null)
        questions = pickRandom(pool, count)
      }
      navigate('/quiz', { state: { questions, quizMeta: { curriculum: curriculum || null, unit: unit || null } } })
    } catch (err) {
      console.error(err)
      // Fallback
      const pool = filterQuestions(curriculum || null, unit || null)
      navigate('/quiz', { state: { questions: pickRandom(pool, count), quizMeta: { curriculum: curriculum || null, unit: unit || null } } })
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="home-hero">
        <div className="hero-icon">📚</div>
        <h1 className="hero-title">English Quizzer</h1>
        <p className="hero-sub">Ôn luyện tiếng Anh thật vui!</p>
        {!useDB && <p className="text-xs text-amber-500 mt-1">⚠️ Đang dùng dữ liệu offline</p>}
      </div>

      <div className="card">
        {/* Curriculum */}
        <div className="form-group">
          <label className="form-label">📖 Chương trình học</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setCurriculum(''); setUnit('') }}
              className={`filter-chip ${!curriculum ? 'active' : ''}`}>Tất cả</button>
            {curriculums.map(c => (
              <button key={c} onClick={() => { setCurriculum(c); setUnit('') }}
                className={`filter-chip ${curriculum === c ? 'active' : ''}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Unit */}
        {curriculum && units.length > 0 && (
          <div className="form-group">
            <label className="form-label">📝 Bài / Unit</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setUnit('')}
                className={`filter-chip ${!unit ? 'active' : ''}`}>Tất cả unit</button>
              {units.map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  className={`filter-chip ${unit === u ? 'active' : ''}`}>{u}</button>
              ))}
            </div>
          </div>
        )}

        {/* Số câu */}
        <div className="form-group">
          <label className="form-label">🔢 Số câu hỏi</label>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`filter-chip flex-1 justify-center ${count === n ? 'active' : ''}`}>{n}</button>
            ))}
          </div>
        </div>

        {/* Pool info */}
        <div className="pool-info">
          <span>🎯</span>
          <span>
            {loadingPool
              ? 'Đang tải...'
              : <><strong>{poolSize}</strong> câu hỏi có sẵn</>
            }
            {curriculum && <> · <strong>{curriculum}</strong></>}
            {unit && <> · <strong>{unit}</strong></>}
          </span>
        </div>

        <button
          onClick={handleStart}
          disabled={poolSize === 0 || starting || loadingPool}
          className="btn-start w-full mt-2"
        >
          {starting
            ? '⏳ Đang tải câu hỏi...'
            : `🚀 Bắt đầu làm bài (${Math.min(count, poolSize)} câu)`}
        </button>
      </div>

      {/* Links dưới */}
      <div className="mx-4 mt-4 space-y-3">
        {(isStudent || isAdmin) && (
          <Link to={isAdmin ? '/admin' : '/student'}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-sm font-semibold text-blue-700 active:scale-95 transition-all">
            <span>{isAdmin ? '⚙️ Admin Dashboard' : '🎓 Dashboard của tôi'}</span>
            <span className="text-blue-300">→</span>
          </Link>
        )}
        {history.length > 0 && (
          <Link to="/history"
            className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm font-semibold text-gray-600 active:scale-95 transition-all">
            <span>📊 Lịch sử thi ({history.length} lần)</span>
            <span className="text-gray-300">→</span>
          </Link>
        )}
        {!user && (
          <Link to="/login"
            className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm font-semibold text-gray-500 active:scale-95 transition-all">
            <span>🔐 Đăng nhập để lưu tiến độ</span>
            <span className="text-gray-300">→</span>
          </Link>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 pb-8">
        Đáp án được xáo trộn mỗi lần làm bài 🔀
      </p>
    </div>
  )
}
