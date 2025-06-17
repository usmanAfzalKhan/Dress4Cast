// src/utils/localLLM.js
import { AutoTokenizer, AutoModelForCausalLM } from '@xenova/transformers';

let tokenizer, model;

/**
 * Lazy‐load the tokenizer and model into memory.
 */
export async function initLocalModel() {
  if (!model) {
    tokenizer = await AutoTokenizer.fromPretrained('Xenova/distilgpt2');
    model     = await AutoModelForCausalLM.fromPretrained('Xenova/distilgpt2');
  }
}

/**
 * Given a prompt string, generate up to maxNewTokens.
 */
export async function generateOutfit(prompt, maxNewTokens = 50) {
  // ensure model is initialized
  await initLocalModel();

  // encode the prompt into token IDs
  const inputs = await tokenizer.encode(prompt);

  // run generation
  const output = await model.generate(inputs, {
    max_new_tokens: maxNewTokens,
  });

  // decode back into text, skipping special tokens
  return await tokenizer.decode(output[0], { skip_special_tokens: true });
}
