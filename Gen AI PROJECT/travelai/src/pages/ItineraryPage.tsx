import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAI } from '../hooks/useAI'
import { makeOpenAIRequest } from '../services/langchainService'

const ItineraryPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, itinerary, createItinerary, improveItinerary } = useAI()
  
  const destination = location.state?.destination
  const duration = location.state?.duration || '3'
  const destinationData = location.state?.destinationData

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [topPlaces, setTopPlaces] = useState<string[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleOpenFeedbackModal = () => {
    setFeedback('')
    setShowFeedbackModal(true)
  }

  const handleCloseFeedbackModal = () => {
    if (optimizing) return
    setShowFeedbackModal(false)
  }

  const handleOptimizeSubmit = async () => {
    if (!feedback.trim()) return

    console.log('Starting itinerary optimization with feedback:', feedback)
    console.log('Current itinerary has', itinerary.length, 'days')

    try {
      setOptimizing(true)
      await improveItinerary(itinerary, feedback)
      console.log('Optimization completed successfully')
      setShowFeedbackModal(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (e) {
      console.error('Failed to optimize itinerary from UI:', e)
    } finally {
      setOptimizing(false)
    }
  }

  const generateTopPlaces = async (destinationName: string) => {
    try {
      setLoadingPlaces(true)
      const response = await makeOpenAIRequest([
        {
          role: 'system',
          content: 'You are a travel expert. Generate exactly 5 top tourist attractions/places for the given destination. Return as a JSON object with a "places" array containing 5 strings.'
        },
        {
          role: 'user',
          content: `Generate the top 5 must-visit places in ${destinationName}. Return as JSON object: {"places": ["Place 1", "Place 2", "Place 3", "Place 4", "Place 5"]}`
        }
      ], 0.7, 300)
      
      console.log('AI Response:', response) // Debug log
      const parsed = JSON.parse(response)
      const places = parsed.places || parsed
      
      if (Array.isArray(places) && places.length >= 3) {
        setTopPlaces(places.slice(0, 5)) // Take first 5 places
      } else {
        console.log('AI response not in expected format, using fallback')
        // Fallback if AI response is not in expected format
        setTopPlaces([
          `${destinationName} Historic Center`,
          `Main Temple/Cathedral in ${destinationName}`,
          `${destinationName} Museum`,
          `Local Market in ${destinationName}`,
          `Scenic Viewpoint near ${destinationName}`
        ])
      }
    } catch (error) {
      console.error('Failed to generate top places:', error)
      // Fallback on error
      setTopPlaces([
        `${destinationName} Historic Center`,
        `Main Temple/Cathedral in ${destinationName}`,
        `${destinationName} Museum`,
        `Local Market in ${destinationName}`,
        `Scenic Viewpoint near ${destinationName}`
      ])
    } finally {
      setLoadingPlaces(false)
    }
  }

  useEffect(() => {
    if (destination && duration) {
      createItinerary(destination, duration)
      generateTopPlaces(destination)
    }
  }, [destination, duration, createItinerary])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 py-8 px-4 relative overflow-hidden">
      {/* Rich Background Elements */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-blue-400/50 to-indigo-400/40 blur-xl rounded-full animate-[float_25s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-sky-400/45 to-blue-400/35 blur-xl rounded-full animate-[float_30s_ease-in-out_infinite] -z-10" style={{ animationDelay: '12s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-400/40 to-sky-400/30 blur-xl rounded-full animate-[float_35s_ease-in-out_infinite] -z-10" style={{ animationDelay: '18s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-300/35 to-blue-300/25 blur-2xl rounded-full animate-[float_28s_ease-in-out_infinite] -z-10" style={{ animationDelay: '8s' }}></div>
      
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {showSuccess && (
          <div className="bg-green-100/80 backdrop-blur-sm text-green-800 p-4 rounded-xl shadow-lg border border-green-200/50 text-sm">
            ✅ Itinerary optimized successfully!
          </div>
        )}

        {destination ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {destination}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {destinationData?.country && (
                    <span className="font-medium">{destinationData.country}</span>
                  )}
                  {destinationData?.budgetRange && (
                    <span className="ml-2">• Budget: {destinationData.budgetRange}</span>
                  )}
                  {destinationData?.bestTime && (
                    <span className="ml-2">• Best Time: {destinationData.bestTime}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">Duration: {duration} days</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleOpenFeedbackModal}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 text-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  disabled={loading || optimizing || itinerary.length === 0}
                >
                  {optimizing ? '✨ Optimizing...' : '✨ Improve / Optimize Itinerary'}
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm text-blue-700 border border-blue-200/50 rounded-lg shadow-lg hover:bg-blue-50/80 text-sm transition-all duration-200 hover:scale-105"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>

            {destinationData && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 mt-4 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  {destinationData.images && destinationData.images[0] && (
                    <div className="w-full md:w-56 h-40 md:h-auto overflow-hidden flex-shrink-0">
                      <img
                        src={destinationData.images[0].url}
                        alt={destinationData.images[0].alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Info Section */}
                  <div className="p-5 flex-1 min-w-0">
                    <div className="space-y-4">
                      {/* About and Highlights Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* About Section - Creative 2-3 lines */}
                        {destinationData.intro && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 text-sm border-l-3 border-blue-500 pl-3">About {destination}</h4>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {(() => {
                                const sentences = destinationData.intro.split('.').filter((s: string) => s.trim().length > 0);
                                const creativeLine1 = sentences[0] ? sentences[0].trim() + '.' : '';
                                const creativeLine2 = sentences[1] ? sentences[1].trim() + '.' : '';
                                const creativeLine3 = sentences[2] ? sentences[2].trim() + '.' : '';
                                
                                return (
                                  <>
                                    {creativeLine1 && <p className="mb-1">{creativeLine1}</p>}
                                    {creativeLine2 && <p className="mb-1">{creativeLine2}</p>}
                                    {creativeLine3 && <p>{creativeLine3}</p>}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        
                        {/* Highlights Section - Top 5 Places */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-sm border-l-3 border-blue-500 pl-3">Top 5 Places</h4>
                          <div className="text-sm text-gray-700">
                            {loadingPlaces ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-500">Loading top places...</span>
                              </div>
                            ) : (
                              <ul className="space-y-1">
                                {topPlaces.map((place: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-blue-600 font-medium mr-2">{index + 1}.</span>
                                    <span className="flex-1">{place}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Error Display */}
                      {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border-l-3 border-red-400">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              {loading ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-10 text-center border border-blue-200/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your personalized itinerary...</p>
                </div>
              ) : itinerary.length > 0 ? (
                <div className="space-y-8">
                  {itinerary.map((day: any, index: number) => (
                    <div key={index} className="group relative">
                      {/* Day Card */}
                      <div className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                        {/* Day Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{day.day}</span>
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-white">
                                  Day {day.day}
                                </h2>
                                <p className="text-blue-100 text-sm">{day.title}</p>
                              </div>
                            </div>
                            <div className="text-blue-100 text-sm">
                              {day.activities?.length || 0} activities
                            </div>
                          </div>
                        </div>

                        {/* Activities Timeline */}
                        <div className="p-6">
                          <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-blue-300"></div>
                            
                            <div className="space-y-6">
                              {day.activities?.map((activity: any, actIndex: number) => (
                                <div key={actIndex} className="relative flex items-start space-x-4 group/activity">
                                  {/* Timeline Dot */}
                                  <div className="relative z-10 w-3 h-3 bg-blue-500 rounded-full mt-2 group-hover/activity:bg-blue-600 transition-colors duration-200 shadow-sm"></div>
                                  
                                  {/* Activity Card */}
                                  <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50 hover:bg-white/80 hover:border-blue-200/60 transition-all duration-200 hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                      <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                                          {activity.time}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm">
                                          {activity.name}
                                        </h3>
                                      </div>
                                      {activity.duration && (
                                        <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                                          {activity.duration}
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {activity.details}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-10 text-center border border-blue-200/50">
                  <p className="text-gray-600">No itinerary generated yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-blue-200/50">
            <div className="mb-4">
              <span className="text-4xl">🗺️</span>
            </div>
            <p className="text-gray-700 text-lg mb-3">
              No destination selected
            </p>
            <p className="text-gray-500 text-sm">
              Please go back to the dashboard and select a destination.
            </p>
            <button
              onClick={handleBackToDashboard}
              className="mt-6 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 text-sm transition-all duration-200 hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {showFeedbackModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-blue-200/50 mx-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-semibold text-gray-900">Improve Itinerary</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Tell us what to improve (for example: "less museums, more beaches", "reduce walking", "more family-friendly activities").
              </p>
              <textarea
                className="w-full h-32 border border-blue-200/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-blue-50/30 backdrop-blur-sm"
                placeholder="Tell us what to improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={handleCloseFeedbackModal}
                  className="px-4 py-2 rounded-lg border border-blue-200/50 text-gray-700 text-sm hover:bg-blue-50/50 disabled:opacity-60 transition-all duration-200"
                  disabled={optimizing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleOptimizeSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 text-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  disabled={optimizing || !feedback.trim()}
                >
                  {optimizing ? '✨ Optimizing...' : '✨ Optimize'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItineraryPage
