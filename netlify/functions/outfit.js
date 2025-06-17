// netlify/functions/outfit.js
import OpenAI from "openai";

export default async function handler(event, context) {
  try {
    // 1) Parse the incoming body
    const { weather, unit, style } = JSON.parse(event.body || "{}");
    if (!weather || !unit || !style) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing weather, unit, or style" }),
      };
    }

    // 2) Pull your secret key from env
    const apiKey = process.env.OPENAI_KEY;
    if (!apiKey) {
      console.error("⚠️  Missing OPENAI_KEY in env!");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Server misconfiguration: missing OPENAI_KEY",
        }),
      };
    }

    // 3) Initialize the SDK
    const openai = new OpenAI({ apiKey });

    // 4) Build prompts
    const temp        = Math.round(weather.main.temp);
    const weatherDesc = weather.weather[0].description;
    const tempUnit    = unit === "metric" ? "C" : "F";
    const styleLower  = style.toLowerCase();

    // 5) Chat completion
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Recommend a *${styleLower}* outfit for ${temp}°${tempUnit} and ${weatherDesc}. Describe what to wear in plain language.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });
    const text = chat.choices?.[0]?.message?.content?.trim() ?? "";

    // 6) Image generation
    const imgResp = await openai.images.generate({
      prompt: `A ${styleLower} outfit for ${weatherDesc} at ${temp}°${tempUnit}, photorealistic, clothing items only.`,
      n: 1,
      size: "512x512",
    });
    const imageUrl = imgResp.data?.[0]?.url ?? "";

    // 7) Return both
    return {
      statusCode: 200,
      body: JSON.stringify({ text, imageUrl }),
    };
  } catch (err) {
    console.error("🔥 Outfit function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
