/**
 * AI Import utility
 * Gọi Gemini hoặc DeepSeek API để tạo câu hỏi từ tài liệu
 * API key chỉ lưu trong sessionStorage, không bao giờ lên server
 */

export const AI_MODELS = [
  // ── Gemini ──────────────────────────────────────────────
  {
    provider: 'gemini',
    label:    'Gemini 2.5 Flash-Lite',
    model:    'gemini-2.5-flash-lite',
    note:     'Nhanh nhất, rẻ nhất',
  },
  {
    provider: 'gemini',
    label:    'Gemini 2.5 Flash',
    model:    'gemini-2.5-flash',
    note:     'Mặc định — cân bằng tốc độ & chất lượng',
  },
  {
    provider: 'gemini',
    label:    'Gemini 3.1 Flash-Lite',
    model:    'gemini-3.1-flash-lite',
    note:     'Thế hệ mới, nhanh',
  },
  {
    provider: 'gemini',
    label:    'Gemini 3.1 Flash',
    model:    'gemini-3.1-flash',
    note:     'Mạnh nhất — tài liệu phức tạp',
  },
  // ── DeepSeek ────────────────────────────────────────────
  {
    provider: 'deepseek',
    label:    'DeepSeek V4 Flash',
    model:    'deepseek-v4-flash',
    note:     'Nhanh, tiết kiệm token',
  },
  {
    provider: 'deepseek',
    label:    'DeepSeek V4 Pro',
    model:    'deepseek-v4-pro',
    note:     'Mạnh hơn — tài liệu phức tạp',
  },
]

// ─────────────────────────────────────────────────────────
// Session storage helpers cho API key
// ─────────────────────────────────────────────────────────
export function saveApiKey(provider, key) {
  sessionStorage.setItem(`ai_key_${provider}`, key)
}

export function loadApiKey(provider) {
  return sessionStorage.getItem(`ai_key_${provider}`) || ''
}

// ─────────────────────────────────────────────────────────
// Build system prompt
// ─────────────────────────────────────────────────────────
export function buildPrompt({ curriculum, unit, existingSummary, existingCount }) {
  return `Bạn là chuyên gia tạo bài tập tiếng Anh cho học sinh tiểu học (7-12 tuổi).

THÔNG TIN BÀI HỌC:
- Chương trình: ${curriculum}
- Unit/Bài: ${unit || 'Tổng hợp'}

CÁC CÂU HỎI ĐÃ CÓ TRONG HỆ THỐNG (để tránh trùng):
${existingSummary || '(Chưa có câu hỏi nào)'}
(Tổng cộng: ${existingCount || 0} câu đã có)

NHIỆM VỤ:
Phân tích tài liệu được cung cấp và tạo câu hỏi quiz tiếng Anh phù hợp.

QUY TẮC BẮT BUỘC:
1. Chỉ tạo các loại: multiple_choice, fill_in_blank, reorder, error_correction, matching
2. KHÔNG tạo câu giống hơn 80% với các câu đã có ở trên
3. Giải thích (explanation) bằng tiếng Việt, ngắn gọn 1-2 câu
4. multiple_choice và error_correction: đúng 4 options
5. matching: đúng 4 cặp từ-nghĩa
6. fill_in_blank: word_bank có đúng 4 từ (1 đúng + 3 nhiễu hợp lý)
7. reorder: words là mảng các từ/cụm từ đã bị xáo trộn, correct là thứ tự đúng
8. Độ khó phù hợp tiểu học, ngôn ngữ đơn giản
9. Tạo đa dạng loại câu, cố gắng có ít nhất 2-3 câu mỗi loại
10. Tối đa 15 câu mỗi lần

OUTPUT FORMAT - CHỈ TRẢ VỀ JSON ARRAY THUẦN TÚY:
Không có markdown, không có \`\`\`json, không có text ngoài JSON.

[
  {
    "curriculum": "${curriculum}",
    "unit": "${unit || 'Unit 1'}",
    "type": "multiple_choice",
    "question": "She ___ a student.",
    "payload": { "options": ["is", "are", "am", "be"] },
    "correct": 0,
    "explanation": "'She' ngôi 3 số ít → dùng 'is'."
  },
  {
    "curriculum": "${curriculum}",
    "unit": "${unit || 'Unit 1'}",
    "type": "fill_in_blank",
    "question": "A giraffe is ___ than a hippo.",
    "payload": { "word_bank": ["taller", "faster", "shorter", "slower"] },
    "correct": "taller",
    "explanation": "Giraffe cao hơn hippo → 'taller'."
  },
  {
    "curriculum": "${curriculum}",
    "unit": "${unit || 'Unit 1'}",
    "type": "reorder",
    "question": "Sắp xếp thành câu đúng:",
    "payload": { "words": ["goes", "she", "school", "to"] },
    "correct": ["she", "goes", "to", "school"],
    "explanation": "Cấu trúc: Subject + Verb + Object."
  },
  {
    "curriculum": "${curriculum}",
    "unit": "${unit || 'Unit 1'}",
    "type": "error_correction",
    "question": "A snake is more long than a monkey.",
    "payload": { "options": ["more long → longer", "snake → snakes", "is → are", "than → then"] },
    "correct": 0,
    "explanation": "'long' ngắn → dùng '-er': 'longer'."
  },
  {
    "curriculum": "${curriculum}",
    "unit": "${unit || 'Unit 1'}",
    "type": "matching",
    "question": "Nối từ với nghĩa đúng:",
    "payload": { "pairs": [{"word":"daughter","meaning":"con gái"},{"word":"son","meaning":"con trai"},{"word":"parents","meaning":"bố mẹ"},{"word":"grandparents","meaning":"ông bà"}] },
    "correct": null,
    "explanation": "Từ vựng gia đình cơ bản."
  }
]`
}

