import { supabase } from './supabase'

/**
 * Lưu kết quả thi lên Supabase (user đã đăng nhập)
 */
export async function saveSessionToDB({ userId, curriculum, unit, score, total, pct, answers }) {
  // Làm gọn answers để không lưu quá nặng — chỉ giữ những gì cần thiết
  const lightAnswers = answers.map(a => ({
    isCorrect:   a.isCorrect,
    question: {
      id:          a.question.id,
      type:        a.question.type,
      question:    a.question.question,
      correct:     a.question.correct,
      explanation: a.question.explanation,
      // payload đặc thù theo type (để hiển thị review)
      ...(a.question.options   ? { options:   a.question.options }   : {}),
      ...(a.question.word_bank ? { word_bank: a.question.word_bank } : {}),
      ...(a.question.words     ? { words:     a.question.words }     : {}),
      ...(a.question.pairs     ? { pairs:     a.question.pairs }     : {}),
    },
  }))

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id:    userId,
      curriculum: curriculum || null,
      unit:       unit       || null,
      score,
      total,
      pct,
      answers:    lightAnswers,
    })
    .select('id')
    .single()

  if (error) throw error
  return data
}

/**
 * Lấy lịch sử thi từ Supabase của user hiện tại
 * @param {string} userId
 * @param {number} limit
 */
export async function fetchSessionHistory(userId, limit = 30) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Lấy thống kê tổng của user
 */
export async function fetchUserStats(userId) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('score, total, pct, played_at, curriculum, unit')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })

  if (error) throw error

  if (!data || data.length === 0) return null

  const totalSessions = data.length
  const avgPct        = Math.round(data.reduce((s, r) => s + r.pct, 0) / totalSessions)
  const bestPct       = Math.max(...data.map(r => r.pct))
  const totalAnswered = data.reduce((s, r) => s + r.total, 0)
  const totalCorrect  = data.reduce((s, r) => s + r.score, 0)

  return { totalSessions, avgPct, bestPct, totalAnswered, totalCorrect }
}
