import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, signUp } from '../utils/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Nếu đã login → redirect
  if (user) {
    navigate(isAdmin ? '/admin' : '/student', { replace: true })
    return null
  }

  const [tab, setTab]           = useState('login')  // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (tab === 'login') {
        await signIn({ email, password })
        // AuthContext sẽ tự update, redirect qua useEffect
      } else {
        if (!name.trim()) { setError('Vui lòng nhập tên hiển thị.'); setLoading(false); return }
        await signUp({ email, password, displayName: name.trim() })
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.')
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không đúng.'
        : err.message === 'User already registered'
          ? 'Email này đã được đăng ký.'
          : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="quiz-header">
        <Link to="/" className="btn-back">← Quay lại</Link>
      </div>

      {/* Hero */}
      <div className="home-hero pb-4">
        <div className="hero-icon">📚</div>
        <h1 className="hero-title">English Quizzer</h1>
        <p className="hero-sub">Đăng nhập để lưu tiến độ học tập</p>
      </div>

      {/* Form card */}
      <div className="card">
        {/* Tabs */}
        <div className="flex rounded-2xl bg-gray-100 p-1 gap-1">
          <button
            onClick={() => { setTab('login'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'register' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Tên hiển thị</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn An"
                className="input-field"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'Ít nhất 6 ký tự' : '••••••••'}
              className="input-field"
              minLength={6}
              required
            />
          </div>

          {error   && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 rounded-xl px-3 py-2">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-start w-full text-base"
          >
            {loading ? '⏳ Đang xử lý...' : tab === 'login' ? '🚀 Đăng nhập' : '✅ Tạo tài khoản'}
          </button>
        </form>
      </div>

      {/* Guest option */}
      <div className="mx-4 mt-4 text-center">
        <p className="text-xs text-gray-400 mb-2">── hoặc ──</p>
        <Link to="/" className="btn-secondary w-full block text-center py-3 rounded-2xl text-sm">
          🎮 Chơi ngay không cần tài khoản
        </Link>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 pb-8 px-8">
        Không đăng nhập vẫn chơi được, nhưng kết quả chỉ lưu trên thiết bị này.
      </p>
    </div>
  )
}
