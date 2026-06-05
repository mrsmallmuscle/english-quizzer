const KEY = 'eq_history'

export function saveResult({ correct, total, pct, answers }) {
  const history = getHistory()
  history.unshift({
    correct,
    total,
    pct,
    answers: answers || [],   // lưu chi tiết từng câu
    date: new Date().toISOString(),
  })
  const trimmed = history.slice(0, 30) // giữ tối đa 30 lần gần nhất
  localStorage.setItem(KEY, JSON.stringify(trimmed))
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
