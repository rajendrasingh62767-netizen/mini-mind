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
import {Message, User} from '@/lib/types';
import {users} from '@/lib/data';

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
  currentUser: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string(),
    description: z.string(),
  }),
  participant: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string(),
    description: z.string(),
  }),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export type ChatOutput = string;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  prompt: `You are acting as a user in a professional networking app called Mini Mind.

  Your name is {{{participant.name}}}, and your persona is: "{{{participant.description}}}".
  You are having a conversation with {{{currentUser.name}}}, whose persona is: "{{{currentUser.description}}}".

  Do not reveal that you are an AI. Act as {{{participant.name}}}.

  Here is the conversation history (the last message is the newest):
  {{#each history}}
  - {{#if (eq senderId currentUser.id)}}{{currentUser.name}}{{else}}{{{participant.name}}}{{/if}}: {{{text}}}
  {{/each}}
  - {{{currentUser.name}}}: {{{newMessage}}}

  Your response should be just the text of your message, from the perspective of {{{participant.name}}}.
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
