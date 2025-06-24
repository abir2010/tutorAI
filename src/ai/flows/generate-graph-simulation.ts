'use server';

/**
 * @fileOverview A flow for generating graph algorithm simulations.
 *
 * - generateGraphSimulation - A function that handles the generation of graph algorithm simulations.
 * - GraphSimulationInput - The input type for the generateGraphSimulation function.
 * - GraphSimulationOutput - The return type for the generateGraphSimulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GraphSimulationInputSchema = z.object({
  algorithmName: z.string().describe('The name of the graph algorithm to simulate.'),
  graphData: z.string().describe('The graph structure as a JSON string. It should be an object with "nodes" and "edges" arrays. Nodes should have an id. Edges should have "source" and "target" ids, and an optional "weight".'),
  startNode: z.string().optional().describe('The starting node for traversal or pathfinding algorithms.'),
  endNode: z.string().optional().describe('The ending node for pathfinding algorithms.'),
});

export type GraphSimulationInput = z.infer<typeof GraphSimulationInputSchema>;

const GraphSimulationOutputSchema = z.object({
  simulationDescription: z.string().describe('A textual description of the algorithm simulation, explaining the steps and visualizing the execution.'),
  visualizationData: z.string().describe('A JSON string representing an array of simulation steps. Each step visualizes the state of the graph.'),
});

export type GraphSimulationOutput = z.infer<typeof GraphSimulationOutputSchema>;

export async function generateGraphSimulation(input: GraphSimulationInput): Promise<GraphSimulationOutput> {
  return generateGraphSimulationFlow(input);
}

const graphSimulationPrompt = ai.definePrompt({
  name: 'graphSimulationPrompt',
  input: {schema: GraphSimulationInputSchema},
  output: {schema: GraphSimulationOutputSchema},
  prompt: `You are an expert in graph algorithms. Your task is to generate a simulation for a given graph algorithm and its parameters.
  The output should be a detailed step-by-step description and a JSON string for visualization.

  Algorithm Name: {{{algorithmName}}}
  Graph Data: {{{graphData}}}
  {{#if startNode}}Start Node: {{{startNode}}}{{/if}}
  {{#if endNode}}End Node: {{{endNode}}}{{/if}}

  The input graphData JSON has two keys: "nodes" and "edges".
  - "nodes" is an array of objects, each with an "id" (string).
  - "edges" is an array of objects, each with "source" (string), "target" (string), and an optional "weight" (number).

  For the visualizationData, you MUST generate node positions. Augment the input nodes with 'x' and 'y' coordinates (from 0 to 500 for x and 0 to 550 for y) to create a visually appealing layout. Ensure nodes do not overlap.

  The visualizationData JSON string must be an array of step objects. Each step object must contain the state of the graph. The state should include:
  - "nodes": The array of all nodes, including their id, x, y coordinates, and state properties (like 'color', 'distance', 'parent').
  - "edges": The array of all edges, including source, target, weight, and state properties (like 'color', 'isIncluded').
  - "stepDescription": A brief description of what is happening in this specific step.

  ---
  **Algorithm-Specific Visualization State:**

  **For BFS and DFS:**
  - Node properties: \`color\` ('default', 'visited', 'active').
  - Edge properties: \`color\` ('default', 'traversed').
  - The simulation should show the active node and highlight visited nodes and traversed edges.

  **For Dijkstra's and Bellman-Ford:**
  - Node properties: \`color\` ('default', 'visited', 'active'), \`distance\` (number, Infinity initially), \`parent\` (string|null).
  - Edge properties: \`color\` ('default', 'traversed', 'active').
  - The simulation should show distances being updated, the path being built, and the active node/edge being considered. Once the algorithm is complete, the final step should highlight the shortest path from start to end node, if found.

  **For Kruskal's Algorithm:**
  - Edge properties: \`color\` ('default', 'active', 'included', 'discarded').
  - The simulation should show edges being considered in order of weight, and whether they are included in the Minimum Spanning Tree (MST) or discarded.

  **For Floyd-Warshall Algorithm:**
  - The visualization should be a matrix.
  - State properties: \`distanceMatrix\` (a 2D array of distances with a header row and column for node IDs), \`highlight\` object with {k: nodeId, i: nodeId, j: nodeId} representing the intermediate, source, and destination nodes being considered.
  - "nodes" and "edges" can be omitted for Floyd-Warshall after the first step, focus on the matrix.

  ---
  **Example for Dijkstra's on a small graph:**
  {
    "simulationDescription": "Dijkstra's algorithm finds the shortest path. We start at node A...",
    "visualizationData": "[
      {
        \\"nodes\\": [
          {\\"id\\":\\"A\\",\\"x\\":50,\\"y\\":150,\\"color\\":\\"active\\",\\"distance\\":0,\\"parent\\":null},
          {\\"id\\":\\"B\\",\\"x\\":250,\\"y\\":50,\\"color\\":\\"default\\",\\"distance\\":Infinity,\\"parent\\":null},
          {\\"id\\":\\"C\\",\\"x\\":250,\\"y\\":250,\\"color\\":\\"default\\",\\"distance\\":Infinity,\\"parent\\":null}
        ],
        \\"edges\\": [
          {\\"source\\":\\"A\\",\\"target\\":\\"B\\",\\"weight\\":10,\\"color\\":\\"default\\"},
          {\\"source\\":\\"A\\",\\"target\\":\\"C\\",\\"weight\\":3,\\"color\\":\\"default\\"}
        ],
        \\"stepDescription\\": \\"Initialize distances. Start node A has distance 0.\\"
      },
      {
        \\"nodes\\": [
          {\\"id\\":\\"A\\",\\"x\\":50,\\"y\\":150,\\"color\\":\\"visited\\",\\"distance\\":0,\\"parent\\":null},
          {\\"id\\":\\"B\\",\\"x\\":250,\\"y\\":50,\\"color\\":\\"default\\",\\"distance\\":10,\\"parent\\":\\"A\\"},
          {\\"id\\":\\"C\\",\\"x\\":250,\\"y\\":250,\\"color\\":\\"active\\",\\"distance\\":3,\\"parent\\":\\"A\\"}
        ],
        \\"edges\\": [
          {\\"source\\":\\"A\\",\\"target\\":\\"B\\",\\"weight\\":10,\\"color\\":\\"active\\"},
          {\\"source\\":\\"A\\",\\"target\\":\\"C\\",\\"weight\\":3,\\"color\\":\\"active\\"}
        ],
        \\"stepDescription\\": \\"Visit neighbors of A. Update distances for B and C. C is now the active node.\\"
      }
    ]"
  }

  Ensure the visualizationData is a valid JSON string that can be parsed by JSON.parse. The simulation should cover the entire process from start to finish.
  `,
});

const generateGraphSimulationFlow = ai.defineFlow(
  {
    name: 'generateGraphSimulationFlow',
    inputSchema: GraphSimulationInputSchema,
    outputSchema: GraphSimulationOutputSchema,
  },
  async input => {
    const {output} = await graphSimulationPrompt(input);
    return output!;
  }
);
