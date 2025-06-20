// netlify/functions/outfit.js
import OpenAI from "openai";

export async function handler(event) {
  // parse the payload
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const weather = payload.weather;
  const unit    = payload.unit || "metric";

  // validate
  if (!weather?.main?.temp || !weather.weather?.[0]?.description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing weather data" }),
    };
  }

  // build prompt
  const temp   = Math.round(weather.main.temp);
  const desc   = weather.weather[0].description;
  const tUnit  = unit === "metric" ? "C" : "F";
  const prompt = `Weather is ${temp}°${tUnit} and ${desc}. 
Respond with EXACT JSON: {"gender":"male"|"female","modesty":"modest"|"regular"}.`;

  // call OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
    });
    // parse the AI’s JSON
    const aiJson = JSON.parse(chat.choices[0].message.content);
    const { gender, modesty } = aiJson;

    return {
      statusCode: 200,
      body: JSON.stringify({ gender, modesty }),
    };
  } catch (err) {
    console.error("AI error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI failed" }),
    };
  }
}
