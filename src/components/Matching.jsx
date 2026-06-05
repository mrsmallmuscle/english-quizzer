import { useState, useMemo } from 'react'
import { shuffle } from '../utils/shuffle'
import { playMatch, playMatchWrong, playCorrect } from '../utils/sounds'

export default function Matching({ question, onAnswer, answered }) {
  const words    = useMemo(() => shuffle(question.pairs.map(p => p.word)),    [question.id])
  const meanings = useMemo(() => shuffle(question.pairs.map(p => p.meaning)), [question.id])

  const [selectedWord, setSelectedWord] = useState(null)
  const [matches, setMatches]           = useState({})
  const [wrong, setWrong]               = useState(null)

  const correctMap     = Object.fromEntries(question.pairs.map(p => [p.word, p.meaning]))
  const matchedMeanings = new Set(Object.values(matches))
  const matchedWords    = new Set(Object.keys(matches))

  function handleWord(word) {
    if (answered !== null || matchedWords.has(word)) return
    setSelectedWord(word)
  }

  function handleMeaning(meaning) {
    if (answered !== null || matchedMeanings.has(meaning) || !selectedWord) return
    const isCorrectPair = correctMap[selectedWord] === meaning
    if (isCorrectPair) {
      playMatch()
      const newMatches = { ...matches, [selectedWord]: meaning }
      setMatches(newMatches)
      setSelectedWord(null)
      if (Object.keys(newMatches).length === question.pairs.length) {
        setTimeout(() => playCorrect(), 200)
        onAnswer(true, newMatches)
      }
    } else {
      playMatchWrong()
      setWrong({ word: selectedWord, meaning })
      setTimeout(() => {
        setWrong(null)
        setSelectedWord(null)
      }, 700)
    }
  }

  function getWordStyle(word) {
    if (matchedWords.has(word))   return 'match-chip matched'
    if (wrong?.word === word)     return 'match-chip wrong-flash'
    if (selectedWord === word)    return 'match-chip selected'
    return 'match-chip'
  }

  function getMeaningStyle(meaning) {
    if (matchedMeanings.has(meaning)) return 'match-chip matched'
    if (wrong?.meaning === meaning)   return 'match-chip wrong-flash'
    return 'match-chip meaning'
  }

  return (
    <div className="space-y-4">
      {answered === null && (
        <p className="text-xs text-center text-gray-400">Chọn 1 từ tiếng Anh → rồi chọn nghĩa tương ứng</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-center text-blue-500 uppercase tracking-wide">Từ</p>
          {words.map(word => (
            <button key={word} onClick={() => handleWord(word)} className={getWordStyle(word)}>
              {word}
              {matchedWords.has(word) && <span className="ml-1 text-green-600">✓</span>}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-center text-purple-500 uppercase tracking-wide">Nghĩa</p>
          {meanings.map(meaning => (
            <button key={meaning} onClick={() => handleMeaning(meaning)} className={getMeaningStyle(meaning)}>
              {meaning}
              {matchedMeanings.has(meaning) && <span className="ml-1 text-green-600">✓</span>}
            </button>
          ))}
        </div>
      </div>
      {answered !== null && (
        <div className="text-center text-green-600 font-bold animate-bounce-in">
          🎉 Nối đúng hết rồi!
        </div>
      )}
    </div>
  )
}
