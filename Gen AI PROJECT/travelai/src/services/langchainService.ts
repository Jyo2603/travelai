import { getWikipediaData } from './wikipediaService';
import { getWikivoyageData } from './wikivoyageService';
import { fetchDestinationImage } from './pexelsService';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Helper: strip markdown/code fences and extract first JSON object/array
const safeExtractJson = (text: string): string | null => {
  if (!text || typeof text !== 'string') return null;
  
  // Remove markdown code fences ```json ... ``` or ``` ... ```
  let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
  
  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // If string starts with text before JSON, try to find first { or [
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const start = (firstBrace === -1) ? firstBracket : (firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket));
  
  if (start > 0) cleaned = cleaned.slice(start);
  if (start === -1) return null; // No JSON found
  
  // Find the matching closing brace for the opening brace
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let end = -1;
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          end = i;
          break;
        }
      }
    }
  }
  
  if (end === -1) return null;
  cleaned = cleaned.slice(0, end + 1);
  return cleaned;
};

const safeParseJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Try extracting JSON substring
    const extracted = safeExtractJson(raw);
    if (extracted) {
      try { return JSON.parse(extracted); } catch (e2) { /* fall through */ }
    }
    // If still fails, throw with diagnostic info
    const err: any = new Error('safeParseJson: failed to parse JSON');
    err.raw = raw;
    throw err;
  }
};

export const getTrendingDestinations = async () => {
  const systemPrompt = `You are a travel trends analyst.

Your task is to list currently trending travel destinations globally.

Return ONLY valid JSON with this exact shape:
{
  "trendingDestinations": [
    {
      "name": string,
      "country": string,
      "bestTime": string,
      "shortDescription": string
    }
  ]
}

Do not include any extra text, comments, or markdown.`;

  const userPrompt = `Generate exactly 6 trending travel destinations from around the world.

Each destination should have:
- name (city or region)
- country
- bestTime (short phrase)
- shortDescription (1–2 sentence teaser)`;

  try {
    const startTime = Date.now();
    console.log('📤 Sending Prompt to OpenAI GPT-4:');
    console.log('📝 Prompt Length:', userPrompt.length, 'characters');
    console.log('🔑 Using OpenAI API Key:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Valid' : '❌ Missing');
    
    const response = await makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.5, 800);

    console.log('📊 Response Received:', response);
    console.log('🕒 Response Time:', Date.now() - startTime, 'ms');
    
    const json = safeParseJson(response);
    if (Array.isArray(json?.trendingDestinations)) {
      return json.trendingDestinations;
    }
    return [];
  } catch (error) {
    console.error('Failed to get trending destinations:', error);
    return [];
  }
};

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
  description?: string;
  idealDuration?: string;
  travelStyles?: string[];
  imageUrl?: string;
  isTrending?: boolean; // Flag to mark trending destinations
  // Real-time budget data
  budgetEstimate?: {
    flight: number;
    stay: number;
    food: number;
    activities: number;
    total: number;
  };
  // Real data fields
  intro?: string;
  summary?: string;
  whatToSee?: string;
  whatToDo?: string;
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

export const makeOpenAIRequest = async (messages: any[], temperature = 0.7, maxTokens = 3000) => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Log response details for debugging
    console.log('OpenAI Response Details:', {
      model: data.model,
      usage: data.usage,
      contentLength: content.length,
      finishReason: data.choices[0]?.finish_reason
    });
    
    // Check if response was truncated
    if (data.choices[0]?.finish_reason === 'length') {
      console.warn('⚠️ OpenAI response was truncated due to max_tokens limit. Consider increasing maxTokens parameter.');
    }
    
    return content;
  } catch (error) {
    console.error('OpenAI API request failed:', error);
    throw error;
  }
};

const enrichDestinationWithRealData = async (destination: any): Promise<any> => {
  try {
    const cityName = destination.name;
    
    // Fetch real data from all sources in parallel
    const [wikipediaData, wikivoyageData] = await Promise.all([
      getWikipediaData(cityName).catch(() => ({ intro: '' })),
      getWikivoyageData(cityName).catch(() => ({ summary: '', whatToSee: '', whatToDo: '' })),
    ]);
    
    return {
      ...destination,
      intro: wikipediaData.intro,
      summary: wikivoyageData.summary,
      whatToSee: wikivoyageData.whatToSee,
      whatToDo: wikivoyageData.whatToDo,
    };
  } catch (error) {
    console.error(`Error enriching destination ${destination.name}:`, error);
    // Return original destination if enrichment fails
    return {
      ...destination,
      intro: '',
      summary: '',
      whatToSee: '',
      whatToDo: '',
    };
  }
};

