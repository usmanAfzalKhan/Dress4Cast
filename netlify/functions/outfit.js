// netlify/functions/outfit.js
import OpenAI from "openai";

// (Optional) remove this after you verify your key is coming through:
console.log("➡️ OPENAI_KEY =", process.env.OPENAI_KEY);

export async function handler(event) {
  // 1) Parse the incoming payload
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload" }),
    };
  }

  const weather = payload.weather;
  const unit    = payload.unit   || "metric";
  const style   = payload.style  || "Stylish";
  const gender  = payload.gender || "female";

  // 2) Validate
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

  // 4) Init OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

  try {
    // 5) First get the text response
    const chatRes = await openai.chat.completions.create({
      model:       "gpt-3.5-turbo",
      messages:    [{ role: "user", content: promptText }],
      max_tokens:  60,
      temperature: 0.8,
    });
    const text = chatRes.choices?.[0]?.message?.content?.trim() || "";

    // 6) Then generate a smaller image
    let imageUrl = null;
    try {
      const imgRes = await openai.images.generate({
        prompt: promptImage,
        n:      1,
        size:   "256x256",
      });
      imageUrl = imgRes.data?.[0]?.url || null;
    } catch (imgErr) {
      console.warn("Image generation failed, sending text only:", imgErr);
      imageUrl = null;
    }

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
