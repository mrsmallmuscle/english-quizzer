import Navbar from '../../components/Navbar'
import { Link } from 'react-router-dom'

export default function Explore() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="px-4 pt-6 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="font-bold text-gray-600">Khám phá câu hỏi</p>
        <p className="text-sm text-gray-400 mt-1 mb-6">Đang xây dựng — sẽ hiển thị toàn bộ ngân hàng câu hỏi.</p>
        <Link to="/" className="btn-primary inline-block px-6">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