export const getDestinationRecommendations = async (preferences: TravelPreferences) => {
  const startTime = Date.now();
  console.log('🤖 AI EVALUATION - Starting OpenAI API Call');
  console.log('📊 Request Timestamp:', new Date().toISOString());
  console.log('📝 User Preferences:', preferences);
  console.log('🔑 Using OpenAI API Key:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Valid' : '❌ Missing');
  
  try {
    // 1. LangChain Model Setup
    const llm = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000,
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });

    console.log('🧠 AI Model Config:', {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000,
      timestamp: new Date().toISOString()
    });

    const parser = new JsonOutputParser();

    const schemaString = `
"destinations": [
  {{
    "name": "string",
    "country": "string",
    "bestTime": "string",
    "budgetRange": "string",
    "match": "number",
    "description": "string",
    "highlights": ["string"],
    "idealDuration": "string",
    "travelStyles": ["string"],
    "isTrending": "boolean (true for first 5 destinations, false for rest)",
    "budgetEstimate": {{
      "flight": "number (in INR)",
      "stay": "number (in INR)",
      "food": "number (in INR)",
      "activities": "number (in INR)",
      "total": "number (in INR)"
    }}
  }}
]
`;

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a global travel expert with access to real-time travel pricing data. ' +
          'Research current travel costs and provide accurate budget estimates. ' +
          'Respond ONLY with valid JSON matching the schema.',
      ],
      [
        'user',
        'User preferences:\n{preferences}\n\n' +
          'Generate EXACTLY 12 destinations with REAL-TIME budget estimates.\n\n' +
          'IMPORTANT: Structure the response as:\n' +
          '- First 5 destinations: TRENDING destinations that match user preferences (set isTrending: true)\n' +
          '- Next 7 destinations: Additional great matches (set isTrending: false)\n\n' +
          'For TRENDING destinations, prioritize:\n' +
          '- Currently popular destinations in 2024\n' +
          '- Destinations matching user location preferences\n' +
          '- Seasonal trending spots based on bestTime\n' +
          '- Instagram-worthy, social media popular places\n\n' +
          'For budgetEstimate, research and provide current pricing in INR for:\n' +
          '- Flight: Round-trip from major Indian cities (Delhi/Mumbai/Bangalore)\n' +
          '- Stay: Per night cost based on hotel preference and duration\n' +
          '- Food: Daily food costs (local + some dining out)\n' +
          '- Activities: Sightseeing, tours, and experiences\n' +
          '- Total: Sum of all categories\n\n' +
          'Consider the user\'s budget, travel style, and trip duration.\n' +
          'Use current market rates and seasonal pricing.\n\n' +
          'Schema:\n' + schemaString +
          '\nRespond ONLY with valid JSON.',
      ],
    ]);

    // 2. Invoke LangChain Model
    console.log('📤 Sending request to OpenAI GPT-4...');
    const chain = prompt.pipe(llm).pipe(parser);
    const json = await chain.invoke({
      preferences: JSON.stringify(preferences, null, 2),
    });

    const responseTime = Date.now() - startTime;
    console.log('📥 OpenAI Response Received!');
    console.log('⏱️ Response Time:', responseTime, 'ms');
    console.log('📊 Raw AI Response:', json);
    console.log('🔍 Destinations Count:', json?.destinations?.length || 0);

    if (!json?.destinations || !Array.isArray(json.destinations)) {
      console.warn('❌ AI EVALUATION - Invalid JSON Response:', json);
      return [];
    }

    const aiData = json.destinations;
    console.log('✅ AI EVALUATION - Valid destinations generated:', aiData.length);

    // 3. Add placeholder images (Pexels API removed to avoid console errors)
    for (const dest of aiData) {
      // Use a simple placeholder image URL instead of Pexels API
      dest.imageUrl = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(dest.name)}`;
      console.log('🖼️ Adding placeholder image for:', dest.name);
    }

    // KEEP EXISTING ENRICHMENT LOGIC
    const enriched = await Promise.all(
      aiData.map((destination: any) => enrichDestinationWithRealData(destination))
    );

    const totalTime = Date.now() - startTime;
    console.log('🎉 AI EVALUATION - Process Complete!');
    console.log('⏱️ Total Processing Time:', totalTime, 'ms');
    console.log('📈 Final Results Count:', enriched.length);
    console.log('🔚 Request Completed at:', new Date().toISOString());

    return enriched;
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('❌ AI EVALUATION - ERROR after', errorTime, 'ms:', error);
    console.error('🚨 Full Error Details:', error);
    return [];
  }
};

export const generateItinerary = async (destination: string, duration: string) => {
  // Zod schema for structured itinerary output
  const itinerarySchema = z.object({
    itinerary: z.array(
      z.object({
        day: z.number(),
        title: z.string(),
        activities: z.array(
          z.object({
            time: z.string(),
            name: z.string(),
            details: z.string(),
            duration: z.string(),
          })
        ),
      })
    ),
  });

  const parser = StructuredOutputParser.fromZodSchema(itinerarySchema);

  const rawFormat = parser.getFormatInstructions();
  const safeFormat = rawFormat.replace(/{/g, '{{').replace(/}/g, '}}');

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an expert travel planner with deep local knowledge. Create highly detailed, immersive itineraries. Respond ONLY in valid JSON.'],
    [
      'human',
      `Generate a comprehensive, detailed itinerary for ${destination} lasting ${duration} days.

