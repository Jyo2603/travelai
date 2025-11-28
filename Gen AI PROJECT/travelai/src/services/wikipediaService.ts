interface WikipediaData {
  intro: string;
}

const cleanHtmlText = (text: string): string => {
  if (!text) return '';
  
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

export const getCityIntro = async (cityName: string): Promise<string> => {
  try {
    const encodedCity = encodeURIComponent(cityName);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=${encodedCity}&format=json&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) {
      return `${cityName} is a fascinating destination with rich history and culture.`;
    }
    
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract || '';
    
    if (!extract) {
      return `${cityName} is a fascinating destination with rich history and culture.`;
    }
    
    const cleanedIntro = cleanHtmlText(extract);
    
    // Limit to reasonable length for intro
    if (cleanedIntro.length > 400) {
      const sentences = cleanedIntro.split('. ');
      let result = '';
      for (const sentence of sentences) {
        if ((result + sentence).length > 400) break;
        result += sentence + '. ';
      }
      return result.trim();
    }
    
    return cleanedIntro;
  } catch (error) {
    console.error(`Error fetching Wikipedia intro for ${cityName}:`, error);
    return `${cityName} is a fascinating destination with rich history and culture.`;
  }
};

export const getWikipediaData = async (cityName: string): Promise<WikipediaData> => {
  try {
    const intro = await getCityIntro(cityName);
    
    return {
      intro: intro || `${cityName} is a fascinating destination with rich history and culture.`
    };
  } catch (error) {
    console.error(`Error getting Wikipedia data for ${cityName}:`, error);
    return {
      intro: `${cityName} is a fascinating destination with rich history and culture.`
    };
  }
};
