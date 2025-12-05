'use server';

import {
  getDesignSuggestions,
  type DesignSuggestionsInput,
} from '@/ai/flows/ai-design-suggestions';

export async function getSuggestionsAction(input: DesignSuggestionsInput) {
  try {
    const result = await getDesignSuggestions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get suggestions.' };
  }
}
