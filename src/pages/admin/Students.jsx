import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

export default function AdminStudents() {
  const { user } = useAuth()
  const [students, setStudents]     = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)  // student đang xem
  const [showAssign, setShowAssign] = useState(false)
  const [curricList, setCurricList] = useState([])
  const [unitsList, setUnitsList]   = useState([])
  const [form, setForm]             = useState({ curriculum: '', unit: '', note: '' })
  const [saving, setSaving]         = useState(false)
  const [msg, setMsg]               = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: studs }, { data: assigns }, { data: currics }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student').order('created_at'),
      supabase.from('assignments').select('*').order('assigned_at', { ascending: false }),
      supabase.from('questions').select('curriculum').eq('is_active', true),
    ])
    setStudents(studs || [])
    setAssignments(assigns || [])
    const uniq = [...new Set((currics || []).map(r => r.curriculum))].sort()
    setCurricList(uniq)
    setLoading(false)
  }

  async function loadUnits(curriculum) {
    const { data } = await supabase
      .from('questions')
      .select('unit')
      .eq('is_active', true)
      .eq('curriculum', curriculum)
    const uniq = [...new Set((data || []).map(r => r.unit))].sort()
    setUnitsList(uniq)
  }

  function getStudentAssignments(studentId) {
    return assignments.filter(a => a.student_id === studentId)
  }

  async function handleAssign() {
    if (!selected || !form.curriculum) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('assignments').upsert({
      student_id:  selected.id,
      curriculum:  form.curriculum,
      unit:        form.unit || null,
      assigned_by: user.id,
      note:        form.note || null,
    }, { onConflict: 'student_id,curriculum,unit' })

    if (error) {
      setMsg('❌ Lỗi: ' + error.message)
    } else {
      setMsg('✅ Gán bài thành công!')
      setForm({ curriculum: '', unit: '', note: '' })
      setShowAssign(false)
      await loadAll()
    }
    setSaving(false)
  }

  async function handleRemoveAssign(assignId) {
    await supabase.from('assignments').delete().eq('id', assignId)
    await loadAll()
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <div className="text-4xl animate-bounce">👥</div>
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
            <p className="text-xl font-black text-gray-800">👥 Học viên</p>
            <p className="text-sm text-gray-500">{students.length} học viên</p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-bold text-gray-500">Chưa có học viên nào.</p>
            <p className="text-sm text-gray-400 mt-1">Học viên sẽ xuất hiện sau khi đăng ký tài khoản.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map(student => {
              const stuAssigns = getStudentAssignments(student.id)
              const isOpen = selected?.id === student.id

              return (
                <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Row */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    onClick={() => {
                      setSelected(isOpen ? null : student)
                      setShowAssign(false)
                      setMsg('')
                    }}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 shrink-0">
                      {student.display_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{student.display_name}</p>
                      <p className="text-xs text-gray-400">
                        {stuAssigns.length} bài được gán
                      </p>
                    </div>
                    <span className="text-gray-300 text-sm">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* Detail */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50 space-y-3">

                      {/* Assignments */}
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bài được gán</p>
                      {stuAssigns.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Chưa có bài nào được gán.</p>
                      ) : (
                        <div className="space-y-2">
                          {stuAssigns.map(a => (
                            <div key={a.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
                              <span className="text-sm font-semibold text-gray-700 flex-1">
                                📖 {a.curriculum}{a.unit ? ` · ${a.unit}` : ' (tất cả unit)'}
                              </span>
                              <button
                                onClick={() => handleRemoveAssign(a.id)}
                                className="text-red-400 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Gán bài */}
                      {!showAssign ? (
                        <button
                          onClick={() => setShowAssign(true)}
                          className="btn-primary w-full text-sm py-2.5"
                        >
                          + Gán bài mới
                        </button>
                      ) : (
                        <div className="bg-white rounded-2xl border border-blue-100 p-4 space-y-3">
                          <p className="text-sm font-bold text-blue-700">Gán bài cho {student.display_name}</p>

                          <div className="form-group">
                            <label className="form-label">Chương trình *</label>
                            <select
                              value={form.curriculum}
                              onChange={e => {
                                setForm(f => ({ ...f, curriculum: e.target.value, unit: '' }))
                                if (e.target.value) loadUnits(e.target.value)
                              }}
                              className="input-field"
                            >
                              <option value="">-- Chọn curriculum --</option>
                              {curricList.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>

                          {unitsList.length > 0 && (
                            <div className="form-group">
                              <label className="form-label">Unit (để trống = cả chương trình)</label>
                              <select
                                value={form.unit}
                                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                className="input-field"
                              >
                                <option value="">-- Tất cả unit --</option>
                                {unitsList.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                          )}

                          <div className="form-group">
                            <label className="form-label">Ghi chú (tuỳ chọn)</label>
                            <input
                              type="text"
                              value={form.note}
                              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                              placeholder="Ví dụ: Ôn thi tuần này..."
                              className="input-field"
                            />
                          </div>

                          {msg && <p className="text-sm font-semibold">{msg}</p>}

                          <div className="flex gap-2">
                            <button
                              onClick={() => { setShowAssign(false); setMsg('') }}
                              className="btn-secondary flex-1 text-sm py-2.5"
                            >Huỷ</button>
                            <button
                              onClick={handleAssign}
                              disabled={!form.curriculum || saving}
                              className="btn-primary flex-1 text-sm py-2.5"
                            >{saving ? '⏳...' : '✅ Gán bài'}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
