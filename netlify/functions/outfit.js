// netlify/functions/outfit.js
import OpenAI from "openai";

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
  const unit = payload.unit || "metric";
  const style = payload.style || "Stylish";
  const gender = payload.gender || "female";

  // Validate required weather data
  if (!weather?.main?.temp || !weather.weather?.[0]?.description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or malformed weather data" }),
    };
  }

  // Prepare prompt components
  const temp = Math.round(weather.main.temp);
  const desc = weather.weather[0].description;
  const tUnit = unit === "metric" ? "C" : "F";
  const styleLower = style.toLowerCase();
  const genderLabel = gender.toLowerCase() === "male" ? "men's" : "women's";

  const promptText = `Weather: ${temp}°${tUnit}, ${desc}. Recommend a ${styleLower} ${genderLabel} outfit.`;
  const promptImage = `A ${styleLower} ${genderLabel} outfit for ${desc}, ${temp}°${tUnit}.`;

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

  try {
    // Fire both text and image requests in parallel
    const [chatRes, imgRes] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptText }],
        max_tokens: 60,
        temperature: 0.8,
      }),
      openai.images.generate({
        prompt: promptImage,
        n: 1,
        size: "512x512",
      }),
    ]);

    const text = chatRes.choices?.[0]?.message?.content?.trim() ?? "";
    const imageUrl = imgRes.data?.[0]?.url ?? null;

    return {
      statusCode: 200,
      body: JSON.stringify({ text, imageUrl }),
    };

  } catch (err) {
    console.error("Outfit function error:", err);
    const message = err?.message || "Unknown error";
    // Surface 429 separately
    const status = err?.code === "image_generation_user_error" ? 429 : 500;
    return {
      statusCode: status,
      body: JSON.stringify({ error: message }),
    };
  }
}
