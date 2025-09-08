'use server';

/**
 * @fileOverview AI-powered reel generation flow.
 *
 * - generateReel - A function that generates a video reel from a text prompt.
 * - ReelGeneratorInput - The input type for the generateReel function.
 * - ReelGeneratorOutput - The return type for the generateReel function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { MediaPart } from 'genkit';
import * as fs from 'fs';
import { Readable } from 'stream';


const ReelGeneratorInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired video content.'),
});
export type ReelGeneratorInput = z.infer<typeof ReelGeneratorInputSchema>;

const ReelGeneratorOutputSchema = z.object({
    videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type ReelGeneratorOutput = z.infer<typeof ReelGeneratorOutputSchema>;


export async function generateReel(input: ReelGeneratorInput): Promise<ReelGeneratorOutput> {
  return reelGeneratorFlow(input);
}


const reelGeneratorFlow = ai.defineFlow(
  {
    name: 'reelGeneratorFlow',
    inputSchema: ReelGeneratorInputSchema,
    outputSchema: ReelGeneratorOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: '9:16',
      },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
        // eslint-disable-next-line no-await-in-loop
        operation = await ai.checkOperation(operation);
        // Sleep for 5 seconds before checking again.
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    
    if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
    }
    
    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video) {
        throw new Error('Failed to find the generated video');
    }

    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
        `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
    );
     if (
        !videoDownloadResponse ||
        videoDownloadResponse.status !== 200 ||
        !videoDownloadResponse.body
    ) {
        throw new Error('Failed to fetch video');
    }
    
    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
        videoDataUri: `data:video/mp4;base64,${base64}`
    }
  }
);
