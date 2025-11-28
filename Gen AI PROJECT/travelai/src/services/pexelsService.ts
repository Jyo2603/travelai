export async function fetchDestinationImage(query: string) {
  console.log("🔍 Fetching image for:", query);

  try {
    const response = await fetch(
      `http://localhost:5000/api/pexels?query=${encodeURIComponent(query)}`
    );

    console.log("🌐 Proxy Status:", response.status);

    const data = await response.json();
    console.log("🖼️ Proxy Response:", data);

    const imageUrl = data?.photos?.[0]?.src?.landscape;

    console.log("✅ Final Image URL:", imageUrl);

    return imageUrl || null;
  } catch (error) {
    console.error("❌ [PEXELS PROXY ERROR]:", error);
    return null;
  }
}
