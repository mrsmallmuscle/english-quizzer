import allQuestions from '../data/questions.json'

/**
 * Lấy danh sách curriculum không trùng
 */
export function getCurriculums() {
  return [...new Set(allQuestions.map(q => q.curriculum))].sort()
}

/**
 * Lấy danh sách unit của 1 curriculum
 */
export function getUnits(curriculum) {
  return [...new Set(
    allQuestions
      .filter(q => q.curriculum === curriculum)
      .map(q => q.unit)
  )].sort()
}

/**
 * Lọc câu hỏi theo curriculum và/hoặc unit
 * @param {string|null} curriculum
 * @param {string|null} unit
 * @returns câu hỏi đã lọc
 */
export function filterQuestions(curriculum = null, unit = null) {
  return allQuestions.filter(q => {
    if (curriculum && q.curriculum !== curriculum) return false
    if (unit && q.unit !== unit) return false
    return true
  })
}

/**
 * Lấy N câu ngẫu nhiên từ pool
 */
export function pickRandom(pool, n) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, shuffled.length))
}
