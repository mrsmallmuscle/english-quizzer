import MultipleChoice  from './MultipleChoice'
import FillInBlank     from './FillInBlank'
import ReorderSentence from './ReorderSentence'
import ErrorCorrection from './ErrorCorrection'
import Matching        from './Matching'

const TYPE_LABEL = {
  multiple_choice:  { icon: '🔤', label: 'Trắc nghiệm' },
  fill_in_blank:    { icon: '✏️', label: 'Điền vào chỗ trống' },
  reorder:          { icon: '🔀', label: 'Sắp xếp câu' },
  error_correction: { icon: '🔍', label: 'Sửa lỗi sai' },
  matching:         { icon: '🔗', label: 'Nối từ' },
}

export default function QuizCard({ question, index, total, onAnswer, answered, showExplanation }) {
  const meta = TYPE_LABEL[question.type] || { icon: '❓', label: question.type }

  // answered = { isCorrect, detail } hoặc null
  const isCorrect = answered?.isCorrect ?? null

  return (
    <div className="quiz-card animate-bounce-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="badge-type">{meta.icon} {meta.label}</span>
        <span className="text-xs text-gray-400 font-semibold">{index + 1} / {total}</span>
      </div>

      {/* Question */}
      <p className="text-base font-bold text-gray-800 mb-5 leading-relaxed">
        {question.question}
      </p>

      {/* Component theo dạng bài — truyền answered nguyên để component tự xử lý */}
      {question.type === 'multiple_choice'  && <MultipleChoice  question={question} onAnswer={onAnswer} answered={answered} />}
      {question.type === 'fill_in_blank'    && <FillInBlank     question={question} onAnswer={onAnswer} answered={answered} />}
      {question.type === 'reorder'          && <ReorderSentence question={question} onAnswer={onAnswer} answered={answered} />}
      {question.type === 'error_correction' && <ErrorCorrection question={question} onAnswer={onAnswer} answered={answered} />}
      {question.type === 'matching'         && <Matching        question={question} onAnswer={onAnswer} answered={answered} />}

      {/* Explanation */}
      {showExplanation && answered !== null && (
        <div className={`explanation-box ${isCorrect ? 'correct' : 'wrong'}`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <p className="font-bold text-sm mb-1">{isCorrect ? 'Chính xác!' : 'Chưa đúng!'}</p>
              <p className="text-sm leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