IMPORTANT REQUIREMENTS for each activity:
- Make activity details VERY detailed and informative (3-4 sentences minimum)
- Include specific locations, addresses, or landmarks when possible
- Add practical tips, what to expect, and insider knowledge
- Mention costs, booking requirements, or special considerations
- Include cultural context and historical significance where relevant
- Suggest what to bring, wear, or prepare for each activity
- Add local food recommendations or dining suggestions
- Include transportation tips between activities

Example of detailed activity description:
"Explore the historic Hallgrímskirkja Church, Iceland's tallest building at 74.5 meters, located in the heart of Reykjavik. Take the elevator to the observation deck for panoramic views of the colorful rooftops and surrounding mountains. The church's unique architecture was inspired by basalt columns found in Iceland's nature. Entry to the church is free, but the tower costs 1,000 ISK. Visit during golden hour for the best photography opportunities, and don't miss the impressive pipe organ concerts held regularly."

Follow this JSON structure EXACTLY:
${safeFormat}`,
    ],
  ]);

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.6,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  });

  const chain = prompt.pipe(model).pipe(parser);

  try {
    const parsed = await chain.invoke({ destination, duration });

    const jsonResponse = parsed as any;

    const sanitizeTitle = (t: string) => t.replace(/^Day\s*\d+[:,\-]?\s*/i, '').trim();

    if (Array.isArray(jsonResponse.itinerary)) {
      jsonResponse.itinerary = jsonResponse.itinerary.map((d: any, idx: number) => {
        const dayNum = typeof d.day === 'number' ? d.day : idx + 1;
        const title = sanitizeTitle(d.title || '');
        const seen = new Set();
        const activities = Array.isArray(d.activities)
          ? d.activities.filter((a: any) => {
              const key = `${a.time || ''}-${a.name || ''}`.toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
          : [];
        return { day: dayNum, title, activities };
      });
    }

    return jsonResponse.itinerary || [];
  } catch (error) {
    console.error('Failed to generate itinerary:', error);
    // Enhanced fallback itinerary with unique activities per day
    const days = parseInt(duration) || 3;
    
    const dayTemplates = [
      // Day 1: Historic & Cultural
      {
        title: 'Historic City Center & Cultural Immersion',
        activities: [
          { time: '09:00 AM', name: 'Historic Walking Tour', details: `Begin your exploration of ${destination} with a comprehensive guided walking tour through the historic district. Your local guide will share fascinating stories about the city's founding, architectural evolution, and cultural significance. The tour covers major landmarks, hidden alleyways, and photo-worthy spots. Wear comfortable walking shoes and bring a camera. Most tours cost around $25-40 per person and include detailed maps and historical insights you won't find in guidebooks.`, duration: '2 hours' },
          { time: '11:30 AM', name: 'Local Coffee Culture Experience', details: 'Visit a traditional local café to experience authentic coffee culture and interact with locals.', duration: '1 hour' },
          { time: '01:00 PM', name: 'Traditional Lunch', details: `Savor authentic local cuisine at a highly-rated family-run restaurant specializing in traditional ${destination} dishes. Try the chef's recommended tasting menu featuring seasonal ingredients and regional specialties passed down through generations. The restaurant offers vegetarian options and can accommodate dietary restrictions with advance notice. Expect to spend $30-50 per person for a complete meal with local wine or beverages. Make reservations recommended, especially during peak season.`, duration: '1.5 hours' },
          { time: '03:00 PM', name: 'Cultural Museum Visit', details: 'Explore the local history and culture through interactive exhibits and artifacts.', duration: '2 hours' },
          { time: '05:30 PM', name: 'Art Gallery & Craft Workshops', details: 'Discover local artists and participate in traditional craft-making workshops.', duration: '1.5 hours' },
          { time: '07:30 PM', name: 'Historic Monument at Sunset', details: `Visit the most iconic historic monument in ${destination} during golden hour for stunning photos.`, duration: '1 hour' },
          { time: '08:45 PM', name: 'Traditional Dinner & Folk Show', details: 'Experience authentic cuisine with live traditional music and dance performances.', duration: '2 hours' }
        ]
      },
      // Day 2: Markets & Local Life
      {
        title: 'Local Markets & Authentic Experiences',
        activities: [
          { time: '08:30 AM', name: 'Morning Market Tour', details: 'Explore bustling local markets, interact with vendors, and sample fresh local produce.', duration: '2 hours' },
          { time: '11:00 AM', name: 'Cooking Class Experience', details: 'Learn to prepare traditional dishes with local ingredients from the market.', duration: '2.5 hours' },
          { time: '02:00 PM', name: 'Street Food Adventure', details: 'Guided tour of the best street food spots with tastings and cultural stories.', duration: '2 hours' },
          { time: '04:30 PM', name: 'Local Neighborhood Walk', details: 'Explore residential areas to see authentic daily life and hidden local gems.', duration: '1.5 hours' },
          { time: '06:30 PM', name: 'Artisan Workshop Visit', details: 'Meet local craftspeople and see traditional techniques in action.', duration: '1.5 hours' },
          { time: '08:30 PM', name: 'Local Tavern Experience', details: 'Enjoy dinner at a family-run establishment popular with locals.', duration: '2 hours' }
        ]
      },
      // Day 3: Nature & Scenic
      {
        title: 'Nature & Scenic Exploration',
        activities: [
          { time: '08:00 AM', name: 'Sunrise Nature Hike', details: `Early morning hike to the best viewpoint near ${destination} for breathtaking sunrise views.`, duration: '2.5 hours' },
          { time: '11:00 AM', name: 'Botanical Gardens Visit', details: 'Explore diverse flora and peaceful walking paths in the local botanical gardens.', duration: '1.5 hours' },
          { time: '01:00 PM', name: 'Scenic Lunch Spot', details: 'Enjoy lunch at a restaurant with panoramic views of the surrounding landscape.', duration: '1.5 hours' },
          { time: '03:00 PM', name: 'Water Activities', details: 'Experience local water activities like boating, swimming, or waterfall visits.', duration: '2 hours' },
          { time: '05:30 PM', name: 'Photography Walk', details: 'Capture the natural beauty and wildlife with a guided photography session.', duration: '1.5 hours' },
          { time: '07:30 PM', name: 'Sunset Viewpoint', details: `Visit the most spectacular sunset location in ${destination} for unforgettable views.`, duration: '1 hour' },
          { time: '09:00 PM', name: 'Outdoor Dinner Under Stars', details: 'Dine al fresco with local specialties while enjoying the night sky.', duration: '2 hours' }
        ]
      },
      // Day 4: Adventure & Activities
      {
        title: 'Adventure & Outdoor Activities',
        activities: [
          { time: '08:30 AM', name: 'Adventure Sports', details: `Try popular adventure activities available in ${destination} like zip-lining, rock climbing, or cycling.`, duration: '3 hours' },
          { time: '12:00 PM', name: 'Energy-Packed Lunch', details: 'Refuel with hearty local dishes at an adventure-themed restaurant.', duration: '1 hour' },
          { time: '02:00 PM', name: 'Guided Nature Trek', details: 'Explore hidden trails and discover local wildlife with an experienced guide.', duration: '2.5 hours' },
          { time: '05:00 PM', name: 'Local Sports Experience', details: 'Participate in or watch traditional local sports and games.', duration: '1.5 hours' },
          { time: '07:00 PM', name: 'Adventure Stories & Relaxation', details: 'Unwind with fellow travelers sharing adventure stories over drinks.', duration: '1.5 hours' },
          { time: '09:00 PM', name: 'Hearty Dinner', details: 'Celebrate the day with a satisfying meal featuring local specialties.', duration: '2 hours' }
        ]
      },
      // Day 5: Spiritual & Wellness
      {
        title: 'Spiritual & Wellness Journey',
        activities: [
          { time: '07:00 AM', name: 'Morning Meditation', details: 'Start with peaceful meditation at a serene location or temple.', duration: '1 hour' },
          { time: '08:30 AM', name: 'Temple & Spiritual Sites', details: `Visit the most significant religious and spiritual sites in ${destination}.`, duration: '2.5 hours' },
          { time: '11:30 AM', name: 'Wellness Treatment', details: 'Experience traditional healing practices like massage or spa treatments.', duration: '2 hours' },
          { time: '02:00 PM', name: 'Healthy Local Cuisine', details: 'Enjoy nutritious local dishes known for their health benefits.', duration: '1.5 hours' },
          { time: '04:00 PM', name: 'Yoga or Tai Chi Session', details: 'Participate in outdoor yoga or local movement practices.', duration: '1.5 hours' },
          { time: '06:00 PM', name: 'Peaceful Garden Walk', details: 'Stroll through tranquil gardens or peaceful natural areas.', duration: '1 hour' },
          { time: '07:30 PM', name: 'Mindful Dinner', details: 'End with a quiet, mindful dining experience focusing on local flavors.', duration: '2 hours' }
        ]
      }
    ];

    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: dayTemplates[i % dayTemplates.length].title,
      activities: dayTemplates[i % dayTemplates.length].activities,
    }));
  }
};

