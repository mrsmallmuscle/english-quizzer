import { useState, useMemo } from 'react'
import { shuffle } from '../utils/shuffle'
import { playCorrect, playWrong } from '../utils/sounds'

export default function ReorderSentence({ question, onAnswer, answered }) {
  const shuffledWords = useMemo(() => shuffle(question.words), [question.id])
  const [bank, setBank]     = useState(shuffledWords)
  const [chosen, setChosen] = useState([])

  const isCorrect = chosen.join(' ') === question.correct.join(' ')

  function pickWord(word, idx) {
    if (answered !== null) return
    const newBank = [...bank]
    newBank.splice(idx, 1)
    setBank(newBank)
    setChosen([...chosen, word])
  }

  function removeWord(word, idx) {
    if (answered !== null) return
    const newChosen = [...chosen]
    newChosen.splice(idx, 1)
    setChosen(newChosen)
    setBank([...bank, word])
  }

  function handleCheck() {
    if (chosen.length === 0) return
    isCorrect ? playCorrect() : playWrong()
    onAnswer(isCorrect, { chosen, correct: question.correct })
  }

  function handleReset() {
    setBank(shuffledWords)
    setChosen([])
  }

  return (
    <div className="space-y-4">
      {/* Khu vực đặt câu */}
      <div className="min-h-14 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-3 flex flex-wrap gap-2 items-center">
        {chosen.length === 0 && (
          <span className="text-blue-300 text-sm italic">Bấm các từ bên dưới để sắp xếp câu...</span>
        )}
        {chosen.map((w, i) => (
          <button
            key={i}
            onClick={() => removeWord(w, i)}
            disabled={answered !== null}
            className={`word-chip chosen ${answered !== null ? (isCorrect ? 'correct' : 'wrong') : ''}`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Ngân hàng từ */}
      <div className="flex flex-wrap gap-2 justify-center min-h-10">
        {bank.map((w, i) => (
          <button
            key={i}
            onClick={() => pickWord(w, i)}
            disabled={answered !== null}
            className="word-chip bank"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Nút hành động */}
      {answered === null && (
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-secondary flex-1">
            🔄 Làm lại
          </button>
          <button
            onClick={handleCheck}
            disabled={chosen.length === 0}
            className="btn-primary flex-1"
          >
            Kiểm tra ✓
          </button>
        </div>
      )}

      {/* Hiển thị đáp án đúng khi sai */}
      {answered !== null && !isCorrect && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
          <span className="font-bold">Câu đúng: </span>
          {question.correct.join(' ')}
        </div>
      )}
    </div>
  )
}
