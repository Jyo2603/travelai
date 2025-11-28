import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAIStore } from '../state/aiStore'
import { getDestinationRecommendations } from '../services/langchainService'
// Removed TrendingDestinations - now integrated into main recommendations
import QuickFilters from '../components/QuickFilters'
// Removed local budget estimator - now using AI-provided real-time budget data
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { currentUser, isFirstTimeLogin, logout, loading: authLoading } = useAuth()
  const { destinations, setDestinations, preferences, setPreferences, compareList, addToCompare, removeFromCompare } = useAIStore()
  
  // Debug logging
  console.log('Dashboard - currentUser:', currentUser)
  console.log('Dashboard - isFirstTimeLogin:', isFirstTimeLogin)
  console.log('Dashboard - authLoading:', authLoading)
  console.log('Dashboard - compareList:', compareList)
  console.log('Dashboard - compareList length:', compareList.length)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [budget, setBudget] = useState('')
  const [locationTypes, setLocationTypes] = useState<string[]>([])
  const [hotelPreference, setHotelPreference] = useState('')
  const [tripDuration, setTripDuration] = useState('')
  const [travelStyle, setTravelStyle] = useState('')
  const [travelGuide, setTravelGuide] = useState('')
  const [packageType, setPackageType] = useState('')
  const [showRecommendations, setShowRecommendations] = useState(destinations.length > 0)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    if (destinations.length > 0) {
      setShowRecommendations(true)
    }
  }, [destinations])

  const handleLocationTypeChange = (locationType: string) => {
    setLocationTypes(prev => 
      prev.includes(locationType) 
        ? prev.filter(i => i !== locationType)
        : [...prev, locationType]
    )
  }

  const handleGetRecommendations = async () => {
    const preferences = {
      budget,
      locationTypes,
      hotelPreference,
      tripDuration,
      travelStyle,
      travelGuide,
      packageType
    }

    setPreferences(preferences)

    setLoading(true)
    setError(null)

    try {
      const results = await getDestinationRecommendations(preferences as any)
      setDestinations(results as any)
      setShowRecommendations(true)
    } catch (err) {
      console.error('Error fetching destinations:', err)
      setError('Failed to fetch destination recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewItinerary = (destination: any) => {
    navigate('/itinerary', { 
      state: { 
        destination: destination.name, 
        duration: tripDuration,
        destinationData: destination
      } 
    })
  }

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter)
  }

  const isInCompare = (destination: any) => {
    return compareList.some((d) => d.name === destination.name && d.country === destination.country)
  }

  const handleToggleCompare = (destination: any) => {
    if (isInCompare(destination)) {
      removeFromCompare(destination)
    } else {
      addToCompare(destination)
    }
  }

  const applyQuickFilter = (items: any[]) => {
    if (!activeFilter) return items

    return items.filter((dest) => {
      const name = `${dest.name} ${dest.description || ''} ${(dest.highlights || []).join(' ')}`.toLowerCase()
      const budgetText = (dest.budgetRange || '').toLowerCase()
      const travelStyles = (dest.travelStyles || []).map((s: string) => s.toLowerCase())
      const budget = dest.budgetEstimate?.total || 0
      
      // Get user preferences for better filtering
      const userLocationTypes = preferences?.locationTypes || []
      const userBudget = parseInt(preferences?.budget || '50000') || 50000
      const userTravelStyle = preferences?.travelStyle?.toLowerCase() || ''

      switch (activeFilter) {
        case 'Budget Friendly':
          // Filter by actual budget numbers and budget-related keywords
          return budget <= userBudget * 0.8 || 
                 budgetText.includes('budget') || 
                 budgetText.includes('low') || 
                 budgetText.includes('affordable') ||
                 budgetText.includes('cheap')
                 
        case 'Family Friendly':
          // Check travel style and family-related keywords
          return userTravelStyle.includes('family') ||
                 travelStyles.some((style: string) => style.includes('family')) ||
                 name.includes('family') || 
                 name.includes('kids') ||
                 name.includes('children') ||
                 name.includes('playground') ||
                 name.includes('zoo') ||
                 name.includes('theme park')
                 
        case 'Adventure':
          // Check for adventure activities and location types
          return userLocationTypes.includes('Mountains') ||
                 name.includes('adventure') || 
                 name.includes('hike') || 
                 name.includes('trek') ||
                 name.includes('climb') ||
                 name.includes('safari') ||
                 name.includes('diving') ||
                 name.includes('rafting') ||
                 name.includes('skiing') ||
                 travelStyles.some((style: string) => style.includes('adventure'))
                 
        case 'Nature':
          // Check for nature-related location types and keywords
          return userLocationTypes.includes('Nature & Wildlife') ||
                 userLocationTypes.includes('Mountains') ||
                 name.includes('nature') || 
                 name.includes('wildlife') || 
                 name.includes('national park') ||
                 name.includes('forest') ||
                 name.includes('jungle') ||
                 name.includes('safari') ||
                 name.includes('reserve') ||
                 name.includes('sanctuary')
                 
        case 'Luxury':
          // Filter by high budget and luxury keywords
          return budget >= userBudget * 1.2 ||
                 budgetText.includes('high') || 
                 budgetText.includes('luxury') || 
                 budgetText.includes('premium') ||
                 budgetText.includes('5-star') ||
                 budgetText.includes('deluxe') ||
                 preferences?.hotelPreference === '5' ||
                 name.includes('luxury') ||
                 name.includes('resort')
                 
        default:
          return true
      }
    })
  }

  const renderedDestinations = applyQuickFilter(destinations)
  
  // Separate trending and regular destinations
  const trendingDestinations = renderedDestinations.filter((dest: any) => dest.isTrending === true)
  const regularDestinations = renderedDestinations.filter((dest: any) => dest.isTrending !== true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 p-3 md:p-4 relative overflow-hidden">
      {/* Rich Background Elements */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-blue-400/50 to-indigo-400/40 blur-xl rounded-full animate-[float_25s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-sky-400/45 to-blue-400/35 blur-xl rounded-full animate-[float_30s_ease-in-out_infinite] -z-10" style={{ animationDelay: '12s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-400/40 to-sky-400/30 blur-xl rounded-full animate-[float_35s_ease-in-out_infinite] -z-10" style={{ animationDelay: '18s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-300/35 to-blue-300/25 blur-2xl rounded-full animate-[float_28s_ease-in-out_infinite] -z-10" style={{ animationDelay: '8s' }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="text-center sm:text-left">
            {authLoading ? (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Loading...
              </h1>
            ) : currentUser ? (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {isFirstTimeLogin ? `Welcome, ${currentUser.firstName}!` : `Welcome back, ${currentUser.firstName}!`}
                </h1>
                <p className="text-gray-600 text-sm mt-1">Plan your next amazing adventure</p>
              </div>
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Plan Your Trip
              </h1>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/ai-evaluation')}
              className="bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-purple-200/50 text-sm"
            >
              🤖 AI Proof
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-r from-blue-100 to-sky-200 hover:from-blue-200 hover:to-sky-300 text-blue-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200/50 text-sm"
            >
              AI Chat
            </button>
            {!authLoading && currentUser && (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50 text-sm"
                >
                  Profile
                </button>
                <button
                  onClick={async () => {
                    try {
                      await logout();
                      navigate('/');
                    } catch (error) {
                      console.error('Error logging out:', error);
                    }
                  }}
                  className="bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-red-200/50 text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-blue-100">
          {/* Basic Trip Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">1</span>
              Basic Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-sm">
                  Budget (INR)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., 150000"
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-sm">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={tripDuration}
                  onChange={(e) => setTripDuration(e.target.value)}
                  placeholder="e.g., 7"
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          {/* Location Preferences */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">2</span>
              Location Preferences
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                'Tropical',
                'Winter / Snow',
                'Beaches',
                'Mountains',
                'Historical',
                'City Life',
                'Nature & Wildlife'
              ].map((location) => (
                <label key={location} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={locationTypes.includes(location)}
                    onChange={() => handleLocationTypeChange(location)}
                    className="w-4 h-4 text-blue-500 border-blue-300 rounded focus:ring-blue-300"
                  />
                  <span className="text-gray-700 text-xs font-medium">{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">3</span>
              Travel Preferences
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Hotel Preference
                </h3>
                <div className="space-y-2">
                  {[
                    '1 Star',
                    '2 Star',
                    '3 Star',
                    '4 Star',
                    '5 Star'
                  ].map((hotel) => (
                    <label key={hotel} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                      <input
                        type="radio"
                        name="hotelPreference"
                        value={hotel}
                        checked={hotelPreference === hotel}
                        onChange={(e) => setHotelPreference(e.target.value)}
                        className="w-4 h-4 text-blue-500 border-blue-300 focus:ring-blue-300"
                      />
                      <span className="text-gray-700 text-sm">{hotel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Travel Style
                </h3>
                <div className="space-y-2">
                  {[
                    'Solo Trip',
                    'Group Trip',
                    'Family Trip'
                  ].map((style) => (
                    <label key={style} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                      <input
                        type="radio"
                        name="travelStyle"
                        value={style}
                        checked={travelStyle === style}
                        onChange={(e) => setTravelStyle(e.target.value)}
                        className="w-4 h-4 text-blue-500 border-blue-300 focus:ring-blue-300"
                      />
                      <span className="text-gray-700 text-sm">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">4</span>
              Additional Options
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Travel Guide
                </h3>
                <div className="space-y-2">
                  {[
                    'With Travel Guide',
                    'Without Travel Guide'
                  ].map((guide) => (
                    <label key={guide} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                      <input
                        type="radio"
                        name="travelGuide"
                        value={guide}
                        checked={travelGuide === guide}
                        onChange={(e) => setTravelGuide(e.target.value)}
                        className="w-4 h-4 text-blue-500 border-blue-300 focus:ring-blue-300"
                      />
                      <span className="text-gray-700 text-sm">{guide}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Package Type
                </h3>
                <div className="space-y-2">
                  {[
                    'With Flight',
                    'Without Flight'
                  ].map((packageOption) => (
                    <label key={packageOption} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                      <input
                        type="radio"
                        name="packageType"
                        value={packageOption}
                        checked={packageType === packageOption}
                        onChange={(e) => setPackageType(e.target.value)}
                        className="w-4 h-4 text-blue-500 border-blue-300 focus:ring-blue-300"
                      />
                      <span className="text-gray-700 text-sm">{packageOption}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="text-center">
            <button 
              onClick={handleGetRecommendations}
              className="bg-gradient-to-r from-blue-100 to-sky-200 hover:from-blue-200 hover:to-sky-300 text-blue-800 font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200/50 flex items-center justify-center mx-auto"
            >
              Get AI Recommendations
            </button>
          </div>
        </div>
        
        {/* Trending destinations now integrated into main recommendations below */}

        {/* Quick Filters + Destination Recommendations */}
        {showRecommendations && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                Your Perfect Destinations
              </h2>
              <p className="text-gray-600 text-sm">Based on your preferences, here are our top picks!</p>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <QuickFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Finding perfect destinations for you...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Trending Destinations Section */}
                {trendingDestinations.length > 0 && (
                  <div>
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-2xl border border-orange-200/50 shadow-lg">
                        <span className="text-lg animate-pulse">🔥</span>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          TRENDING FOR YOU
                        </h3>
                        <span className="text-lg animate-pulse">🔥</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trendingDestinations.map((destination: any, index: number) => {
                        // Use AI-provided budget data or fallback to default structure
                        const budgetEstimate = destination.budgetEstimate || {
                          flight: 0,
                          stay: 0,
                          food: 0,
                          activities: 0,
                          total: 0
                        }
                        const selected = isInCompare(destination)
                        return (
                          <div
                            key={index}
                            className="bg-white shadow-md rounded-xl overflow-hidden border-2 border-orange-200 hover:shadow-lg transition relative"
                          >
                    {/* Trending Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span className="text-xs">🔥</span>
                        <span>TRENDING</span>
                      </div>
                    </div>
                    {destination.imageUrl && (
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <h3 className="text-lg font-semibold">
                        {destination.name}, {destination.country}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        Best Time: {destination.bestTime}
                      </p>

                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {destination.description}
                      </p>

                      <div className="mt-3">
                        <p className="text-sm font-medium">Must Visit:</p>
                        <ul className="list-disc ml-4 text-xs text-gray-600">
                          {destination.highlights?.slice(0, 3).map((h: string, i: number) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3 border-t pt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Budget Estimate</p>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>Flight: ₹{budgetEstimate.flight.toLocaleString('en-IN')}</div>
                          <div>Stay: ₹{budgetEstimate.stay.toLocaleString('en-IN')}</div>
                          <div>Food: ₹{budgetEstimate.food.toLocaleString('en-IN')}</div>
                          <div>Activities: ₹{budgetEstimate.activities.toLocaleString('en-IN')}</div>
                          <div className="font-semibold mt-1">Total: ₹{budgetEstimate.total.toLocaleString('en-IN')}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewItinerary(destination)}
                        className="w-full mt-4 bg-gradient-to-r from-blue-100 to-sky-200 hover:from-blue-200 hover:to-sky-300 text-blue-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200/50 text-sm"
                      >
                        View Itinerary
                      </button>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <label className="flex items-center gap-1 text-gray-600">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleToggleCompare(destination)}
                            className="w-3 h-3 text-blue-500 border-blue-300 rounded"
                          />
                          <span>Compare</span>
                        </label>
                      </div>
                    </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Regular Destinations Section */}
                {regularDestinations.length > 0 && (
                  <div>
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-sky-100 px-6 py-3 rounded-2xl border border-blue-200/50 shadow-lg">
                        <span className="text-2xl">📍</span>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                          MORE DESTINATIONS
                        </h3>
                        <span className="text-2xl">✨</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularDestinations.map((destination: any, index: number) => {
                        // Use AI-provided budget data or fallback to default structure
                        const budgetEstimate = destination.budgetEstimate || {
                          flight: 0,
                          stay: 0,
                          food: 0,
                          activities: 0,
                          total: 0
                        }
                        const selected = isInCompare(destination)
                        return (
                        <div
                          key={index}
                          className="bg-white shadow-md rounded-xl overflow-hidden border hover:shadow-lg transition"
                        >
                          {destination.imageUrl && (
                            <img
                              src={destination.imageUrl}
                              alt={destination.name}
                              className="w-full h-48 object-cover"
                            />
                          )}

                          <div className="p-4">
                            <h3 className="text-lg font-semibold">
                              {destination.name}, {destination.country}
                            </h3>

                            <p className="text-sm text-gray-600 mt-1">
                              Best Time: {destination.bestTime}
                            </p>

                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {destination.description}
                            </p>

                            <div className="mt-3">
                              <p className="text-sm font-medium">Must Visit:</p>
                              <ul className="list-disc ml-4 text-xs text-gray-600">
                                {destination.highlights?.slice(0, 3).map((h: string, i: number) => (
                                  <li key={i}>{h}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-3 border-t pt-3">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Budget Estimate</p>
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div>Flight: ₹{budgetEstimate.flight.toLocaleString('en-IN')}</div>
                                <div>Stay: ₹{budgetEstimate.stay.toLocaleString('en-IN')}</div>
                                <div>Food: ₹{budgetEstimate.food.toLocaleString('en-IN')}</div>
                                <div>Activities: ₹{budgetEstimate.activities.toLocaleString('en-IN')}</div>
                                <div className="font-semibold mt-1">Total: ₹{budgetEstimate.total.toLocaleString('en-IN')}</div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleViewItinerary(destination)}
                              className="w-full mt-4 bg-gradient-to-r from-blue-100 to-sky-200 hover:from-blue-200 hover:to-sky-300 text-blue-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200/50 text-sm"
                            >
                              View Itinerary
                            </button>
                            <div className="mt-2 flex items-center justify-between text-xs">
                              <label className="flex items-center gap-1 text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => handleToggleCompare(destination)}
                                  className="w-3 h-3 text-blue-500 border-blue-300 rounded"
                                />
                                <span>Compare</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Placeholder Cards */}
        {!showRecommendations && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-400 mb-1">
                Your Recommendations Will Appear Here
              </h2>
              <p className="text-gray-500 text-sm">Fill out the form and click "Get AI Recommendations"!</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white/30 border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center hover:border-blue-300 transition-all duration-200">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-sm text-blue-400 font-medium">{index}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400">Destination {index}</h3>
                    <p className="text-gray-400 text-xs">Waiting for preferences...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {compareList.length >= 2 && (
          <button
            onClick={() => navigate('/compare')}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg"
          >
            Compare Selected ({compareList.length})
          </button>
        )}
      </div>
    </div>
  )
}

export default Dashboard
