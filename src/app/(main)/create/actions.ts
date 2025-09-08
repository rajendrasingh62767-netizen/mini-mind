'use server'

import { generateSpeech } from '@/ai/flows/tts-flow'

export async function getSongAudio(text: string) {
    try {
        const result = await generateSpeech(text);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in getSongAudio action:", error);
        let errorMessage = "An unexpected error occurred during audio generation.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}
