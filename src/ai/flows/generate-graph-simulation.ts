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
  You MUST follow the algorithmic steps precisely. For example, for a graph with edges (A-C:9), (C-F:2), (F-E:9), the shortest path from A to E is A -> C -> F -> E with a total weight of 20.

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

  **For BFS:**
  - This is a traversal algorithm, not a search for a particular node. The goal is to visit every single reachable node from the starting node. The simulation MUST show the full traversal process, visiting nodes level by level, and continue until all reachable nodes from the start node have been visited.
  - Node properties: \`color\` ('default', 'visited', 'active').
  - Edge properties: \`color\` ('default', 'traversed').
  - The simulation should show the active node and highlight visited nodes and traversed edges.

  **For DFS:**
  - This is a traversal algorithm, not a search for a particular node. The goal is to visit every single reachable node from the starting node. The simulation MUST show the full traversal process, exploring as far as possible along each branch before backtracking, and continue until all reachable nodes from the start node have been visited.
  - Node properties: \`color\` ('default', 'visited', 'active').
  - Edge properties: \`color\` ('default', 'traversed').
  - The simulation should show the active node and highlight visited nodes and traversed edges.

  **For Dijkstra's and Bellman-Ford:**
  - Node properties: \`color\` ('default', 'visited', 'active'), \`distance\` (number or the string "Infinity", with "Infinity" for initial/unreachable nodes), \`parent\` (string|null).
  - Edge properties: \`color\` ('default', 'traversed', 'active').
  - The simulation should show distances being updated, the path being built, and the active node/edge being considered.
  - Once the algorithm is complete, the final step should highlight the shortest path from start to end node if found. Set the 'color' property of nodes and edges on the path to 'path'.

  **Specifics for Dijkstra's Algorithm:**
  1. Initialize all distances to "Infinity" except for the start node, which is 0. Set all parents to null.
  2. Maintain a set of unvisited nodes, initially containing all nodes.
  3. At each step, select the unvisited node with the smallest known distance to be the 'active' node.
  4. For the 'active' node, consider its unvisited neighbors. For each neighbor, if the path through the active node is shorter than the neighbor's current distance, update the neighbor's distance and set its parent to the 'active' node.
  5. After considering all neighbors, mark the 'active' node as 'visited'.
  6. Repeat until all reachable nodes are visited.
  7. In the final step, trace back from the end node using the 'parent' property to highlight the shortest path.

  **Specifics for Bellman-Ford Algorithm:**
  This algorithm finds the shortest paths from a single source vertex to all of the other vertices in a weighted digraph. It is slower than Dijkstra's but more versatile. You must execute it precisely.
  1.  **Initialization Step:**
      - Create the first visualization step.
      - In this step, set the distance to the start node to 0.
      - Set the distance to all other nodes to "Infinity".
      - Set the parent of all nodes to null.
      - The \`stepDescription\` should be "Initialization: Set start node distance to 0 and others to Infinity."
  2.  **Relaxation Loop:**
      - The algorithm must iterate exactly |V| - 1 times, where |V| is the number of nodes.
      - Each full iteration is **one step** in the visualization.
      - In **each** iteration, you must loop through **every single edge** in the graph.
      - For each edge from node \`u\` to node \`v\` with weight \`w\`:
          - Check if \`distance[u] + w < distance[v]\`.
          - **If it is**, update \`distance[v] = distance[u] + w\` and set \`parent[v] = u\`.
      - You must show the state of the graph *after* all edges have been checked for that iteration.
      - The \`stepDescription\` for these steps should describe the iteration number, e.g., "Iteration 1: Relaxing all edges...". You can also mention which distances were updated.
  3.  **Final Path:**
      - After |V| - 1 iterations are complete, create the final visualization step.
      - Trace the path back from the \`endNode\` using the \`parent\` pointers.
      - Set the \`color\` of all nodes and edges on the shortest path to 'path'.
      - The \`stepDescription\` should state the final shortest path and its total weight.

  **For Kruskal's Algorithm:**
  - Edge properties: \`color\` ('default', 'active', 'included', 'discarded').
  - The simulation should show edges being considered in order of weight, and whether they are included in the Minimum Spanning Tree (MST) or discarded.

  **For Floyd-Warshall Algorithm:**
  - The visualization should be a matrix.
  - State properties: \`distanceMatrix\` (a 2D array of distances (numbers or the string "Infinity") with a header row and column for node IDs), \`highlight\` object with {k: nodeId, i: nodeId, j: nodeId} representing the intermediate, source, and destination nodes being considered.
  - "nodes" and "edges" can be omitted for Floyd-Warshall after the first step, focus on the matrix.

  ---
  **Example for Dijkstra's on a small graph:**
  {
    "simulationDescription": "Dijkstra's algorithm finds the shortest path. We start at node A...",
    "visualizationData": "[
      {
        \\"nodes\\": [
          {\\"id\\":\\"A\\",\\"x\\":50,\\"y\\":150,\\"color\\":\\"active\\",\\"distance\\":0,\\"parent\\":null},
          {\\"id\\":\\"B\\",\\"x\\":250,\\"y\\":50,\\"color\\":\\"default\\",\\"distance\\":\\"Infinity\\",\\"parent\\":null},
          {\\"id\\":\\"C\\",\\"x\\":250,\\"y\\":250,\\"color\\":\\"default\\",\\"distance\\":\\"Infinity\\",\\"parent\\":null}
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
