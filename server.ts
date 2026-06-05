import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup failure if key is missing
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key in Settings > Secrets to enable AI recommendations.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Check configuration status endpoint
app.get("/api/config/status", (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API Recommendation agent powered by Gemini 3.5 Flash
app.post("/api/recommendation", async (req, res) => {
  try {
    const { type, occupancyRate, complaintsCount, budget, focus, extraContext } = req.body;
    
    const client = getGenAI();
    const recommendationTypeLabel = type === "renovation" ? "Renovation & Room Upgrade" : "Marketing & Student/Worker Attraction";
    
    const prompt = `
      You are an expert Property Consultant and Marketing Strategist specializing in Indonesian room rentals (Kost / Indekost) and budget micro-apartments.
      
      We need your professional analysis and recommendations for our room rental property "MudaKost".
      Here is the current operational data of the property:
      - Recommendation Type requested: ${recommendationTypeLabel}
      - Current Occupancy Rate: ${occupancyRate}%
      - Number of pending maintenance complaints: ${complaintsCount}
      - Target budget limit: ${budget || "Not specified"}
      - Primary focus area: ${focus || "General optimization"}
      - Specific notes/context from owner: "${extraContext || "None specified."}"
      
      Please provide a highly actionable, structured, and realistic recommendation report in perfect Markdown format.
      Your report must include:
      1. **Property Health Analysis**: Brief, professional summary of where MudaKost stands with ${occupancyRate}% occupancy and ${complaintsCount} complaints.
      2. **Top Actionable Priorities** (High, Medium, Low impact) styled in a clear markdown comparison or table layout matching the specified budget.
      3. **Strategic Initiatives**: Specific improvements or innovative modern ideas (e.g., adding study corners, smart lighting, instagrammable communal spots, student packages, online listings, social media Reels strategy) matching student/young-professional preferences.
      4. **Estimated Cost-Benefit Analysis**: Simple breakdown of costs and expected rental returns or tenant retention value.
      5. **Roadmap Timeline**: A step-by-step guideline over a span of 30 days to implement the recommendations.

      Keep the tone highly professional, encouraging, practical, and clear. Do not refer to database tables or coding variables.
    `;
    
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    res.json({ recommendation: response.text || "No response text received from the AI model." });
  } catch (error: any) {
    console.error("Gemini API server-side generation exception:", error);
    res.status(500).json({ error: error.message || "Failed to process recommendations via Gemini model." });
  }
});

// Mount Vite middleware for development or serve builds in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MudaKost Applet Server running at http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize server with Vite middleware:", err);
});
