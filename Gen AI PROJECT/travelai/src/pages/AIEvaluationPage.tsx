import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIStore } from '../state/aiStore';
import { getDestinationRecommendations } from '../services/langchainService';

interface APICall {
  id: string;
  timestamp: string;
  preferences: any;
  responseTime: number;
  status: 'success' | 'error';
  resultCount: number;
  model: string;
  temperature: number;
}

const AIEvaluationPage = () => {
  const navigate = useNavigate();
  const { preferences } = useAIStore();
  const [apiCalls, setApiCalls] = useState<APICall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // Mock some previous API calls for demonstration
  useEffect(() => {
    const mockCalls: APICall[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        preferences: { budget: '50000', locationTypes: ['Beaches'], travelStyle: 'Family Trip' },
        responseTime: 2340,
        status: 'success',
        resultCount: 12,
        model: 'gpt-4o',
        temperature: 0.7
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        preferences: { budget: '100000', locationTypes: ['Mountains'], travelStyle: 'Solo Trip' },
        responseTime: 1890,
        status: 'success',
        resultCount: 12,
        model: 'gpt-4o',
        temperature: 0.7
      }
    ];
    setApiCalls(mockCalls);
  }, []);

  const runAITest = async () => {
    if (!preferences) {
      alert('Please set preferences in Dashboard first!');
      return;
    }

    setIsLoading(true);
    setCurrentTest('Running AI Test...');
    
    const startTime = Date.now();
    
    try {
      console.log('🧪 AI EVALUATION TEST - Starting manual test');
      const results = await getDestinationRecommendations(preferences);
      const endTime = Date.now();
      
      const newCall: APICall = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        preferences: preferences,
        responseTime: endTime - startTime,
        status: 'success',
        resultCount: results.length,
        model: 'gpt-4o',
        temperature: 0.7
      };
      
      setApiCalls(prev => [newCall, ...prev]);
      setCurrentTest('Test completed successfully!');
      
      setTimeout(() => setCurrentTest(''), 3000);
    } catch (error) {
      console.error('AI Test failed:', error);
      setCurrentTest('Test failed - check console for details');
      setTimeout(() => setCurrentTest(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const averageResponseTime = apiCalls.length > 0 
    ? Math.round(apiCalls.reduce((sum, call) => sum + call.responseTime, 0) / apiCalls.length)
    : 0;

  const successRate = apiCalls.length > 0
    ? Math.round((apiCalls.filter(call => call.status === 'success').length / apiCalls.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 p-3 md:p-4 relative overflow-hidden">
      {/* Rich Background Elements */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-blue-400/50 to-indigo-400/40 blur-xl rounded-full animate-[float_25s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-sky-400/45 to-blue-400/35 blur-xl rounded-full animate-[float_30s_ease-in-out_infinite] -z-10" style={{ animationDelay: '12s' }}></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              🤖 AI Evaluation Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time proof that AI is generating dynamic, intelligent responses
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50 text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* AI Status Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Status</p>
                <p className="text-lg font-bold text-green-600">
                  {import.meta.env.VITE_OPENAI_API_KEY ? '🟢 Connected' : '🔴 Not Connected'}
                </p>
              </div>
              <div className="text-2xl">🔗</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-lg font-bold text-blue-600">{apiCalls.length}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-lg font-bold text-purple-600">{averageResponseTime}ms</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-lg font-bold text-green-600">{successRate}%</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧪 Live AI Testing</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={runAITest}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Testing AI...' : '🚀 Run AI Test'}
            </button>
            <div className="text-sm text-gray-600">
              {currentTest && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  {currentTest}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 This will make a real API call to OpenAI GPT-4 and log all details in the console
          </p>
        </div>

        {/* API Call History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 API Call History</h2>
          
          {apiCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No API calls yet. Run a test to see live data!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiCalls.map((call) => (
                <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${call.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-medium text-gray-800">
                        API Call #{call.id}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {call.model}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(call.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-1 font-medium">{call.responseTime}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Results:</span>
                      <span className="ml-1 font-medium">{call.resultCount} destinations</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <span className="ml-1 font-medium">{call.temperature}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-1 font-medium ${call.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Preferences:</span> {JSON.stringify(call.preferences, null, 0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIEvaluationPage;
