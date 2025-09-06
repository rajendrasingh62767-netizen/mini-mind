'use server';

/**
 * @fileOverview AI-powered chat flow.
 *
 * - chat - A function that generates a chat response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Message} from '@/lib/types';

const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      id: z.string(),
      senderId: z.string(),
      text: z.string(),
      timestamp: z.string(),
    })
  ),
  newMessage: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export type ChatOutput = string;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  prompt: `You are an AI assistant in a professional networking app called Mini Mind. Your name is Alex AI.

  The user you are chatting with has started a conversation. Your task is to respond professionally and helpfully.

  Here is the conversation history (the last message is the newest):
  {{#each history}}
  - {{#if (eq senderId "user-1")}}You{{else}}AI{{/if}}: {{{text}}}
  {{/each}}
  - You: {{{newMessage}}}

  Your response should be just the text of your message.
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