// ─────────────────────────────────────────────────────────
// Gọi Gemini API
// ─────────────────────────────────────────────────────────
async function callGemini({ model, apiKey, systemPrompt, userContent }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: {
      temperature:     0.4,
      maxOutputTokens: 8192,
    },
  }

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API lỗi: ${res.status}`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ─────────────────────────────────────────────────────────
// Gọi DeepSeek API (OpenAI-compatible)
// ─────────────────────────────────────────────────────────
async function callDeepSeek({ model, apiKey, systemPrompt, userContent }) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent },
      ],
      temperature: 0.4,
      max_tokens:  8192,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `DeepSeek API lỗi: ${res.status}`)
  }

  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ''
}

// ─────────────────────────────────────────────────────────
// Main: gọi AI và parse kết quả
// ─────────────────────────────────────────────────────────
export async function generateQuestions({ provider, model, apiKey, systemPrompt, userContent }) {
  let rawText = ''

  if (provider === 'gemini') {
    rawText = await callGemini({ model, apiKey, systemPrompt, userContent })
  } else if (provider === 'deepseek') {
    rawText = await callDeepSeek({ model, apiKey, systemPrompt, userContent })
  } else {
    throw new Error('Provider không hợp lệ: ' + provider)
  }

  return parseAIResponse(rawText)
}

// ─────────────────────────────────────────────────────────
// Parse JSON từ response AI (xử lý cả khi có markdown)
// ─────────────────────────────────────────────────────────
function parseAIResponse(text) {
  if (!text) throw new Error('AI trả về nội dung rỗng.')

  // Xóa markdown code blocks nếu có
  let clean = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Tìm JSON array trong text
  const start = clean.indexOf('[')
  const end   = clean.lastIndexOf(']')
  if (start === -1 || end === -1) {
    throw new Error('Không tìm thấy JSON array trong response của AI.')
  }

  clean = clean.slice(start, end + 1)

  try {
    const parsed = JSON.parse(clean)
    if (!Array.isArray(parsed)) throw new Error('Response không phải array.')
    return parsed
  } catch (e) {
    throw new Error('Parse JSON thất bại: ' + e.message)
  }
}

// ─────────────────────────────────────────────────────────
// Kiểm tra trùng lặp (client-side, Levenshtein đơn giản)
// ─────────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

export function checkDuplicate(newQ, existingQuestions) {
  const a = newQ.question.toLowerCase().trim()
  for (const eq of existingQuestions) {
    const b = eq.question.toLowerCase().trim()
    const longer = Math.max(a.length, b.length)
    if (longer === 0) continue
    const dist = levenshtein(a, b)
    const similarity = 1 - dist / longer
    if (similarity >= 0.8) return { isDuplicate: true, similarTo: eq.question }
  }
  return { isDuplicate: false }
}

// ─────────────────────────────────────────────────────────
// Validate câu hỏi AI tạo ra
// ─────────────────────────────────────────────────────────
export function validateQuestion(q) {
  const errors = []
  if (!q.type)        errors.push('Thiếu type')
  if (!q.question)    errors.push('Thiếu question')
  if (!q.explanation) errors.push('Thiếu explanation')
  if (!q.payload)     errors.push('Thiếu payload')

  switch (q.type) {
    case 'multiple_choice':
    case 'error_correction':
      if (!q.payload?.options || q.payload.options.length !== 4)
        errors.push('options phải có đúng 4 phần tử')
      if (typeof q.correct !== 'number')
        errors.push('correct phải là số (index)')
      break
    case 'fill_in_blank':
      if (!q.payload?.word_bank || q.payload.word_bank.length !== 4)
        errors.push('word_bank phải có đúng 4 từ')
      if (typeof q.correct !== 'string')
        errors.push('correct phải là string')
      break
    case 'reorder':
      if (!q.payload?.words || q.payload.words.length < 2)
        errors.push('words phải có ít nhất 2 phần tử')
      if (!Array.isArray(q.correct))
        errors.push('correct phải là array')
      break
    case 'matching':
      if (!q.payload?.pairs || q.payload.pairs.length !== 4)
        errors.push('pairs phải có đúng 4 cặp')
      break
    default:
      errors.push('type không hợp lệ: ' + q.type)
  }

  return errors
}
