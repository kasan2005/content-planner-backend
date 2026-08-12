// server.js
// This is your backend. It does 3 things:
// 1. Waits for your Lovable app to send it the 5 form answers
// 2. Asks a free AI model on OpenRouter to write a 7-day content plan
// 3. Sends that plan back to your Lovable app

const express = require("express");
const cors = require("cors");

const app = express();

// Lets your Lovable app (running on a different website address) talk to this backend
app.use(cors());
// Lets this backend understand JSON data sent from your form
app.use(express.json());

// A simple "is it alive?" check. Visiting your backend URL in a browser will show this.
app.get("/", (req, res) => {
  res.send("Weekly Content Planner backend is running.");
});

// This is the main endpoint your "Generate my week" button will call
app.post("/generate-plan", async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      targetAudience,
      contentGoal,
      toneOfVoice,
    } = req.body;

    // Basic check: make sure nothing important is missing
    if (!businessName || !businessType || !targetAudience || !contentGoal || !toneOfVoice) {
      return res.status(400).json({
        error: "Missing one of: businessName, businessType, targetAudience, contentGoal, toneOfVoice",
      });
    }

    // This is the instruction we send to the AI.
    // We ask it to reply ONLY in JSON so our app can display it neatly.
    const prompt = `You are a social media strategist. Create a 7-day social media content plan for this business:

Business name: ${businessName}
Business type / industry: ${businessType}
Target audience: ${targetAudience}
Content goal: ${contentGoal}
Tone of voice: ${toneOfVoice}

Reply with ONLY valid JSON, no extra text, no markdown code fences, in exactly this shape:

{
  "days": [
    { "day": "Monday", "theme": "short theme name", "caption": "a ready-to-post caption, 2-3 sentences, matching the tone of voice" },
    { "day": "Tuesday", "theme": "...", "caption": "..." },
    { "day": "Wednesday", "theme": "...", "caption": "..." },
    { "day": "Thursday", "theme": "...", "caption": "..." },
    { "day": "Friday", "theme": "...", "caption": "..." },
    { "day": "Saturday", "theme": "...", "caption": "..." },
    { "day": "Sunday", "theme": "...", "caption": "..." }
  ]
}`;

    // Call the OpenRouter AI (this uses the free API key stored safely on Render)
    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // These two headers are required by OpenRouter's free tier. The value
        // doesn't need to be a real working site, just a text identifier.
        "HTTP-Referer": "https://weeklycontentplanner.lovable.app",
        "X-Title": "Weekly Content Planner",
      },
      body: JSON.stringify({
        // A free model on OpenRouter. See openrouter.ai/models?max_price=0 for others.
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      console.error("OpenRouter API error:", errText);
      return res.status(502).json({ error: "The AI service failed to respond. Try again." });
    }

    const orData = await orResponse.json();
    let aiText = orData.choices[0].message.content;

    // Some free models wrap JSON in ```json code fences — strip those if present
    aiText = aiText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

    // The AI replies as a JSON string, so we turn it into a real object
    const plan = JSON.parse(aiText);

    // Send the finished 7-day plan back to your Lovable app
    res.json(plan);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong generating your plan." });
  }
});

// Render tells us which "port" (address slot) to run on. Locally we use 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
