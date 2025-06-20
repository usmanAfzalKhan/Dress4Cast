// netlify/functions/outfit.js
import OpenAI from "openai";

export async function handler(event, context) {
  // 1) Parse payload
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const weather = payload.weather;
  const unit    = payload.unit   || "metric";
  const style   = payload.style  || "Stylish";
  const gender  = payload.gender || "female";

  // 2) Validate
  if (!weather?.main?.temp || !weather.weather?.[0]?.description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing weather data" }),
    };
  }

  // 3) Build prompts
  const temp        = Math.round(weather.main.temp);
  const desc        = weather.weather[0].description;
  const tUnit       = unit === "metric" ? "C" : "F";
  const styleLower  = style.toLowerCase();
  const genderLabel = gender === "male" ? "men's" : "women's";

  const promptText  = `Weather: ${temp}°${tUnit}, ${desc}. Recommend a ${styleLower} ${genderLabel} outfit.`;
  const promptImage = `A ${styleLower} ${genderLabel} outfit for ${desc}, ${temp}°${tUnit}.`;

  // 4) Initialize OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

  // 5) Kick off the long‐running job in the background
  context.waitUntil((async () => {
    try {
      const chatRes = await openai.chat.completions.create({
        model:       "gpt-3.5-turbo",
        messages:    [{ role: "user", content: promptText }],
        max_tokens:  60,
        temperature: 0.8,
      });

      const imgRes = await openai.images.generate({
        prompt: promptImage,
        n:      1,
        size:   "512x512",
      });

      // When done, stash the result in Netlify’s built-in KV under this jobId:
      const result = {
        text:     chatRes.choices[0].message.content.trim(),
        imageUrl: imgRes.data[0].url,
      };
      await context.storage.put(`outfit-${context.jobId}`, JSON.stringify(result));
    } catch (e) {
      console.error("Background job failed:", e);
      await context.storage.put(
        `outfit-${context.jobId}-error`,
        JSON.stringify({ error: e.message || "Unknown" })
      );
    }
  })());

  // 6) Immediately return 202 + Location header so client can poll
  return {
    statusCode: 202,
    headers: {
      "Content-Type": "application/json",
      "Location": `/.netlify/functions/outfit/jobs/${context.jobId}`
    },
    body: JSON.stringify({ jobId: context.jobId }),
  };
}
