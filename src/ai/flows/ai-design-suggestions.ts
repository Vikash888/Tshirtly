'use server';

/**
 * @fileOverview An AI-powered design suggestion flow.
 *
 * - getDesignSuggestions - A function that provides design suggestions.
 * - DesignSuggestionsInput - The input type for the getDesignSuggestions function.
 * - DesignSuggestionsOutput - The return type for the getDesignSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DesignSuggestionsInputSchema = z.object({
  designDescription: z
    .string()
    .describe('The current design description for the t-shirt.'),
});
export type DesignSuggestionsInput = z.infer<typeof DesignSuggestionsInputSchema>;

const DesignSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of AI-powered design suggestions based on current trending clothing.'),
});
export type DesignSuggestionsOutput = z.infer<typeof DesignSuggestionsOutputSchema>;

export async function getDesignSuggestions(input: DesignSuggestionsInput): Promise<DesignSuggestionsOutput> {
  return designSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'designSuggestionsPrompt',
  input: {schema: DesignSuggestionsInputSchema},
  output: {schema: DesignSuggestionsOutputSchema},
  prompt: `You are an AI assistant specializing in providing trendy t-shirt design suggestions.

  Based on the following current design description:
  {{designDescription}}

  Suggest design elements, placements, and styles that align with current fashion trends. Provide 3-5 concise suggestions.`,
});

const designSuggestionsFlow = ai.defineFlow(
  {
    name: 'designSuggestionsFlow',
    inputSchema: DesignSuggestionsInputSchema,
    outputSchema: DesignSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
