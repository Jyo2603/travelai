import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TravelPreferences {
  budget: string;
  locationTypes: string[];
  hotelPreference: string;
  tripDuration: string;
  travelStyle: string;
  travelGuide: string;
  packageType: string;
}

interface Destination {
  name: string;
  country: string;
  match: number;
  budgetRange: string;
  bestTime: string;
  highlights: string[];
}

interface AIState {
  preferences: TravelPreferences | null;
  destinations: Destination[];
  trendingDestinations: Destination[];
  compareList: Destination[];
  setPreferences: (preferences: TravelPreferences) => void;
  setDestinations: (destinations: Destination[]) => void;
  setTrendingDestinations: (destinations: Destination[]) => void;
  addToCompare: (destination: Destination) => void;
  removeFromCompare: (destination: Destination) => void;
  clearAll: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      preferences: null,
      destinations: [],
      trendingDestinations: [],
      compareList: [],
      setPreferences: (preferences) => set({ preferences }),
      setDestinations: (destinations) => set({ destinations }),
      setTrendingDestinations: (destinations) => set({ trendingDestinations: destinations }),
      addToCompare: (destination) => set((state) => {
        const exists = state.compareList.some((d) => d.name === destination.name && d.country === destination.country);
        if (exists) return state;
        return { compareList: [...state.compareList, destination] };
      }),
      removeFromCompare: (destination) => set((state) => ({
        compareList: state.compareList.filter((d) => !(d.name === destination.name && d.country === destination.country)),
      })),
      clearAll: () => set({ destinations: [], preferences: null, trendingDestinations: [], compareList: [] }),
    }),
    {
      name: 'travelai-storage',
    }
  )
);
