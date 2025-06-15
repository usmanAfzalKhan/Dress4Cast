// src/utils/getOutfit.js

// Vite serves `public/` at the app root
const BASE = import.meta.env.BASE_URL || '/';

export default function getOutfit(gender, modesty, tempCelsius, condition) {
  // 1) Temperature bucket
  let tempCat;
  if      (tempCelsius <= 10) tempCat = 'cold';
  else if (tempCelsius <= 20) tempCat = 'mild';
  else if (tempCelsius <= 30) tempCat = 'warm';
  else                         tempCat = 'hot';

  // 2) Condition bucket — must match your filenames exactly
  const c = condition.toLowerCase();
  let condCat = 'overcast'; // use 'overcast' for clear/cloudy
  if      (c.includes('rain'))   condCat = 'rainy';
  else if (c.includes('snow'))   condCat = 'snowy';
  else if (['haze','mist','fog'].some(k=>c.includes(k))) condCat = 'hazy';

  // 3) Pick a random variant 1–5
  const variant = Math.floor(Math.random() * 5) + 1;

  // 4) Build the primary path pointing at the gender/modesty sub-folder
  //    e.g. /assets/outfits/male_modest/male_modest_cold_variant3.png
  const folder         = `${gender}_${modesty}`; 
  const primaryName    = `${folder}_${tempCat}_${condCat}_variant${variant}.png`;
  const primaryPath    = `${BASE}assets/outfits/${folder}/${primaryName}`;

  // 5) Fallback to the flat filenames in the root of outfits/
  //    e.g. /assets/outfits/cold_modest_m_3.png  (male has '_m' suffix)
  const genderSuffix   = gender === 'male' ? '_m' : '';
  const fallbackName   = `${tempCat}_${modesty}${genderSuffix}_${variant}.png`;
  const fallbackPath   = `${BASE}assets/outfits/${fallbackName}`;

  return { primaryPath, fallbackPath };
}
