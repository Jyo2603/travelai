import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import { useAI } from '../hooks/useAI'

const ChatPage = () => {
  const navigate = useNavigate()
  const { loading, messages, chat } = useAI()
  const [message, setMessage] = useState('')

  const handleSendMessage = async () => {
    if (message.trim() && !loading) {
      const userMessage = message
      setMessage('')
      await chat(userMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="bg-white/70 hover:bg-white/90 text-blue-700 p-2 rounded-xl transition-colors duration-200 shadow-sm mr-4"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
            AI Travel Assistant
          </h1>
        </div>
        
        <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6 mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about destinations, activities, or travel tips..."
              className="flex-1 p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="bg-blue-200 hover:bg-blue-300 disabled:bg-gray-200 disabled:text-gray-400 text-blue-800 p-3 rounded-xl transition-colors duration-200 shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
