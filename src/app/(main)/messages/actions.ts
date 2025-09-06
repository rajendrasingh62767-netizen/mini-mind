'use server'

import { chat, ChatInput } from '@/ai/flows/chat-flow'

export async function getAiResponse(input: ChatInput) {
  try {
    const result = await chat(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getAiResponse action:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
