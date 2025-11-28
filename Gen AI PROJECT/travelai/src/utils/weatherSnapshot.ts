export function getWeatherSnapshot(destinationName: string) {
  const name = destinationName.toLowerCase();
  
  // Create a simple hash from destination name for consistent results
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
  }
  
  // Destination-specific weather patterns
  if (name.includes('switzerland') || name.includes('zermatt') || name.includes('alps')) {
    return { temp: "5–12°C", weather: "Snowy", humidity: "65%", rainfall: "Medium" };
  }
  
  if (name.includes('finland') || name.includes('lapland') || name.includes('arctic')) {
    return { temp: "-5–3°C", weather: "Snowy", humidity: "80%", rainfall: "Low" };
  }
  
  if (name.includes('thailand') || name.includes('bangkok') || name.includes('phuket')) {
    return { temp: "28–35°C", weather: "Tropical", humidity: "75%", rainfall: "High" };
  }
  
  if (name.includes('japan') || name.includes('tokyo') || name.includes('kyoto')) {
    return { temp: "15–22°C", weather: "Pleasant", humidity: "60%", rainfall: "Medium" };
  }
  
  if (name.includes('india') || name.includes('goa') || name.includes('kerala')) {
    return { temp: "25–32°C", weather: "Humid", humidity: "70%", rainfall: "High" };
  }
  
  if (name.includes('maldives') || name.includes('seychelles') || name.includes('mauritius')) {
    return { temp: "26–30°C", weather: "Sunny", humidity: "75%", rainfall: "Low" };
  }
  
  if (name.includes('iceland') || name.includes('norway') || name.includes('greenland')) {
    return { temp: "2–8°C", weather: "Cool", humidity: "70%", rainfall: "Medium" };
  }
  
  if (name.includes('dubai') || name.includes('egypt') || name.includes('morocco')) {
    return { temp: "30–40°C", weather: "Hot", humidity: "40%", rainfall: "Very Low" };
  }
  
  // Default based on hash for consistency
  const samples = [
    { temp: "12–18°C", weather: "Sunny", humidity: "45%", rainfall: "Low" },
    { temp: "25–30°C", weather: "Humid", humidity: "70%", rainfall: "Medium" },
    { temp: "18–24°C", weather: "Pleasant", humidity: "55%", rainfall: "Low" },
    { temp: "20–26°C", weather: "Mild", humidity: "50%", rainfall: "Low" },
  ];
  
  return samples[Math.abs(hash) % samples.length];
}
