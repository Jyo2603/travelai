interface DestinationImage {
  url: string;
  alt: string;
}

export const getDestinationImages = async (cityName: string): Promise<DestinationImage[]> => {
  try {
    const encodedCity = encodeURIComponent(cityName);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=${encodedCity}&gimlimit=10&prop=imageinfo&iiprop=url&format=json&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) {
      return getDefaultImages(cityName);
    }
    
    const images: DestinationImage[] = [];
    
    Object.values(pages).forEach((page: any) => {
      if (page.imageinfo && page.imageinfo[0]?.url) {
        const url = page.imageinfo[0].url;
        
        // Filter for actual images (not icons, logos, etc.)
        if (url.match(/\.(jpg|jpeg|png|webp)$/i) && 
            !url.includes('Commons-logo') && 
            !url.includes('Wikimedia') &&
            !url.includes('icon')) {
          
          images.push({
            url: url,
            alt: `Beautiful view of ${cityName}`
          });
        }
      }
    });
    
    // Return up to 5 images
    return images.slice(0, 5).length > 0 ? images.slice(0, 5) : getDefaultImages(cityName);
    
  } catch (error) {
    console.error(`Error fetching images for ${cityName}:`, error);
    return getDefaultImages(cityName);
  }
};

const getDefaultImages = (cityName: string): DestinationImage[] => {
  // Fallback to placeholder images with proper alt text
  return [
    {
      url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
      alt: `Scenic view of ${cityName}`
    },
    {
      url: `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
      alt: `Landscape of ${cityName}`
    },
    {
      url: `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
      alt: `Architecture in ${cityName}`
    }
  ];
};

// Alternative method using search if direct images don't work
export const searchDestinationImages = async (cityName: string): Promise<DestinationImage[]> => {
  try {
    const searchTerm = `${cityName} tourism landmark`;
    const encodedSearch = encodeURIComponent(searchTerm);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodedSearch}&srnamespace=6&srlimit=10&format=json&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const searchResults = data.query?.search;
    
    if (!searchResults || searchResults.length === 0) {
      return getDefaultImages(cityName);
    }
    
    const images: DestinationImage[] = [];
    
    for (const result of searchResults.slice(0, 5)) {
      try {
        const fileTitle = result.title;
        const fileUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
        
        const fileResponse = await fetch(fileUrl);
        const fileData = await fileResponse.json();
        const pages = fileData.query?.pages;
        
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const imageUrl = pages[pageId]?.imageinfo?.[0]?.url;
          
          if (imageUrl && imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
            images.push({
              url: imageUrl,
              alt: `${cityName} - ${result.title.replace('File:', '').replace(/\.[^/.]+$/, '')}`
            });
          }
        }
      } catch (err) {
        console.error('Error processing image result:', err);
      }
    }
    
    return images.length > 0 ? images : getDefaultImages(cityName);
    
  } catch (error) {
    console.error(`Error searching images for ${cityName}:`, error);
    return getDefaultImages(cityName);
  }
};
