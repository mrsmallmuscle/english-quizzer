import { useMemo } from 'react'
import { shuffle } from '../utils/shuffle'
import { playCorrect, playWrong } from '../utils/sounds'

export default function FillInBlank({ question, onAnswer, answered }) {
  const shuffledBank = useMemo(() => shuffle(question.word_bank), [question.id])

  function handleClick(word) {
    if (answered !== null) return
    const correct = word === question.correct
    correct ? playCorrect() : playWrong()
    onAnswer(correct, word)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {shuffledBank.map((word, i) => {
          let style = 'option-btn'
          if (answered !== null) {
            if (word === question.correct) style += ' correct'
            else if (word === answered?.detail) style += ' wrong'
            else style += ' dimmed'
          }
          return (
            <button
              key={i}
              disabled={answered !== null}
              onClick={() => handleClick(word)}
              className={style}
            >
              {word}
              {answered !== null && word === question.correct && (
                <span className="ml-2 text-green-600 font-bold">✓</span>
              )}
              {answered !== null && word === answered?.detail && word !== question.correct && (
                <span className="ml-2 text-red-500 font-bold">✗</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
