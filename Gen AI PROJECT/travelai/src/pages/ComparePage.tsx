import { useNavigate } from 'react-router-dom';
import { useAIStore } from '../state/aiStore';
import { estimateBudget } from '../utils/budgetEstimator';
import { getWeatherSnapshot } from '../utils/weatherSnapshot';
import { getProsCons } from '../utils/prosConsGenerator';

const ComparePage = () => {
  const navigate = useNavigate();
  const { compareList, preferences } = useAIStore();
  
  // Debug logging
  console.log('ComparePage - compareList:', compareList);
  console.log('ComparePage - compareList length:', compareList.length);
  console.log('ComparePage - preferences:', preferences);

  if (!compareList || compareList.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Not enough destinations to compare</h1>
          <p className="text-gray-600 text-sm mb-4">Please select at least two destinations from the dashboard to compare them side-by-side.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Generate comparison summary
  const budgets = compareList.map(dest => estimateBudget(dest, preferences));
  const bestBudgetIndex = budgets.reduce((minIndex, budget, index) => 
    budget.total < budgets[minIndex].total ? index : minIndex, 0);
  const mostActivitiesIndex = compareList.reduce((maxIndex, dest, index) => 
    (dest.highlights?.length || 0) > (compareList[maxIndex].highlights?.length || 0) ? index : maxIndex, 0);
  
  const getBestForTags = (dest: any) => {
    const name = (dest.name || '').toLowerCase();
    const country = (dest.country || '').toLowerCase();
    const highlights = (dest.highlights || []).join(' ').toLowerCase();
    const description = (dest.description || '').toLowerCase();
    const combined = `${name} ${country} ${highlights} ${description}`;
    
    const tags = [];
    
    // Destination-specific tags
    if (name.includes('zermatt') || combined.includes('matterhorn') || combined.includes('alps')) {
      tags.push('🎿 Skiing', '🏔️ Mountain Views', '❄️ Winter Sports');
    }
    else if (name.includes('lapland') || combined.includes('northern lights') || combined.includes('arctic')) {
      tags.push('🌌 Northern Lights', '🐕 Winter Activities', '❄️ Arctic Experience');
    }
    else if (combined.includes('thailand') || combined.includes('bangkok') || combined.includes('phuket')) {
      tags.push('🍜 Street Food', '🏛️ Temples', '🌴 Tropical Paradise');
    }
    else if (combined.includes('japan') || combined.includes('tokyo') || combined.includes('kyoto')) {
      tags.push('🏯 Culture', '🍣 Cuisine', '🚅 Technology');
    }
    else if (combined.includes('maldives') || combined.includes('seychelles') || combined.includes('mauritius')) {
      tags.push('🏖️ Beaches', '💑 Honeymoons', '🏨 Luxury Resorts');
    }
    else {
      // Generic tags based on content
      if (combined.includes('beach') || combined.includes('coast')) tags.push('🌴 Beaches');
      if (combined.includes('mountain') || combined.includes('hill')) tags.push('🏔️ Mountains');
      if (combined.includes('shop') || combined.includes('market')) tags.push('🛍️ Shopping');
      if (combined.includes('family') || combined.includes('kid')) tags.push('👨‍👩‍👧 Family Trips');
      if (combined.includes('romantic') || combined.includes('couple')) tags.push('💑 Honeymoons');
      if (combined.includes('adventure') || combined.includes('trek')) tags.push('🎯 Adventure');
      if (combined.includes('culture') || combined.includes('heritage')) tags.push('🏛️ Culture');
      if (combined.includes('ski') || combined.includes('snow')) tags.push('🎿 Winter Sports');
      if (combined.includes('wildlife') || combined.includes('safari')) tags.push('🦁 Wildlife');
      if (combined.includes('food') || combined.includes('cuisine')) tags.push('🍽️ Food & Cuisine');
    }
    
    return tags.length > 0 ? tags.slice(0, 3) : ['🌍 General Travel'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Compare Destinations</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm hover:bg-blue-50"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Comparison Summary Box */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-blue-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Comparison Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-600">Overall Best Budget:</span>
              <div className="font-semibold text-green-600">{compareList[bestBudgetIndex].name}</div>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Best Weather:</span>
              <div className="font-semibold text-blue-600">{compareList[0].name}</div>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Most Activities:</span>
              <div className="font-semibold text-purple-600">{compareList[mostActivitiesIndex].name}</div>
            </div>
          </div>
        </div>

        {/* Main Comparison Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
          {compareList.map((dest: any, index: number) => {
            const budget = estimateBudget(dest, preferences);
            const weather = getWeatherSnapshot(dest.name);
            const prosCons = getProsCons(dest);
            const bestForTags = getBestForTags(dest);

            return (
              <div key={index} className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
                {/* Overview Section */}
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{dest.name}</h2>
                  <p className="text-sm text-gray-500 mb-2">{dest.country}</p>
                  <p className="text-xs text-gray-600 mb-2">Best Time: {dest.bestTime}</p>
                  <p className="text-xs text-gray-700 line-clamp-2">{dest.description}</p>
                </div>

                {/* Weather Snapshot */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">Weather</h3>
                  <div className="bg-blue-50 rounded-lg p-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600">Temperature:</span>
                        <div className="font-semibold">{weather.temp}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Weather:</span>
                        <div className="font-semibold">{weather.weather}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Humidity:</span>
                        <div className="font-semibold">{weather.humidity}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Rainfall:</span>
                        <div className="font-semibold">{weather.rainfall}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">Pros & Cons</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Pros:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {prosCons.pros.map((pro, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-1">Cons:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {prosCons.cons.map((con, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-red-500 mr-1">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Best For Tags */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">Best For</h3>
                  <div className="flex flex-wrap gap-1">
                    {bestForTags.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget Breakdown Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Budget Breakdown Table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  {compareList.map((dest, index) => (
                    <th key={index} className="px-4 py-3 text-center font-semibold text-gray-700">
                      {dest.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['flight', 'stay', 'food', 'activities', 'total'].map((category) => (
                  <tr key={category} className={category === 'total' ? 'bg-blue-50 font-semibold' : ''}>
                    <td className="px-4 py-3 capitalize border-b border-gray-100">
                      {category === 'total' ? 'Total' : category}
                    </td>
                    {compareList.map((dest, index) => {
                      const budget = estimateBudget(dest, preferences);
                      return (
                        <td key={index} className="px-4 py-3 text-center border-b border-gray-100">
                          ₹{budget[category as keyof typeof budget].toLocaleString('en-IN')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
