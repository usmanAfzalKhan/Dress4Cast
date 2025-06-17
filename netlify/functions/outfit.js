// netlify/functions/outfit.js
import OpenAI from "openai";

export const handler = async (event) => {
  try {
    // Parse weather data sent from the client
    const { weather, unit } = JSON.parse(event.body);
    if (!weather || !unit) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing weather or unit" }),
      };
    }

    // Initialize OpenAI with your secret key (stored in Netlify env)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

    // Prepare prompt
    const temp = Math.round(weather.main.temp);
    const desc = weather.weather[0].description;
    const unitLabel = unit === "metric" ? "C" : "F";

    // 1) Get the text suggestion
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `The weather is ${temp}°${unitLabel} and ${desc}. Recommend one stylish outfit in plain language.`
      }],
      max_tokens: 60,
      temperature: 0.8,
    });
    const text = chat.choices?.[0]?.message?.content?.trim() || "";

    // 2) Get an image suggestion via DALL·E
    const imgResp = await openai.images.generate({
      prompt: `A stylish outfit for ${desc} weather at ${temp}°${unitLabel}, photorealistic fashion display.`,
      n: 1,
      size: "512x512",
    });
    const imageUrl = imgResp.data?.[0]?.url || "";

    // Return both text and image URL
    return {
      statusCode: 200,
      body: JSON.stringify({ text, imageUrl }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
