import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home    from './pages/Home'
import Quiz    from './pages/Quiz'
import Result  from './pages/Result'
import History from './pages/History'

export default function App() {
  return (
    <BrowserRouter basename="/english-quizzer">
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/quiz"    element={<Quiz />} />
        <Route path="/result"  element={<Result />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}
