// netlify/functions/outfit.js
import OpenAI from "openai";

export async function handler(event, context) {
  const { weather, unit, style, gender } = JSON.parse(event.body || "{}");
  if (!weather || !unit || !style || !gender) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing parameters" }) };
  }

  const temp = Math.round(weather.main.temp);
  const desc = weather.weather[0].description;
  const tUnit = unit === "metric" ? "C" : "F";
  const styleLower = style.toLowerCase();
  const genderLabel = gender === "male" ? "men's" : "women's";
  const prompt = `Weather: ${temp}°${tUnit}, ${desc}. Recommend a ${styleLower} ${genderLabel} outfit.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

  // Parallelize text and image requests for faster response
  const [chat, imgResp] = await Promise.all([
    openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
      temperature: 0.8,
    }),
    openai.images.generate({
      prompt: `A ${styleLower} ${genderLabel} outfit for ${desc}, ${temp}°${tUnit}.`,
      n: 1,
      size: "512x512",
    }),
  ]);

  const text = chat.choices[0].message.content.trim();
  const imageUrl = imgResp.data[0].url;

  return {
    statusCode: 200,
    body: JSON.stringify({ text, imageUrl }),
  };
}
