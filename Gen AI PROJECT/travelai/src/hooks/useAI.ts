import { useState, useCallback } from 'react';
import {
  getDestinationRecommendations,
  generateItinerary,
  optimizeItinerary,
  chatWithAssistantLC,
} from '../services/langchainService';
import { getCityIntro } from '../services/wikipediaService';
import { getWhatToSee, getWhatToDo, getCitySummary } from '../services/wikivoyageService';
import { getDestinationImages } from '../services/wikimediaImageService';

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

interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    name: string;
    details: string;
  }[];
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your AI travel assistant. How can I help you plan your trip?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const fetchDestinations = useCallback(async (preferences: TravelPreferences) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await getDestinationRecommendations(preferences);
      setDestinations(results);
    } catch (err) {
      setError('Failed to fetch destination recommendations. Please try again.');
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItinerary = useCallback(async (destination: string, duration: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateItinerary(destination, duration);
      setItinerary(result);
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
      console.error('Error creating itinerary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const improveItinerary = useCallback(async (plan: ItineraryDay[], feedback: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const optimizedPlan = await optimizeItinerary(plan, feedback);
      setItinerary(optimizedPlan);
    } catch (err) {
      setError('Failed to optimize itinerary. Please try again.');
      console.error('Error optimizing itinerary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Get chat history for context (last 10 messages)
      const history = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const chatMessages = [
        ...history,
        { role: 'user', content: message },
      ];

      const reply = await chatWithAssistantLC(chatMessages);
      
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: reply,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
      console.error('Error in chat:', err);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  // Real data wrapper functions
  const fetchCityIntro = useCallback(async (cityName: string) => {
    try {
      return await getCityIntro(cityName);
    } catch (err) {
      console.error('Error fetching city intro:', err);
      return '';
    }
  }, []);

  const fetchWhatToSee = useCallback(async (cityName: string) => {
    try {
      return await getWhatToSee(cityName);
    } catch (err) {
      console.error('Error fetching what to see:', err);
      return '';
    }
  }, []);

  const fetchWhatToDo = useCallback(async (cityName: string) => {
    try {
      return await getWhatToDo(cityName);
    } catch (err) {
      console.error('Error fetching what to do:', err);
      return '';
    }
  }, []);

  const fetchDestinationImages = useCallback(async (cityName: string) => {
    try {
      return await getDestinationImages(cityName);
    } catch (err) {
      console.error('Error fetching destination images:', err);
      return [];
    }
  }, []);

  const enrichDestinationsWithRealData = useCallback(async (destinationList: any[]) => {
    try {
      const enriched = await Promise.all(
        destinationList.map(async (dest) => {
          const [intro, summary, whatToSee, whatToDo, images] = await Promise.all([
            fetchCityIntro(dest.name),
            getCitySummary(dest.name),
            fetchWhatToSee(dest.name),
            fetchWhatToDo(dest.name),
            fetchDestinationImages(dest.name)
          ]);
          
          return {
            ...dest,
            intro,
            summary,
            whatToSee,
            whatToDo,
            images: images.slice(0, 3)
          };
        })
      );
      
      return enriched;
    } catch (err) {
      console.error('Error enriching destinations:', err);
      return destinationList;
    }
  }, [fetchCityIntro, fetchWhatToSee, fetchWhatToDo, fetchDestinationImages]);

  return {
    loading,
    error,
    destinations,
    itinerary,
    messages,
    fetchDestinations,
    createItinerary,
    improveItinerary,
    chat,
    resetState,
    // Real data functions
    fetchCityIntro,
    fetchWhatToSee,
    fetchWhatToDo,
    fetchDestinationImages,
    enrichDestinationsWithRealData
  };
};
