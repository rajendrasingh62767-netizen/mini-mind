'use server'

import { generateReel, ReelGeneratorInput } from '@/ai/flows/reel-generator-flow'

export async function createReel(input: ReelGeneratorInput) {
  try {
    const result = await generateReel(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in createReel action:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