export const optimizeItinerary = async (plan: ItineraryDay[], feedback: string) => {
  const systemPrompt = `You are a strict travel planner who MUST follow user instructions exactly.

CRITICAL RULES - NO EXCEPTIONS:
1. User feedback contains MANDATORY CONSTRAINTS that you MUST obey completely
2. If user says "remove museums" - DELETE ALL museum activities immediately
3. If user says "no early morning" - DELETE ALL activities before 9 AM
4. If user says "remove [specific thing]" - DELETE ALL matching activities
5. If user says "add more [thing]" - ADD relevant activities while keeping constraints
6. NEVER keep activities that violate user constraints
7. It's better to have fewer activities than to violate user requests

DELETION KEYWORDS TO WATCH FOR:
- "remove", "delete", "no", "don't want", "skip", "avoid", "not interested"
- When you see these, you MUST delete matching activities

REPLACEMENT STRATEGY:
- After deleting unwanted activities, fill gaps with activities user would like
- Keep the same time slots but change the activity type
- Maintain logical flow and timing

OUTPUT FORMAT:
- Respond ONLY with valid JSON
- Must be: {"itinerary": [...]}
- Each day: {"day": number, "title": string, "activities": [...]}
- Each activity: {"time": string, "name": string, "details": string, "duration": string}
`;

  const userPrompt = `CURRENT ITINERARY:
${JSON.stringify({ itinerary: plan }, null, 2)}

USER CONSTRAINTS (MUST BE FOLLOWED EXACTLY):
"""
${feedback}
"""

MANDATORY STEPS:
1. READ the user feedback carefully
2. IDENTIFY what needs to be removed/changed
3. DELETE all activities that match removal requests
4. REPLACE deleted activities with user-preferred alternatives
5. ENSURE no forbidden activities remain

EXAMPLES:
- If user says "remove museums" → DELETE all museum visits
- If user says "no early morning" → DELETE activities before 9 AM
- If user says "more food experiences" → ADD restaurant/cooking activities

CRITICAL: If user asks to remove something, it MUST be completely gone from the final itinerary.

Return ONLY this JSON structure:
{
  "itinerary": [
    {
      "day": number,
      "title": string,
      "activities": [
        {
          "time": string,
          "name": string,
          "details": string,
          "duration": string
        }
      ]
    }
  ]
}`;

  try {
    const response = await makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.7, 6000); // Increased token limit to handle larger itinerary responses

    console.log('Optimize itinerary AI response:', response); // Debug log
    console.log('Response length:', response?.length || 0, 'characters');
    
    // Use safe JSON parsing to handle malformed responses
    const jsonResponse = safeParseJson(response);
    
    if (jsonResponse.itinerary && Array.isArray(jsonResponse.itinerary)) {
      const optimizedPlan = jsonResponse.itinerary;
      
      // Validation: Check if changes were actually made
      const originalActivityCount = plan.reduce((total, day) => total + day.activities.length, 0);
      const optimizedActivityCount = optimizedPlan.reduce((total: number, day: any) => total + day.activities.length, 0);
      
      console.log('Original activities:', originalActivityCount, 'Optimized activities:', optimizedActivityCount);
      console.log('User feedback was:', feedback);
      
      // Log activity names for comparison
      const originalActivities = plan.flatMap(day => day.activities.map(act => act.name));
      const optimizedActivities = optimizedPlan.flatMap((day: any) => day.activities.map((act: any) => act.name));
      
      console.log('Original activity names:', originalActivities);
      console.log('Optimized activity names:', optimizedActivities);
      
      return optimizedPlan;
    } else {
      console.error('Invalid itinerary format in response:', jsonResponse);
      return plan;
    }
  } catch (error) {
    console.error('Failed to optimize itinerary:', error);
    console.error('Error details:', error);
    
    // If it's a JSON parsing error, log the raw response for debugging
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('JSON parsing failed. This might be due to:');
      console.error('1. Incomplete response from OpenAI API');
      console.error('2. Response contains unescaped characters');
      console.error('3. Response was truncated due to token limits');
      console.error('Consider increasing max_tokens or simplifying the request');
    }
    
    return plan; // Return original plan if optimization fails
  }
};

