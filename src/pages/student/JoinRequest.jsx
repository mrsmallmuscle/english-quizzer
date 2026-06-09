import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { supabase } from '../../utils/supabase'
import { Link } from 'react-router-dom'

const STATUS_INFO = {
  pending:  { label: '⏳ Đang chờ duyệt', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  approved: { label: '✅ Đã được duyệt',  color: 'bg-green-50  border-green-200  text-green-700'  },
  rejected: { label: '❌ Không được duyệt', color: 'bg-red-50  border-red-200    text-red-600'    },
}

export default function JoinRequest() {
  const { user, profile } = useAuth()
  const [request, setRequest]   = useState(null)   // request hiện tại
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('join_requests')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRequest(data)
        setLoading(false)
      })
  }, [user])

  async function handleSubmit() {
    if (!message.trim()) { setMsg('Vui lòng nhập lời nhắn.'); return }
    setSaving(true)
    setMsg('')
    const { data, error } = await supabase
      .from('join_requests')
      .upsert({ user_id: user.id, message: message.trim(), status: 'pending' })
      .select()
      .single()
    if (error) {
      setMsg('❌ Lỗi: ' + error.message)
    } else {
      setRequest(data)
      setMsg('✅ Đã gửi yêu cầu! Vui lòng chờ admin duyệt.')
    }
    setSaving(false)
  }

  async function handleCancel() {
    if (!request) return
    await supabase.from('join_requests').delete().eq('id', request.id)
    setRequest(null)
    setMessage('')
    setMsg('Đã huỷ yêu cầu.')
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="flex justify-center mt-20">
          <div className="text-4xl animate-bounce">📬</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper pb-10">
      <Navbar />
      <div className="px-4 pt-4 space-y-4">
        <div className="pt-2">
          <p className="text-xl font-black text-gray-800">📬 Xin tham gia lớp học</p>
          <p className="text-sm text-gray-500 mt-0.5">Gửi yêu cầu để giáo viên gán bài học cho bạn</p>
        </div>

        {/* Trạng thái request hiện tại */}
        {request && (
          <div className={`rounded-2xl border-2 p-4 ${STATUS_INFO[request.status]?.color}`}>
            <p className="font-bold text-sm">{STATUS_INFO[request.status]?.label}</p>
            {request.message && (
              <p className="text-xs mt-1 opacity-80">Lời nhắn: "{request.message}"</p>
            )}
            {request.status === 'rejected' && (
              <p className="text-xs mt-2 opacity-70">Bạn có thể gửi lại yêu cầu mới.</p>
            )}
          </div>
        )}

        {/* Form gửi request */}
        {(!request || request.status === 'rejected') && (
          <div className="card space-y-4">
            <p className="text-sm font-bold text-gray-700">
              {request?.status === 'rejected' ? 'Gửi lại yêu cầu' : 'Gửi yêu cầu mới'}
            </p>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
              <p><strong>👤 Tên:</strong> {profile?.display_name}</p>
              <p><strong>📧 Email:</strong> {user?.email}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Lời nhắn cho giáo viên</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Con muốn học SKET8, hiện đang học Unit 3..."
                className="input-field resize-none"
              />
            </div>
            {msg && <p className="text-sm font-semibold text-green-600">{msg}</p>}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-start w-full"
            >
              {saving ? '⏳ Đang gửi...' : '📬 Gửi yêu cầu'}
            </button>
          </div>
        )}

        {/* Huỷ request đang pending */}
        {request?.status === 'pending' && (
          <button
            onClick={handleCancel}
            className="btn-secondary w-full text-red-400"
          >
            Huỷ yêu cầu
          </button>
        )}

        {/* Đã approved */}
        {request?.status === 'approved' && (
          <div className="card text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-bold text-gray-700">Bạn đã được thêm vào lớp!</p>
            <p className="text-sm text-gray-400 mt-1">Giáo viên sẽ gán bài học cho bạn.</p>
            <Link to="/student" className="btn-primary inline-block mt-4 px-8">
              Vào Dashboard →
            </Link>
          </div>
        )}

        {msg && !request && (
          <p className="text-sm text-center text-gray-500">{msg}</p>
        )}
      </div>
    </div>
  )
}
