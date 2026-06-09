import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '../../utils/supabase'

const TYPE_LABEL = {
  multiple_choice:  '🔤 Trắc nghiệm',
  fill_in_blank:    '✏️ Điền từ',
  reorder:          '🔀 Sắp xếp',
  error_correction: '🔍 Sửa lỗi',
  matching:         '🔗 Nối từ',
}

const TYPE_COLORS = {
  multiple_choice:  'bg-blue-100 text-blue-700',
  fill_in_blank:    'bg-green-100 text-green-700',
  reorder:          'bg-purple-100 text-purple-700',
  error_correction: 'bg-orange-100 text-orange-700',
  matching:         'bg-pink-100 text-pink-700',
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [curricList, setCurricList] = useState([])
  const [filterCurric, setFilterCurric] = useState('')
  const [filterUnit, setFilterUnit]     = useState('')
  const [filterType, setFilterType]     = useState('')
  const [unitsList, setUnitsList] = useState([])
  const [deleting, setDeleting]   = useState(null)
  const [search, setSearch]       = useState('')

  useEffect(() => { loadQuestions() }, [])

  useEffect(() => {
    let list = questions
    if (filterCurric) list = list.filter(q => q.curriculum === filterCurric)
    if (filterUnit)   list = list.filter(q => q.unit === filterUnit)
    if (filterType)   list = list.filter(q => q.type === filterType)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(q => q.question.toLowerCase().includes(s))
    }
    setFiltered(list)
  }, [questions, filterCurric, filterUnit, filterType, search])

  async function loadQuestions() {
    setLoading(true)
    const { data } = await supabase
      .from('questions')
      .select('id, curriculum, unit, type, question, explanation, is_active, created_at')
      .order('id')
    setQuestions(data || [])
    const uniqC = [...new Set((data || []).map(q => q.curriculum))].sort()
    setCurricList(uniqC)
    setLoading(false)
  }

  useEffect(() => {
    if (!filterCurric) { setUnitsList([]); setFilterUnit(''); return }
    const units = [...new Set(questions.filter(q => q.curriculum === filterCurric).map(q => q.unit))].sort()
    setUnitsList(units)
    setFilterUnit('')
  }, [filterCurric, questions])

  async function toggleActive(q) {
    await supabase.from('questions').update({ is_active: !q.is_active }).eq('id', q.id)
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function handleDelete(id) {
    if (!window.confirm('Xoá câu hỏi này?')) return
    setDeleting(id)
    await supabase.from('questions').delete().eq('id', id)
    setQuestions(prev => prev.filter(q => q.id !== id))
    setDeleting(null)
  }

  // Thống kê theo type
  const typeCounts = Object.fromEntries(
    Object.keys(TYPE_LABEL).map(t => [t, questions.filter(q => q.type === t).length])
  )

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <div className="text-4xl animate-bounce">📝</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper pb-10">
      <Navbar />
      <div className="px-4 pt-4 space-y-4">

        <div className="pt-2 flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-gray-800">📝 Câu hỏi</p>
            <p className="text-sm text-gray-500">{questions.length} câu · hiển thị {filtered.length}</p>
          </div>
        </div>

        {/* Type breakdown */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_LABEL).map(([type, label]) => (
            <span key={type} className={`text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[type]}`}>
              {label}: {typeCounts[type]}
            </span>
          ))}
        </div>

        {/* Filters */}
        <div className="card space-y-3 py-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm kiếm câu hỏi..."
            className="input-field"
          />
          <div className="flex gap-2 flex-wrap">
            <select value={filterCurric} onChange={e => setFilterCurric(e.target.value)} className="input-field flex-1 min-w-[120px]">
              <option value="">Tất cả curriculum</option>
              {curricList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {unitsList.length > 0 && (
              <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="input-field flex-1 min-w-[100px]">
                <option value="">Tất cả unit</option>
                {unitsList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            )}
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field flex-1 min-w-[130px]">
              <option value="">Tất cả loại</option>
              {Object.entries(TYPE_LABEL).map(([t, l]) => <option key={t} value={t}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map(q => (
            <div key={q.id} className={`bg-white rounded-2xl border px-4 py-3 ${q.is_active ? 'border-gray-100' : 'border-gray-200 opacity-50'}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[q.type]}`}>
                      {TYPE_LABEL[q.type]}
                    </span>
                    <span className="text-xs text-gray-400">{q.curriculum} · {q.unit}</span>
                    {!q.is_active && <span className="text-xs text-gray-400 italic">ẩn</span>}
                  </div>
                  <p className="text-sm text-gray-700 font-semibold line-clamp-2">{q.question}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(q)}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                    title={q.is_active ? 'Ẩn câu hỏi' : 'Hiện câu hỏi'}
                  >
                    {q.is_active ? '👁 Ẩn' : '👁 Hiện'}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deleting === q.id}
                    className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 font-semibold"
                  >
                    {deleting === q.id ? '...' : '🗑 Xoá'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">Không tìm thấy câu hỏi nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
