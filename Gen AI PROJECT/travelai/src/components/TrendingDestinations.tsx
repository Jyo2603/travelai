import { useEffect } from 'react';
import { useAIStore } from '../state/aiStore';
import { getTrendingDestinations } from '../services/langchainService';

const TrendingDestinations = () => {
  const { trendingDestinations, setTrendingDestinations } = useAIStore();

  useEffect(() => {
    const loadTrending = async () => {
      if (trendingDestinations.length > 0) return;
      try {
        const results = await getTrendingDestinations();
        setTrendingDestinations(results as any);
      } catch (err) {
        console.error('Failed to load trending destinations:', err);
      }
    };
    loadTrending();
  }, [trendingDestinations, setTrendingDestinations]);

  if (!trendingDestinations || trendingDestinations.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
        Trending Destinations
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Popular places other travelers are exploring right now.
      </p>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {trendingDestinations.map((dest: any, index: number) => (
            <div
              key={index}
              className="min-w-[200px] bg-white/80 border border-blue-100 rounded-xl p-3 shadow-sm hover:shadow-md transition"
            >
              <div className="text-sm font-semibold text-gray-900">
                {dest.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{dest.country}</div>
              <div className="text-xs text-gray-500 mt-1">Best time: {dest.bestTime}</div>
              <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                {dest.shortDescription}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingDestinations;
