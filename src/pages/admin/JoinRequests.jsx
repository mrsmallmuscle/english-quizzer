import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

const STATUS_STYLE = {
  pending:  'bg-yellow-50 border-yellow-200',
  approved: 'bg-green-50  border-green-200 opacity-60',
  rejected: 'bg-gray-50   border-gray-200  opacity-60',
}

const STATUS_LABEL = {
  pending:  '⏳ Chờ duyệt',
  approved: '✅ Đã duyệt',
  rejected: '❌ Đã từ chối',
}

export default function AdminJoinRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [processing, setProcessing] = useState(null)
  const [filter, setFilter]     = useState('pending')

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('join_requests')
      .select('*, profiles(display_name, id)')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  async function handleAction(req, action) {
    setProcessing(req.id)
    const { error } = await supabase
      .from('join_requests')
      .update({
        status:      action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.id)

    if (!error) {
      setRequests(prev => prev.map(r =>
        r.id === req.id ? { ...r, status: action } : r
      ))
    }
    setProcessing(null)
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

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

        <div className="pt-2 flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-gray-800">📬 Yêu cầu tham gia</p>
            <p className="text-sm text-gray-500">
              {pendingCount > 0
                ? <span className="text-orange-500 font-bold">{pendingCount} yêu cầu chờ duyệt</span>
                : 'Không có yêu cầu nào đang chờ'}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[['pending','⏳ Chờ'], ['approved','✅ Đã duyệt'], ['rejected','❌ Từ chối'], ['all','Tất cả']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`filter-chip flex-1 text-xs justify-center ${filter === val ? 'active' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 font-semibold text-sm">Không có yêu cầu nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => (
              <div key={req.id} className={`rounded-2xl border-2 p-4 ${STATUS_STYLE[req.status]}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 shrink-0 text-sm">
                    {req.profiles?.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-gray-800">
                        {req.profiles?.display_name}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {STATUS_LABEL[req.status]}
                      </span>
                    </div>
                    {req.message && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        💬 "{req.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Action buttons chỉ hiện cho pending */}
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAction(req, 'rejected')}
                      disabled={processing === req.id}
                      className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold active:scale-95 transition-all"
                    >
                      {processing === req.id ? '...' : '❌ Từ chối'}
                    </button>
                    <button
                      onClick={() => handleAction(req, 'approved')}
                      disabled={processing === req.id}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-bold active:scale-95 transition-all"
                    >
                      {processing === req.id ? '...' : '✅ Duyệt'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
