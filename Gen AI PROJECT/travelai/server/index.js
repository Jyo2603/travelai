import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.get("/api/pexels", async (req, res) => {
  const query = req.query.query;
  console.log("📸 Incoming Pexels Request:", query);

  // Check if Pexels API key is available
  if (!process.env.VITE_PEXELS_API_KEY) {
    console.log("⚠️ Pexels API key not found, returning placeholder image");
    const placeholderData = {
      photos: [
        {
          id: 1,
          src: {
            medium: `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(query || 'Travel')}`
          },
          alt: `Placeholder image for ${query}`
        }
      ]
    };
    return res.json(placeholderData);
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1`;

    console.log("🔗 Fetching from Pexels:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: process.env.VITE_PEXELS_API_KEY,
      },
    });

    console.log("📥 Response Status:", response.status);

    const data = await response.json();
    console.log("📸 Pexels Response:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error("❌ PEXELS SERVER ERROR:", error);
    // Return placeholder image on error
    const placeholderData = {
      photos: [
        {
          id: 1,
          src: {
            medium: `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(query || 'Travel')}`
          },
          alt: `Placeholder image for ${query}`
        }
      ]
    };
    res.json(placeholderData);
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
