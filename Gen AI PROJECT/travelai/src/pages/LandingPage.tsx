import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    navigate('/dashboard');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 flex items-center justify-center">
      {/* Rich Background Elements */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-blue-400/50 to-indigo-400/40 blur-xl rounded-full animate-[float_25s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-sky-400/45 to-blue-400/35 blur-xl rounded-full animate-[float_30s_ease-in-out_infinite] -z-10" style={{ animationDelay: '12s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-400/40 to-sky-400/30 blur-xl rounded-full animate-[float_35s_ease-in-out_infinite] -z-10" style={{ animationDelay: '18s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-300/35 to-blue-300/25 blur-2xl rounded-full animate-[float_28s_ease-in-out_infinite] -z-10" style={{ animationDelay: '8s' }}></div>
      
      {/* Top Navigation */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <button
          onClick={handleLogin}
          className="px-6 py-2 text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          Sign In
        </button>
        <button
          onClick={handleSignup}
          className="px-6 py-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-blue-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200/50"
        >
          Sign Up
        </button>
      </div>
      
      {/* Hero Container */}
      <div className="z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        {/* Clean Icon */}
        <div className="mb-8 animate-[fadeInUp_0.8s_ease-out_0s_both]">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200/50">
            <span className="text-4xl">✈️</span>
          </div>
        </div>

        {/* Clean Title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight animate-[fadeInUp_0.8s_ease-out_0.1s_both] mb-6">
          TravelAI
        </h1>

        {/* Clear Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl leading-relaxed animate-[fadeInUp_0.8s_ease-out_0.25s_both] mb-12 font-light">
          Discover your perfect destination with AI-powered recommendations and create personalized travel itineraries in seconds.
        </p>

        {/* Primary CTA */}
        <button
          onClick={handleStartPlanning}
          className="group px-12 py-4 bg-gradient-to-r from-blue-100 to-sky-200 hover:from-blue-200 hover:to-sky-300 text-blue-800 font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-[fadeInUp_0.8s_ease-out_0.4s_both] mb-8 border border-blue-200/50"
        >
          <span className="flex items-center gap-3">
            Start Planning Your Trip
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </span>
        </button>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI-Powered Recommendations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Personalized Itineraries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Instant Results</span>
          </div>
        </div>
      </div>

      {/* Subtle Decorative Elements */}
      <div className="absolute top-20 right-20 text-2xl opacity-10 animate-[float_20s_ease-in-out_infinite]">🗺️</div>
      <div className="absolute bottom-20 left-20 text-2xl opacity-10 animate-[float_25s_ease-in-out_infinite]" style={{ animationDelay: '10s' }}>🏖️</div>
    </div>
  );
};

export default LandingPage;
