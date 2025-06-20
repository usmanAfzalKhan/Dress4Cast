// netlify/functions/outfit.js
import OpenAI from "openai";

export async function handler(event, context) {
  // 1) Parse request body
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload" }),
    };
  }

  // 2) Extract & validate inputs
  const weather = payload.weather;
  const unit    = payload.unit   || "metric";
  const style   = payload.style  || "Stylish";
  const gender  = payload.gender || "female";

  if (!weather?.main?.temp || !weather.weather?.[0]?.description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or malformed weather data" }),
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
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  try {
    // 5) Generate text suggestion
    const chatRes = await openai.chat.completions.create({
      model:       "gpt-3.5-turbo",
      messages:    [{ role: "user", content: promptText }],
      max_tokens:  60,
      temperature: 0.8,
    });
    const text = chatRes.choices[0].message.content.trim();

    // 6) Generate image (smaller size to finish under 15 min background timeout)
    const imgRes = await openai.images.generate({
      prompt: promptImage,
      n:      1,
      size:   "512x512",
    });
    const imageUrl = imgRes.data[0].url;

    // 7) Return both
    return {
      statusCode: 200,
      body: JSON.stringify({ text, imageUrl }),
    };
  } catch (err) {
    console.error("Outfit function error:", err);
    const message = err.message || "Unknown error";
    const status  = err.code === "image_generation_user_error" ? 429 : 500;
    return {
      statusCode: status,
      body: JSON.stringify({ error: message }),
    };
  }
}
