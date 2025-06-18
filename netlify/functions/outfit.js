// netlify/functions/outfit.js
import OpenAI from "openai";

export async function handler(event, context) {
  const { weather, unit, style, gender } = JSON.parse(event.body || "{}");
  if (!weather || !unit || !style || !gender) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing parameters" }) };
  }

  const temp = Math.round(weather.main.temp);
  const desc = weather.weather[0].description;
  const tempUnit = unit === "metric" ? "C" : "F";
  const styleLower = style.toLowerCase();
  const genderLabel = gender === "male" ? "men's" : "women's";

  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

  // 1) Text
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "user",
      content: `The weather is ${temp}°${tempUnit} with ${desc}. Recommend one ${styleLower} ${genderLabel} outfit in plain language.`
    }],
    max_tokens: 80,
    temperature: 0.8,
  });
  const text = chat.choices[0].message.content.trim();

  // 2) Image
  const imgResp = await openai.images.generate({
    prompt: `A photorealistic display of a ${styleLower} ${genderLabel} outfit for ${desc} weather at ${temp}°${tempUnit}.`,
    n: 1,
    size: "512x512",
  });
  const imageUrl = imgResp.data[0].url;

  return { statusCode: 200, body: JSON.stringify({ text, imageUrl }) };
}
