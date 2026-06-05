import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QuizCard from '../components/QuizCard'
import { playStart } from '../utils/sounds'

export default function Quiz() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const questions = state?.questions || []

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers]       = useState([])
  const [answered, setAnswered]     = useState(null)

  useEffect(() => {
    // Âm thanh báo bắt đầu bài
    const t = setTimeout(() => playStart(), 300)
    return () => clearTimeout(t)
  }, [])

  if (questions.length === 0) {
    navigate('/')
    return null
  }

  const current  = questions[currentIdx]
  const isLast   = currentIdx === questions.length - 1
  const progress = (currentIdx / questions.length) * 100

  function handleAnswer(isCorrect, detail) {
    setAnswered({ isCorrect, detail })
  }

  function handleNext() {
    const newAnswers = [...answers, { question: current, ...answered }]
    if (isLast) {
      navigate('/result', { state: { answers: newAnswers, questions } })
    } else {
      setAnswers(newAnswers)
      setCurrentIdx(currentIdx + 1)
      setAnswered(null)
    }
  }

  return (
    <div className="page-wrapper">
      {/* Progress bar */}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <div className="quiz-header">
        <button onClick={() => navigate('/')} className="btn-back">← Thoát</button>
        <div className="quiz-score-live">
          ✅ {answers.filter(a => a.isCorrect).length} / {currentIdx}
        </div>
      </div>

      {/* Card */}
      <div className="px-4 pb-8">
        <QuizCard
          question={current}
          index={currentIdx}
          total={questions.length}
          onAnswer={handleAnswer}
          answered={answered}
          showExplanation={true}
        />

        {answered !== null && (
          <button onClick={handleNext} className="btn-next w-full mt-4 animate-bounce-in">
            {isLast ? '🏁 Xem kết quả' : 'Câu tiếp theo →'}
          </button>
        )}
      </div>
    </div>
  )
}
