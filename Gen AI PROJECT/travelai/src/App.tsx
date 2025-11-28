import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ItineraryPage from './pages/ItineraryPage'
import ChatPage from './pages/ChatPage'
import ComparePage from './pages/ComparePage'
import ProfilePage from './pages/ProfilePage'
import AIEvaluationPage from './pages/AIEvaluationPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ai-evaluation" element={<AIEvaluationPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
