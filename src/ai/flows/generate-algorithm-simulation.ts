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
  visualizationData: z.string().describe('Data for visualizing the algorithm simulation, such as graph data or array state snapshots, represented as a JSON string.'),
});

export type AlgorithmSimulationOutput = z.infer<typeof AlgorithmSimulationOutputSchema>;

export async function generateAlgorithmSimulation(input: AlgorithmSimulationInput): Promise<AlgorithmSimulationOutput> {
  return generateAlgorithmSimulationFlow(input);
}

const algorithmSimulationPrompt = ai.definePrompt({
  name: 'algorithmSimulationPrompt',
  input: {schema: AlgorithmSimulationInputSchema},
  output: {schema: AlgorithmSimulationOutputSchema},
  prompt: `You are an expert in algorithms and data structures. Your task is to generate a simulation and visualization data for a given algorithm and its parameters.

  Algorithm Name: {{{algorithmName}}}
  Parameters: {{{parameters}}}

  Provide a clear, step-by-step textual description of the simulation, explaining how the algorithm works with the provided parameters.
  Also, generate visualization data (e.g., graph data in JSON format, array state snapshots) that can be used to visualize the algorithm's execution.

  Ensure that the visualization data is valid JSON and corresponds to the simulation description.
  visualizationData should be parsable by JSON.parse.

  Output Example:
  {
    "simulationDescription": "The simulation starts with an unsorted array [5, 2, 8, 1, 9]. The algorithm iterates through the array, comparing adjacent elements...",
    "visualizationData": "[{\"array\": [5, 2, 8, 1, 9]}, {\"array\": [2, 5, 8, 1, 9]}, ...]"
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
