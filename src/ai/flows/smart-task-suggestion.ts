// 'use server'
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting new tasks
 * based on existing tasks and their descriptions.
 *
 * - suggestTasks - A function that takes existing tasks and their descriptions
 *   and returns a list of suggested tasks.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The output type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestTasksInputSchema = z.object({
  existingTasks: z.array(
    z.object({
      task_title: z.string(),
      task_description: z.string(),
    })
  ).describe('An array of existing tasks with their titles and descriptions.'),
});

export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

// Define the output schema
const SuggestTasksOutputSchema = z.object({
  suggestedTasks: z.array(
    z.object({
      task_title: z.string(),
      task_description: z.string(),
    })
  ).describe('An array of suggested tasks, each with a title and description.'),
});

export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

// Exported function to call the flow
export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

// Define the prompt
const suggestTasksPrompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a task management assistant. Given a list of existing tasks and their descriptions, suggest new tasks that the user might want to add to their list.

Existing Tasks:
{{#each existingTasks}}
- Title: {{this.task_title}}
  Description: {{this.task_description}}
{{/each}}

Suggested Tasks:
`,  // The prompt should guide the model to generate tasks in the specified format
});

// Define the flow
const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await suggestTasksPrompt(input);
    return output!;
  }
);
