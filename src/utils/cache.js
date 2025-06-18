// src/utils/cache.js

// Simple in-memory cache for outfit suggestions
const cache = {};

/**
 * Retrieve a cached outfit suggestion.
 * @param {string} key - The cache key (e.g. `${temp}-${style}-${gender}`)
 * @returns {{ text: string; imageUrl: string }|undefined}
 */
export function getCachedOutfit(key) {
  return cache[key];
}

/**
 * Store an outfit suggestion in cache.
 * @param {string} key - The cache key (e.g. `${temp}-${style}-${gender}`)
 * @param {{ text: string; imageUrl: string }} data - The suggestion data to cache
 */
export function setCachedOutfit(key, data) {
  cache[key] = data;
}
