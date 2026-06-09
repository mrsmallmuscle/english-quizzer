import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public
import Home    from './pages/Home'
import Quiz    from './pages/Quiz'
import Result  from './pages/Result'
import History from './pages/History'
import Login   from './pages/Login'

// Student
import StudentDashboard from './pages/student/Dashboard'
import StudentHistory   from './pages/student/MyHistory'
import Explore          from './pages/student/Explore'
import JoinRequest      from './pages/student/JoinRequest'

// Admin
import AdminDashboard    from './pages/admin/Dashboard'
import AdminStudents     from './pages/admin/Students'
import AdminQuestions    from './pages/admin/Questions'
import AiImport          from './pages/admin/AiImport'
import AdminJoinRequests from './pages/admin/JoinRequests'

export default function App() {
  return (
    <BrowserRouter basename="/english-quizzer">
      <AuthProvider>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"        element={<Home />} />
          <Route path="/quiz"    element={<Quiz />} />
          <Route path="/result"  element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/login"   element={<Login />} />

          {/* ── Student ── */}
          <Route path="/student" element={
            <ProtectedRoute><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/history" element={
            <ProtectedRoute><StudentHistory /></ProtectedRoute>
          } />
          <Route path="/student/explore" element={
            <ProtectedRoute><Explore /></ProtectedRoute>
          } />
          <Route path="/student/join" element={
            <ProtectedRoute><JoinRequest /></ProtectedRoute>
          } />

          {/* ── Admin ── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>
          } />
          <Route path="/admin/questions" element={
            <ProtectedRoute role="admin"><AdminQuestions /></ProtectedRoute>
          } />
          <Route path="/admin/ai-import" element={
            <ProtectedRoute role="admin"><AiImport /></ProtectedRoute>
          } />
          <Route path="/admin/join-requests" element={
            <ProtectedRoute role="admin"><AdminJoinRequests /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
