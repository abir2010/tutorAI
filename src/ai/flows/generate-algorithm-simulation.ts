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
  array: z.string().describe('The array of numbers as a JSON string.'),
  target: z.number().optional().describe('The target number for search algorithms.'),
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
  prompt: `You are an expert in algorithms and data structures. Your task is to generate a simulation for a given algorithm and its parameters.

  Algorithm Name: {{{algorithmName}}}
  Array: {{{array}}}
  {{#if target}}
  Target: {{{target}}}
  {{/if}}

  Provide a clear, step-by-step textual description of the simulation.
  Then, generate the visualization data as a JSON string. The JSON should be an array of objects, where each object represents one step of the algorithm.

  **For sorting algorithms:**
  Each step object must have three keys:
  1. "array": The full array at that step.
  2. "highlighted": An array of indices that are being actively compared or manipulated in that step.
  3. "sorted": An array of indices of elements that are now in their final sorted position.

  For the first step, "highlighted" and "sorted" should be empty.
  Progressively add indices to the "sorted" array as they are placed in their final correct position.

  Example for Bubble Sort on [3, 1, 2]:
  {
    "simulationDescription": "The simulation starts with an unsorted array [3, 1, 2]. We use Bubble Sort, which repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order...",
    "visualizationData": "[{\\"array\\":[3,1,2],\\"highlighted\\":[],\\"sorted\\":[]},{\\"array\\":[3,1,2],\\"highlighted\\":[0,1],\\"sorted\\":[]},{\\"array\\":[1,3,2],\\"highlighted\\":[1,2],\\"sorted\\":[]},{\\"array\\":[1,2,3],\\"highlighted\\":[0,1],\\"sorted\\":[2]},{\\"array\\":[1,2,3],\\"highlighted\\":[],\\"sorted\\":[1,2]}]"
  }
  
  **For searching algorithms:**
  For Binary Search, you must first include steps to sort the array if it is not already sorted, explaining that this is a prerequisite.
  Each step object must have three keys:
  1. "array": The full array at that step.
  2. "highlighted": An array of indices that are being actively compared or examined. For Binary Search, this should be the low, mid, and high pointers.
  3. "found_at": The index of the target element if found in this step, otherwise null. Once found, this should be the index for all subsequent steps until the simulation ends. If not found, it should remain null.

  Example for Linear Search for target 2 in [3, 1, 2]:
  {
    "simulationDescription": "The simulation starts with an array [3, 1, 2] and a target of 2. We use Linear Search, which checks each element sequentially. It finds the target at index 2.",
    "visualizationData": "[{\\"array\\":[3,1,2],\\"highlighted\\":[],\\"found_at\\":null},{\\"array\\":[3,1,2],\\"highlighted\\":[0],\\"found_at\\":null},{\\"array\\":[3,1,2],\\"highlighted\\":[1],\\"found_at\\":null},{\\"array\\":[3,1,2],\\"highlighted\\":[2],\\"found_at\\":2}]"
  }

  Ensure that the visualizationData is a valid JSON string that can be parsed by JSON.parse. The simulation should cover the entire process from start to finish.`,
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
