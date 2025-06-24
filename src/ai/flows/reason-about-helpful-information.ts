'use server';
/**
 * @fileOverview This flow uses a reasoning tool to determine the most helpful information to include in a step-by-step explanation.
 *
 * - reasonAboutHelpfulInformation - A function that handles the reasoning process and provides a step-by-step explanation.
 * - ReasonAboutHelpfulInformationInput - The input type for the reasonAboutHelpfulInformation function.
 * - ReasonAboutHelpfulInformationOutput - The return type for the reasonAboutHelpfulInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutHelpfulInformationInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
  subject: z.string().describe('The subject of the question (e.g., math, programming, web development).'),
});
export type ReasonAboutHelpfulInformationInput = z.infer<typeof ReasonAboutHelpfulInformationInputSchema>;

const ReasonAboutHelpfulInformationOutputSchema = z.object({
  explanation: z.string().describe('A step-by-step explanation of the answer, tailored to the student\u2019s question and subject. The explanation should be formatted in Markdown.'),
});
export type ReasonAboutHelpfulInformationOutput = z.infer<typeof ReasonAboutHelpfulInformationOutputSchema>;

export async function reasonAboutHelpfulInformation(input: ReasonAboutHelpfulInformationInput): Promise<ReasonAboutHelpfulInformationOutput> {
  return reasonAboutHelpfulInformationFlow(input);
}

const reasoningTool = ai.defineTool({
  name: 'reasoningTool',
  description: 'This tool determines the most helpful information to include in a step-by-step explanation based on the student\u2019s question and subject.',
  inputSchema: z.object({
    question: z.string().describe('The question asked by the student.'),
    subject: z.string().describe('The subject of the question.'),
  }),
  outputSchema: z.string().describe('The reasoning about the most helpful information.'),
}, async (input) => {
  // Simulate the reasoning process here.  In a real application, this would involve
  // sophisticated analysis of the question and subject to determine the best approach.
  return `Reasoning: Based on the subject ${input.subject} and the question ${input.question}, the most helpful information to include is a step-by-step explanation with clear examples and relevant code snippets where applicable.`;
});

const explanationPrompt = ai.definePrompt({
  name: 'explanationPrompt',
  tools: [reasoningTool],
  input: {schema: ReasonAboutHelpfulInformationInputSchema},
  output: {schema: ReasonAboutHelpfulInformationOutputSchema},
  prompt: `You are an AI tutor specializing in providing step-by-step explanations for student questions.  

  A student has asked the following question in the subject: {{{subject}}}.  
  Question: {{{question}}}

  First use the reasoningTool to determine the most helpful information to include in the explanation.  
  Then, provide a detailed step-by-step explanation that is tailored to the student's question and subject.  
  Make sure that the explanation uses the reasoning tool's output to determine the best way to help the student.

  Format the entire explanation in Markdown. Use headings, lists, bold text, and code blocks where appropriate to make the explanation clear and easy to read.
`,
});

const reasonAboutHelpfulInformationFlow = ai.defineFlow(
  {
    name: 'reasonAboutHelpfulInformationFlow',
    inputSchema: ReasonAboutHelpfulInformationInputSchema,
    outputSchema: ReasonAboutHelpfulInformationOutputSchema,
  },
  async input => {
    const {output} = await explanationPrompt(input);
    return output!;
  }
);
