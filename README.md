# Weekly Content Planner — Backend

This is the "thinking part" behind your Lovable app. It receives your 5 form
answers and uses the free Groq AI to generate a 7-day content plan.

## Files in this project
- `server.js` — the actual backend code
- `package.json` — list of small libraries the code needs
- `.env.example` — example of the secret key file (copy to `.env` for local testing)
- `.gitignore` — tells GitHub to never upload your real secret key

## How to put this online (step by step)

1. **Create a GitHub repository** (if you haven't already) and upload these
   files to it. Do NOT upload a real `.env` file — only `.env.example`.
2. **Go to render.com** → New → Web Service → connect your GitHub repo.
3. When Render asks for settings, use:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. In Render's **Environment** tab, add one variable:
   - Key: `GROQ_API_KEY`
   - Value: (paste your real Groq key here)
5. Click **Deploy**. Render will give you a live address, something like:
   `https://content-planner-backend.onrender.com`
6. Test it's alive by visiting that address in your browser — you should see
   "Weekly Content Planner backend is running."

## The one endpoint your Lovable app will call

**POST** `https://your-backend-address.onrender.com/generate-plan`

Send this JSON body:
```json
{
  "businessName": "Joe's Coffee",
  "businessType": "Cafe",
  "targetAudience": "Young professionals",
  "contentGoal": "Engagement",
  "toneOfVoice": "Friendly"
}
```

You'll get back:
```json
{
  "days": [
    { "day": "Monday", "theme": "...", "caption": "..." },
    ...
  ]
}
```