export const chatWithAssistant = async (message: string, history: { role: string; content: string }[]) => {
  const systemPrompt = `You are a professional AI travel assistant.

Your responses MUST be:
- Clear, readable, structured
- Broken into short paragraphs
- Use bullet points when helpful
- Use **bold** for subheadings like: **Where to Stay**, **Things to Do**, **Best Time**, **Costs**
- Never send JSON, never use code blocks
- Never send extremely long essays
- Maintain a friendly, expert travel tone
- Always focus on giving practical, real travel advice`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // Last 10 messages for context
    { role: 'user', content: message }
  ];

  try {
    const response = await makeOpenAIRequest(messages, 0.7, 500);
    return response;
  } catch (error) {
    console.error('Failed to chat with assistant:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

export const chatWithAssistantLC = async (messages: { role: string; content: string }[]) => {
	try {
		const model = new ChatOpenAI({
			modelName: 'gpt-4o',
			temperature: 0.7,
			apiKey: import.meta.env.VITE_OPENAI_API_KEY,
		});

		const formattedMessages = messages.map((m) => ({
			role: m.role,
			content: m.content,
		}));

		const response = await model.invoke(formattedMessages as any);

		return (response as any)?.content || "I'm sorry, I couldn't generate a reply.";
	} catch (error) {
		console.error('Chat error:', error);
		return "I'm having trouble connecting right now. Please try again later.";
	}
};

export const getLocalInsights = async (destination: string) => {
  const systemPrompt = `You are a local travel expert. Provide a concise paragraph about the destination covering culture, weather, safety, and basic travel tips.`;

  const userPrompt = `Provide local insights for ${destination} including culture, weather patterns, safety considerations, and essential travel tips.`;

  try {
    const response = await makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.7, 400);

    return response;
  } catch (error) {
    console.error('Failed to get local insights:', error);
    return `${destination} is a wonderful destination with rich culture and history. The weather varies by season, so it's best to check current conditions before traveling. As with any destination, stay aware of your surroundings and follow local guidelines for a safe and enjoyable trip.`;
  }
};
