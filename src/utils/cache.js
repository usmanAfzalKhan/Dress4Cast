const cache = {};

export function getCachedOutfit(key) {
  return cache[key];
}

export function setCachedOutfit(key, data) {
  cache[key] = data;
}
