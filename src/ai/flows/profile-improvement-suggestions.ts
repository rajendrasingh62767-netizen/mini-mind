'use server';

/**
 * @fileOverview AI-powered profile improvement suggestions flow.
 *
 * - getProfileImprovementSuggestions - A function that generates profile improvement suggestions.
 * - ProfileImprovementInput - The input type for the getProfileImprovementSuggestions function.
 * - ProfileImprovementOutput - The return type for the getProfileImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfileImprovementInputSchema = z.object({
  profilePhotoDataUri: z
    .string()
    .describe(
      "A photo of the user's profile, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  profileDescription: z.string().describe("The user's current profile description."),
  desiredAudience: z.string().describe('The target audience or type of connections the user wants to attract.'),
  industry: z.string().describe('The industry the user works in.'),
});
export type ProfileImprovementInput = z.infer<typeof ProfileImprovementInputSchema>;

const ProfileImprovementOutputSchema = z.object({
  photoSuggestions: z.string().describe('Suggestions for improving the profile photo.'),
  descriptionSuggestions: z.string().describe('Suggestions for improving the profile description.'),
  overallSuggestions: z.string().describe('Overall suggestions for attracting more connections and engagement.'),
});
export type ProfileImprovementOutput = z.infer<typeof ProfileImprovementOutputSchema>;

export async function getProfileImprovementSuggestions(
  input: ProfileImprovementInput
): Promise<ProfileImprovementOutput> {
  return profileImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profileImprovementPrompt',
  input: {schema: ProfileImprovementInputSchema},
  output: {schema: ProfileImprovementOutputSchema},
  prompt: `You are an AI expert in profile optimization, skilled in providing suggestions to enhance user profiles on professional networking platforms.

  Given the following information about a user's profile, provide actionable suggestions to improve their profile photo, description, and overall profile to attract more connections and engagement.

  Profile Photo: {{media url=profilePhotoDataUri}}
  Current Description: {{{profileDescription}}}
  Desired Audience: {{{desiredAudience}}}
  Industry: {{{industry}}}

  Provide specific suggestions for the following:
  - photoSuggestions: Suggestions for improving the profile photo.
  - descriptionSuggestions: Suggestions for improving the profile description.
  - overallSuggestions: Overall suggestions for attracting more connections and engagement, considering the desired audience and industry.

  Ensure the suggestions are tailored to the user's industry and the audience they want to attract. Focus on professionalism, clarity, and engagement.
`,
});

const profileImprovementFlow = ai.defineFlow(
  {
    name: 'profileImprovementFlow',
    inputSchema: ProfileImprovementInputSchema,
    outputSchema: ProfileImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
