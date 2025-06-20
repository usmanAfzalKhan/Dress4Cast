// netlify/functions/outfit.js
import OpenAI from "openai";

// Log the key to verify it's loaded (remove this in production)
console.log("➡️ OPENAI_KEY =", process.env.OPENAI_KEY);

export async function handler(event, context) {
  // Parse request body
  let payload;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload" }),
    };
  }

  // Extract parameters with sensible defaults
  const weather = payload.weather;
  const unit    = payload.unit   || "metric";
  const style   = payload.style  || "Stylish";
  const gender  = payload.gender || "female";

  // Validate required weather data
  if (!weather?.main?.temp || !weather.weather?.[0]?.description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or malformed weather data" }),
    };
  }

  // Prepare prompt
  const temp        = Math.round(weather.main.temp);
  const desc        = weather.weather[0].description;
  const tUnit       = unit === "metric" ? "C" : "F";
  const styleLower  = style.toLowerCase();
  const genderLabel = gender.toLowerCase() === "male" ? "men's" : "women's";
  const promptText  = `Weather: ${temp}°${tUnit}, ${desc}. Recommend a ${styleLower} ${genderLabel} outfit.`;

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

  try {
    // Only generate chat response (no image) to avoid timeout
    const chatRes = await openai.chat.completions.create({
      model:       "gpt-3.5-turbo",
      messages:    [{ role: "user", content: promptText }],
      max_tokens:  60,
      temperature: 0.8,
    });

    const text     = chatRes.choices?.[0]?.message?.content?.trim() ?? "";
    const imageUrl = null;

    return {
      statusCode: 200,
      body: JSON.stringify({ text, imageUrl }),
    };
  } catch (err) {
    console.error("Outfit function error:", err);
    const message = err?.message || "Unknown error";
    const status  = err?.code === "image_generation_user_error" ? 429 : 500;
    return {
      statusCode: status,
      body: JSON.stringify({ error: message }),
    };
  }
}
