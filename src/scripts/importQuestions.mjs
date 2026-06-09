/**
 * Script import câu hỏi từ questions.json lên Supabase
 * Dùng service_role key để bypass RLS
 * Chạy: node src/scripts/importQuestions.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://jalxcubkfrcjdpyocefb.supabase.co'

// ⚠️  Paste service_role key vào đây (lấy từ Supabase → Settings → API)
// Key này chỉ dùng cho script local, KHÔNG commit lên GitHub
const SERVICE_ROLE_KEY = 'PASTE_SERVICE_ROLE_KEY_HERE'

if (SERVICE_ROLE_KEY === 'PASTE_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ Chưa paste service_role key! Mở file này và thay PASTE_SERVICE_ROLE_KEY_HERE bằng key thật.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const raw = readFileSync(join(__dirname, '../data/questions.json'), 'utf-8')
const questions = JSON.parse(raw)

function transform(q) {
  let payload = {}
  switch (q.type) {
    case 'multiple_choice':  payload = { options: q.options };      break
    case 'fill_in_blank':    payload = { word_bank: q.word_bank };  break
    case 'reorder':          payload = { words: q.words };          break
    case 'error_correction': payload = { options: q.options };      break
    case 'matching':         payload = { pairs: q.pairs };          break
  }
  return {
    curriculum:  q.curriculum,
    unit:        q.unit,
    type:        q.type,
    question:    q.question,
    payload,
    correct:     q.correct ?? null,
    explanation: q.explanation,
    difficulty:  'medium',
    is_active:   true,
  }
}

async function main() {
  console.log(`📚 Bắt đầu import ${questions.length} câu hỏi...`)
  const rows = questions.map(transform)

  // Xóa data cũ
  const { error: delError } = await supabase.from('questions').delete().neq('id', 0)
  if (delError) console.warn('⚠️  Xóa cũ:', delError.message)

  // Insert
  const { data, error } = await supabase.from('questions').insert(rows).select('id')
  if (error) { console.error('❌ Lỗi:', error.message); process.exit(1) }

  console.log(`✅ Import thành công ${data.length} câu hỏi!`)
}

main()
