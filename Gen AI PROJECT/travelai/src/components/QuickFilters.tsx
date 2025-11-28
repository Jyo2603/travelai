interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const FILTERS = ['Budget Friendly', 'Family Friendly', 'Adventure', 'Nature', 'Luxury'];

const QuickFilters = ({ activeFilter, onFilterChange }: QuickFiltersProps) => {
  const handleClick = (filter: string) => {
    if (activeFilter === filter) {
      onFilterChange(null);
    } else {
      onFilterChange(filter);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 mt-4">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => handleClick(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
};

export default QuickFilters;
