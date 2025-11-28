interface WikivoyageData {
  summary: string;
  whatToSee: string;
  whatToDo: string;
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

const fetchWikivoyageContent = async (cityName: string): Promise<string> => {
  try {
    const encodedCity = encodeURIComponent(cityName);
    const url = `https://en.wikivoyage.org/w/api.php?action=query&prop=extracts&titles=${encodedCity}&format=json&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) return '';
    
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract || '';
    
    return cleanHtmlText(extract);
  } catch (error) {
    console.error(`Error fetching Wikivoyage content for ${cityName}:`, error);
    return '';
  }
};

export const getCitySummary = async (cityName: string): Promise<string> => {
  const content = await fetchWikivoyageContent(cityName);
  
  if (!content) return '';
  
  // Extract first paragraph as summary
  const paragraphs = content.split('\n').filter(p => p.trim().length > 50);
  return paragraphs[0] || content.substring(0, 300) + '...';
};

export const getWhatToSee = async (cityName: string): Promise<string> => {
  const content = await fetchWikivoyageContent(cityName);
  
  if (!content) return '';
  
  // Look for "See" section or extract attractions
  const seeMatch = content.match(/See\s*\n(.*?)(?=\n[A-Z]|\n\n|$)/s);
  if (seeMatch) {
    return cleanHtmlText(seeMatch[1]).substring(0, 500);
  }
  
  // Fallback: extract middle portion that might contain attractions
  const sentences = content.split('.').filter(s => s.trim().length > 30);
  const middleStart = Math.floor(sentences.length * 0.3);
  const middleEnd = Math.floor(sentences.length * 0.7);
  
  return sentences.slice(middleStart, middleEnd).join('. ').substring(0, 500);
};

export const getWhatToDo = async (cityName: string): Promise<string> => {
  const content = await fetchWikivoyageContent(cityName);
  
  if (!content) return '';
  
  // Look for "Do" section or extract activities
  const doMatch = content.match(/Do\s*\n(.*?)(?=\n[A-Z]|\n\n|$)/s);
  if (doMatch) {
    return cleanHtmlText(doMatch[1]).substring(0, 500);
  }
  
  // Fallback: extract later portion that might contain activities
  const sentences = content.split('.').filter(s => s.trim().length > 30);
  const laterStart = Math.floor(sentences.length * 0.6);
  
  return sentences.slice(laterStart).join('. ').substring(0, 500);
};

export const getWikivoyageData = async (cityName: string): Promise<WikivoyageData> => {
  try {
    const [summary, whatToSee, whatToDo] = await Promise.all([
      getCitySummary(cityName),
      getWhatToSee(cityName),
      getWhatToDo(cityName)
    ]);
    
    return {
      summary: summary || `Discover the beauty and culture of ${cityName}.`,
      whatToSee: whatToSee || `Explore the main attractions and landmarks in ${cityName}.`,
      whatToDo: whatToDo || `Experience local activities and adventures in ${cityName}.`
    };
  } catch (error) {
    console.error(`Error getting Wikivoyage data for ${cityName}:`, error);
    return {
      summary: `Discover the beauty and culture of ${cityName}.`,
      whatToSee: `Explore the main attractions and landmarks in ${cityName}.`,
      whatToDo: `Experience local activities and adventures in ${cityName}.`
    };
  }
};
