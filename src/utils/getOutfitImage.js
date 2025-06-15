// src/utils/getOutfitImage.js

/**
 * Builds two URLs for your AI-generated outfits:
 *  • primaryPath   = /assets/outfits/<gender>_<modesty>/<fileName>
 *  • fallbackPath  = /assets/outfits/<fileName>
 */
export default function getOutfitImage(gender, modesty, tempCelsius, condition) {
  // 1) Bucket temperature
  let tempCat;
  if      (tempCelsius <= 10) tempCat = 'cold';
  else if (tempCelsius <= 20) tempCat = 'mild';
  else if (tempCelsius <= 30) tempCat = 'warm';
  else                         tempCat = 'hot';

  // 2) Simplify condition string
  const c = condition.toLowerCase();
  let condCat = 'default';
  if (c.includes('clear'))      condCat = 'clear';
  else if (c.includes('cloud')) condCat = 'overcast';
  else if (['rain','drizzle'].some(k => c.includes(k))) condCat = 'rainy';
  else if (['snow'].some(k => c.includes(k)))            condCat = 'snowy';
  else if (['haze','mist','fog'].some(k => c.includes(k))) condCat = 'hazy';

  // 3) Compose folder & filename
  const folder   = `${gender}_${modesty}`;         // e.g. "male_modest"
  const fileName = `${gender}_${modesty}_${tempCat}_${condCat}.png`;

  // 4) Return both primary + fallback paths
  return {
    primaryPath:  `/assets/outfits/${folder}/${fileName}`,
    fallbackPath: `/assets/outfits/${fileName}`
  };
}
