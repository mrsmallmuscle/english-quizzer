import { shuffleOptions } from '../utils/shuffle'
import { playCorrect, playWrong } from '../utils/sounds'
import { useMemo } from 'react'

const LABELS = ['A', 'B', 'C', 'D']

export default function MultipleChoice({ question, onAnswer, answered }) {
  const { shuffledOptions, newCorrectIndex } = useMemo(
    () => shuffleOptions(question.options, question.correct),
    [question.id]
  )

  function handleClick(i) {
    if (answered !== null) return
    const correct = i === newCorrectIndex
    correct ? playCorrect() : playWrong()
    onAnswer(correct, { shuffledOptions, newCorrectIndex, chosen: i })
  }

  return (
    <div className="space-y-3">
      {shuffledOptions.map((opt, i) => {
        let style = 'option-btn'
        if (answered !== null) {
          if (i === newCorrectIndex) style += ' correct'
          else if (i === answered?.detail?.chosen) style += ' wrong'
          else style += ' dimmed'
        }
        return (
          <button
            key={i}
            disabled={answered !== null}
            onClick={() => handleClick(i)}
            className={style}
          >
            <span className="label">{LABELS[i]}</span>
            <span className="flex-1 text-left">{opt}</span>
            {answered !== null && i === newCorrectIndex && (
              <span className="ml-2 text-green-600 font-bold">✓</span>
            )}
            {answered !== null && i === answered?.detail?.chosen && i !== newCorrectIndex && (
              <span className="ml-2 text-red-500 font-bold">✗</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
