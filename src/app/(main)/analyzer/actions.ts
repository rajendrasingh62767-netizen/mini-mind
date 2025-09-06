'use server'

import { getProfileImprovementSuggestions, ProfileImprovementInput } from '@/ai/flows/profile-improvement-suggestions'

export async function analyzeProfile(input: ProfileImprovementInput) {
  try {
    const result = await getProfileImprovementSuggestions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in analyzeProfile action:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
