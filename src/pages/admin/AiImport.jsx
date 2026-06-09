import { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../utils/supabase'
import {
  AI_MODELS, saveApiKey, loadApiKey,
  buildPrompt, generateQuestions,
  checkDuplicate, validateQuestion,
} from '../../utils/aiImport'

const STEPS = ['⚙️ Cấu hình', '📄 Tài liệu', '✅ Duyệt & Lưu']

export default function AiImport() {
  const { user } = useAuth()
  const [step, setStep]       = useState(0)

  // Step 1 — Config
  const [provider, setProvider]   = useState('gemini')
  const [modelId, setModelId]     = useState('gemini-2.5-flash')
  const [apiKey, setApiKey]       = useState('')
  const [showKey, setShowKey]     = useState(false)
  const [curriculum, setCurriculum] = useState('')
  const [unit, setUnit]           = useState('')
  const [curricList, setCurricList] = useState([])
  const [unitsList, setUnitsList] = useState([])

  // Step 2 — Content
  const [textInput, setTextInput]   = useState('')
  const [fileBase64, setFileBase64] = useState(null)
  const [fileName, setFileName]     = useState('')
  const [fileType, setFileType]     = useState('')
  const fileRef = useRef()

  // Step 3 — Review
  const [generating, setGenerating]   = useState(false)
  const [genError, setGenError]       = useState('')
  const [candidates, setCandidates]   = useState([])  // { q, status, errors, dupInfo }
  const [saving, setSaving]           = useState(false)
  const [saveMsg, setSaveMsg]         = useState('')

  const models = AI_MODELS.filter(m => m.provider === provider)

  useEffect(() => {
    // Load curricList từ DB
    supabase.from('questions').select('curriculum').eq('is_active', true)
      .then(({ data }) => {
        setCurricList([...new Set((data || []).map(r => r.curriculum))].sort())
      })
    // Load key đã lưu nếu có
    setApiKey(loadApiKey(provider))
  }, [])

  useEffect(() => {
    setApiKey(loadApiKey(provider))
    setModelId(AI_MODELS.find(m => m.provider === provider)?.model || '')
  }, [provider])

  useEffect(() => {
    if (!curriculum) { setUnitsList([]); setUnit(''); return }
    supabase.from('questions').select('unit').eq('is_active', true).eq('curriculum', curriculum)
      .then(({ data }) => {
        setUnitsList([...new Set((data || []).map(r => r.unit))].sort())
      })
  }, [curriculum])

  // ── File upload ──────────────────────────────────────
  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileType(file.type)
    const reader = new FileReader()
    reader.onload = ev => setFileBase64(ev.target.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  function clearFile() {
    setFileBase64(null)
    setFileName('')
    setFileType('')
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Generate ─────────────────────────────────────────
  async function handleGenerate() {
    if (!apiKey.trim()) { setGenError('Chưa nhập API key.'); return }
    if (!curriculum)    { setGenError('Chưa chọn curriculum.'); return }
    if (!textInput.trim() && !fileBase64) { setGenError('Chưa có tài liệu nguồn.'); return }

    setGenerating(true)
    setGenError('')
    setCandidates([])

    try {
      // Lưu key vào sessionStorage
      saveApiKey(provider, apiKey.trim())

      // Lấy câu hỏi hiện có để check trùng
      const { data: existing } = await supabase
        .from('questions')
        .select('question, type')
        .eq('is_active', true)
        .eq('curriculum', curriculum)
        .eq('unit', unit || '')

      const existingSummary = (existing || [])
        .map(q => `[${q.type}] ${q.question}`)
        .join('\n')

      // Build system prompt
      const systemPrompt = buildPrompt({
        curriculum,
        unit,
        existingSummary,
        existingCount: (existing || []).length,
      })

      // Build user content (text + file nếu có)
      let userContent = ''
      if (fileBase64 && fileType.includes('image')) {
        // Gemini hỗ trợ image trực tiếp
        if (provider === 'gemini') {
          userContent = JSON.stringify({
            parts: [
              { inline_data: { mime_type: fileType, data: fileBase64 } },
              { text: textInput || 'Hãy tạo câu hỏi từ hình ảnh tài liệu này.' },
            ]
          })
        } else {
          userContent = `[Người dùng đã upload ảnh: ${fileName}]\n${textInput || 'Hãy tạo câu hỏi từ tài liệu này.'}`
        }
      } else {
        userContent = textInput || `Tên file: ${fileName}. Hãy tạo câu hỏi phù hợp cho ${curriculum} ${unit}.`
      }

      // Gọi AI
      const raw = await generateQuestions({ provider, model: modelId, apiKey: apiKey.trim(), systemPrompt, userContent })

      // Validate + check duplicate
      const checked = raw.map(q => {
        const errors  = validateQuestion(q)
        const dupInfo = checkDuplicate(q, existing || [])
        return {
          q,
          errors,
          dupInfo,
          selected: errors.length === 0 && !dupInfo.isDuplicate,
        }
      })

      setCandidates(checked)
      setStep(2)
    } catch (err) {
      setGenError('❌ ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  // ── Save selected to DB ──────────────────────────────
  async function handleSave() {
    const toSave = candidates.filter(c => c.selected && c.errors.length === 0)
    if (toSave.length === 0) { setSaveMsg('Không có câu nào được chọn.'); return }

    setSaving(true)
    setSaveMsg('')

    const rows = toSave.map(c => ({
      curriculum:  c.q.curriculum  || curriculum,
      unit:        c.q.unit        || unit || null,
      type:        c.q.type,
      question:    c.q.question,
      payload:     c.q.payload,
      correct:     c.q.correct ?? null,
      explanation: c.q.explanation,
      difficulty:  'medium',
      is_active:   true,
      created_by:  user.id,
    }))

    const { data, error } = await supabase.from('questions').insert(rows).select('id')

    if (error) {
      setSaveMsg('❌ Lỗi lưu: ' + error.message)
    } else {
      setSaveMsg(`✅ Đã lưu ${data.length} câu hỏi vào hệ thống!`)
      // Bỏ tick những câu đã lưu
      setCandidates(prev => prev.map(c =>
        c.selected ? { ...c, saved: true, selected: false } : c
      ))
    }
    setSaving(false)
  }

  const selectedCount = candidates.filter(c => c.selected).length
  const validCount    = candidates.filter(c => c.errors.length === 0 && !c.dupInfo.isDuplicate).length
  const dupCount      = candidates.filter(c => c.dupInfo.isDuplicate).length
  const errorCount    = candidates.filter(c => c.errors.length > 0).length

  return (
    <div className="page-wrapper pb-10">
      <Navbar />
      <div className="px-4 pt-4 space-y-4">

        {/* Title */}
        <div className="pt-2">
          <p className="text-xl font-black text-gray-800">🤖 AI Import</p>
          <p className="text-sm text-gray-500">Tạo câu hỏi từ tài liệu bằng AI</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                  i === step ? 'bg-blue-600 text-white shadow' :
                  i < step   ? 'bg-blue-100 text-blue-600' :
                               'bg-gray-100 text-gray-400'
                }`}
              >{s}</button>
              {i < STEPS.length - 1 && <span className="text-gray-300 text-xs">›</span>}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Config ───────────────────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="card space-y-4">
              <p className="text-sm font-bold text-gray-700">🤖 Chọn AI</p>

              {/* Provider */}
              <div className="flex gap-2">
                {['gemini', 'deepseek'].map(p => (
                  <button key={p} onClick={() => setProvider(p)}
                    className={`filter-chip flex-1 justify-center capitalize ${provider === p ? 'active' : ''}`}>
                    {p === 'gemini' ? '🔷 Gemini' : '🔶 DeepSeek'}
                  </button>
                ))}
              </div>

              {/* Model */}
              <div className="form-group">
                <label className="form-label">Model</label>
                <select value={modelId} onChange={e => setModelId(e.target.value)} className="input-field">
                  {models.map(m => (
                    <option key={m.model} value={m.model}>{m.label} — {m.note}</option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              <div className="form-group">
                <label className="form-label">
                  API Key ({provider === 'gemini' ? 'Google AI Studio' : 'DeepSeek'})
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={`Paste ${provider} API key...`}
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                  >{showKey ? '🙈' : '👁'}</button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Key chỉ lưu trong tab này, không gửi lên server.
                  {provider === 'gemini'
                    ? ' Lấy key tại: aistudio.google.com'
                    : ' Lấy key tại: platform.deepseek.com'}
                </p>
              </div>
            </div>

            {/* Curriculum & Unit */}
            <div className="card space-y-4">
              <p className="text-sm font-bold text-gray-700">📖 Chương trình học</p>
              <div className="form-group">
                <label className="form-label">Curriculum *</label>
                <div className="flex gap-2">
                  <select value={curriculum} onChange={e => setCurriculum(e.target.value)} className="input-field flex-1">
                    <option value="">-- Chọn hoặc nhập mới --</option>
                    {curricList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input
                  type="text"
                  value={curriculum}
                  onChange={e => setCurriculum(e.target.value)}
                  placeholder="Hoặc nhập mới, ví dụ: SKET8"
                  className="input-field mt-2"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit (tuỳ chọn)</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className="input-field">
                  <option value="">-- Chọn unit --</option>
                  {unitsList.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Hoặc nhập mới, ví dụ: Unit 5"
                  className="input-field mt-2"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!apiKey.trim()) { setGenError('Chưa nhập API key.'); return }
                if (!curriculum)   { setGenError('Chưa nhập curriculum.'); return }
                setGenError('')
                setStep(1)
              }}
              className="btn-start w-full"
            >Tiếp theo →</button>
            {genError && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{genError}</p>}
          </div>
        )}

        {/* ── STEP 1: Content ──────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="card space-y-4">
              <p className="text-sm font-bold text-gray-700">📄 Tài liệu nguồn</p>
              <p className="text-xs text-gray-500">
                Curriculum: <strong>{curriculum}</strong>
                {unit && <> · Unit: <strong>{unit}</strong></>}
              </p>

              {/* Text input */}
              <div className="form-group">
                <label className="form-label">Paste nội dung tài liệu</label>
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  rows={8}
                  placeholder="Paste nội dung bài học, từ vựng, ngữ pháp, bài tập mẫu... AI sẽ phân tích và tạo câu hỏi phù hợp."
                  className="input-field resize-none leading-relaxed"
                />
              </div>

              {/* File upload */}
              <div className="form-group">
                <label className="form-label">Hoặc upload ảnh tài liệu</label>
                {fileBase64 ? (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    <span className="text-2xl">📎</span>
                    <span className="text-sm font-semibold text-blue-700 flex-1 truncate">{fileName}</span>
                    <button onClick={clearFile} className="text-red-400 font-bold text-sm">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-6 cursor-pointer hover:border-blue-300 transition-colors">
                    <span className="text-3xl">📸</span>
                    <span className="text-sm text-gray-500 font-semibold">Bấm để chọn ảnh</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                )}
                {provider === 'deepseek' && fileBase64 && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ DeepSeek không đọc ảnh trực tiếp — chỉ dùng text phía trên.</p>
                )}
              </div>
            </div>

            {genError && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{genError}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Quay lại</button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-start flex-1"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Đang tạo...
                  </span>
                ) : '🤖 Tạo câu hỏi'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ───────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">

            {/* Summary bar */}
            <div className="card py-3 space-y-2">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  📋 Tổng: {candidates.length} câu
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                  ✅ Hợp lệ: {validCount}
                </span>
                {dupCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    ⚠️ Trùng: {dupCount}
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
                    ❌ Lỗi: {errorCount}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCandidates(prev => prev.map(c =>
                    c.errors.length === 0 && !c.dupInfo.isDuplicate && !c.saved
                      ? { ...c, selected: true } : c
                  ))}
                  className="text-xs text-blue-600 font-bold"
                >Chọn tất cả hợp lệ</button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setCandidates(prev => prev.map(c => ({ ...c, selected: false })))}
                  className="text-xs text-gray-500 font-bold"
                >Bỏ chọn tất cả</button>
              </div>
            </div>

            {/* Candidate list */}
            <div className="space-y-3">
              {candidates.map((c, i) => {
                const isValid = c.errors.length === 0 && !c.dupInfo.isDuplicate
                const statusColor = c.saved ? 'border-gray-200 bg-gray-50 opacity-60'
                  : c.dupInfo.isDuplicate ? 'border-yellow-200 bg-yellow-50'
                  : c.errors.length > 0   ? 'border-red-200 bg-red-50'
                  : c.selected            ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'

                return (
                  <div key={i} className={`rounded-2xl border-2 p-4 transition-all ${statusColor}`}>
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => {
                          if (!isValid || c.saved) return
                          setCandidates(prev => prev.map((x, j) =>
                            j === i ? { ...x, selected: !x.selected } : x
                          ))
                        }}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          c.saved        ? 'border-gray-300 bg-gray-200' :
                          !isValid       ? 'border-gray-200 bg-gray-100 cursor-not-allowed' :
                          c.selected     ? 'border-blue-500 bg-blue-500' :
                          'border-gray-300'
                        }`}
                      >
                        {c.saved    && <span className="text-xs">💾</span>}
                        {c.selected && !c.saved && <span className="text-white text-xs font-bold">✓</span>}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                            {c.q.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {c.q.curriculum} · {c.q.unit}
                          </span>
                          {c.saved && <span className="text-xs text-gray-500 italic">Đã lưu</span>}
                          {c.dupInfo.isDuplicate && (
                            <span className="text-xs text-yellow-700 font-bold">⚠️ Có thể trùng</span>
                          )}
                        </div>

                        {/* Question */}
                        <p className="text-sm font-semibold text-gray-800 mb-1">{c.q.question}</p>

                        {/* Payload preview */}
                        <div className="text-xs text-gray-500 bg-white/70 rounded-lg px-3 py-2 font-mono">
                          {c.q.type === 'multiple_choice' || c.q.type === 'error_correction'
                            ? c.q.payload?.options?.map((o, oi) => (
                                <span key={oi} className={`inline-block mr-2 ${oi === c.q.correct ? 'text-green-700 font-bold' : ''}`}>
                                  {String.fromCharCode(65+oi)}. {o}
                                </span>
                              ))
                            : c.q.type === 'fill_in_blank'
                              ? <span>Bank: {c.q.payload?.word_bank?.join(', ')} | ✓ {c.q.correct}</span>
                            : c.q.type === 'reorder'
                              ? <span>Words: {c.q.payload?.words?.join(' / ')} | ✓ {c.q.correct?.join(' ')}</span>
                            : c.q.type === 'matching'
                              ? <span>{c.q.payload?.pairs?.map(p => `${p.word}→${p.meaning}`).join(' | ')}</span>
                            : null
                          }
                        </div>

                        {/* Explanation */}
                        <p className="text-xs text-gray-500 mt-1 italic">💡 {c.q.explanation}</p>

                        {/* Errors */}
                        {c.errors.length > 0 && (
                          <p className="text-xs text-red-600 mt-1 font-semibold">
                            ❌ {c.errors.join(', ')}
                          </p>
                        )}
                        {c.dupInfo.isDuplicate && (
                          <p className="text-xs text-yellow-700 mt-1">
                            Tương tự: "{c.dupInfo.similarTo}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {saveMsg && (
              <p className={`text-sm font-bold p-3 rounded-xl ${saveMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {saveMsg}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setGenError('') }} className="btn-secondary flex-1">
                ← Tạo lại
              </button>
              <button
                onClick={handleSave}
                disabled={selectedCount === 0 || saving}
                className="btn-start flex-1"
              >
                {saving ? '⏳ Đang lưu...' : `💾 Lưu ${selectedCount} câu`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
