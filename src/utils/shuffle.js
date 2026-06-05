/**
 * Fisher-Yates shuffle — xáo trộn mảng ngẫu nhiên
 * Trả về mảng MỚI, không mutate mảng gốc
 */
export function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Shuffle options của multiple_choice, giữ lại index đáp án đúng
 * Trả về { shuffledOptions, newCorrectIndex }
 */
export function shuffleOptions(options, correctIndex) {
  const indexed = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }))
  const shuffled = shuffle(indexed)
  return {
    shuffledOptions: shuffled.map(x => x.opt),
    newCorrectIndex: shuffled.findIndex(x => x.isCorrect),
  }
}
