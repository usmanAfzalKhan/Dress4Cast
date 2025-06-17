// .netlify/functions/outfit.js
import OpenAI from "openai";

export async function handler(event, context) {
  try {
    // 1) Pull in the raw request body
    let payload;
    if (typeof event.body === "string") {
      payload = JSON.parse(event.body);
    } else {
      // event.body is a ReadableStream in Netlify Dev
      const raw = await new Response(event.body).text();
      payload = raw ? JSON.parse(raw) : {};
    }

    const { weather, unit, style } = payload;

    if (!weather || !unit || !style) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing weather, unit, or style" }),
      };
    }

    // 2) Initialize OpenAI with your server‐side key
    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
    
    // Build your prompts however you like…
    const temp = Math.round(weather.main.temp);
    const desc = weather.weather[0].description;
    const styleLower = style.toLowerCase();

    // 3) Ask for a text suggestion
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Suggest a ${styleLower} outfit for ${temp}°${unit === "metric" ? "C" : "F"} and ${desc}.`
        }
      ],
    });
    const text = chat.choices[0].message.content;

    // 4) Ask for an image URL
    const img = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A ${styleLower} outfit for someone facing ${temp}°${unit === "metric" ? "C" : "F"} and ${desc}.`,
      size: "1024x1024",
    });
    const imageUrl = img.data[0].url;

    // 5) Return it all
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
