'use server';

/**
 * @fileOverview A flow for generating algorithm simulations based on user-selected algorithms and parameters.
 *
 * - generateAlgorithmSimulation - A function that handles the generation of algorithm simulations.
 * - AlgorithmSimulationInput - The input type for the generateAlgorithmSimulation function.
 * - AlgorithmSimulationOutput - The return type for the generateAlgorithmSimulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlgorithmSimulationInputSchema = z.object({
  algorithmName: z.string().describe('The name of the algorithm to simulate (e.g., array sorting, graph traversal).'),
  parameters: z.record(z.any()).describe('A JSON object containing parameters specific to the selected algorithm (e.g., array size, start node).'),
});

export type AlgorithmSimulationInput = z.infer<typeof AlgorithmSimulationInputSchema>;

const AlgorithmSimulationOutputSchema = z.object({
  simulationDescription: z.string().describe('A textual description of the algorithm simulation, explaining the steps and visualizing the execution.'),
  visualizationData: z.string().describe('A JSON string representing an array of simulation steps. Each step includes the array state, highlighted indices, and sorted indices.'),
});

export type AlgorithmSimulationOutput = z.infer<typeof AlgorithmSimulationOutputSchema>;

export async function generateAlgorithmSimulation(input: AlgorithmSimulationInput): Promise<AlgorithmSimulationOutput> {
  return generateAlgorithmSimulationFlow(input);
}

const algorithmSimulationPrompt = ai.definePrompt({
  name: 'algorithmSimulationPrompt',
  input: {schema: AlgorithmSimulationInputSchema},
  output: {schema: AlgorithmSimulationOutputSchema},
  prompt: `You are an expert in algorithms and data structures. Your task is to generate a simulation for a given sorting algorithm and its parameters.

  Algorithm Name: {{{algorithmName}}}
  Parameters: {{{parameters}}}

  Provide a clear, step-by-step textual description of the simulation.
  Then, generate the visualization data as a JSON string. The JSON should be an array of objects, where each object represents one step of the algorithm.

  Each step object must have three keys:
  1. "array": The full array at that step.
  2. "highlighted": An array of indices that are being actively compared or manipulated in that step.
  3. "sorted": An array of indices of elements that are now in their final sorted position.

  For the first step, "highlighted" and "sorted" should be empty.
  For sorting algorithms, progressively add indices to the "sorted" array as they are placed in their final correct position.

  Ensure that the visualizationData is a valid JSON string that can be parsed by JSON.parse.

  Example for Bubble Sort on [3, 1, 2]:
  {
    "simulationDescription": "The simulation starts with an unsorted array [3, 1, 2]. We use Bubble Sort, which repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order...",
    "visualizationData": "[{\\"array\\":[3,1,2],\\"highlighted\\":[],\\"sorted\\":[]},{\\"array\\":[3,1,2],\\"highlighted\\":[0,1],\\"sorted\\":[]},{\\"array\\":[1,3,2],\\"highlighted\\":[1,2],\\"sorted\\":[]},{\\"array\\":[1,2,3],\\"highlighted\\":[0,1],\\"sorted\\":[2]},{\\"array\\":[1,2,3],\\"highlighted\\":[],\\"sorted\\":[1,2]}]"
  }`,
});

const generateAlgorithmSimulationFlow = ai.defineFlow(
  {
    name: 'generateAlgorithmSimulationFlow',
    inputSchema: AlgorithmSimulationInputSchema,
    outputSchema: AlgorithmSimulationOutputSchema,
  },
  async input => {
    const {output} = await algorithmSimulationPrompt(input);
    return output!;
  }
);
