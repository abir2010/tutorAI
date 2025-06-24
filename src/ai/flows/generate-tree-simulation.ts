'use server';

/**
 * @fileOverview A flow for generating tree algorithm simulations.
 *
 * - generateTreeSimulation - A function that handles the generation of tree algorithm simulations.
 * - TreeSimulationInput - The input type for the generateTreeSimulation function.
 * - TreeSimulationOutput - The return type for the generateTreeSimulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TreeSimulationInputSchema = z.object({
  algorithmName: z.string().describe('The name of the tree algorithm to simulate.'),
  treeData: z.string().describe('The tree structure as a JSON string. It should be a nested object with "value" and optional "left" and "right" children.'),
  target: z.number().optional().describe('The target value for search algorithms.'),
});

export type TreeSimulationInput = z.infer<typeof TreeSimulationInputSchema>;

const TreeSimulationOutputSchema = z.object({
  simulationDescription: z.string().describe('A textual description of the algorithm simulation, explaining the steps.'),
  visualizationData: z.string().describe('A JSON string representing an array of simulation steps. Each step visualizes the state of the tree.'),
});

export type TreeSimulationOutput = z.infer<typeof TreeSimulationOutputSchema>;

export async function generateTreeSimulation(input: TreeSimulationInput): Promise<TreeSimulationOutput> {
  return generateTreeSimulationFlow(input);
}

const treeSimulationPrompt = ai.definePrompt({
  name: 'treeSimulationPrompt',
  input: {schema: TreeSimulationInputSchema},
  output: {schema: TreeSimulationOutputSchema},
  prompt: `You are an expert in data structures, specializing in trees. Your task is to generate a simulation for a given tree algorithm.
  The output should be a detailed step-by-step description and a JSON string for visualization.

  Algorithm Name: {{{algorithmName}}}
  Tree Data: {{{treeData}}}
  {{#if target}}Target: {{{target}}}{{/if}}

  The input treeData JSON is a nested object. Each node has a "value" (number) and optional "left" and "right" children which are also node objects.

  For the visualizationData, you MUST generate node positions. Parse the input tree structure and augment it with 'id', 'x', and 'y' coordinates for each node to create a visually appealing binary tree layout. Node IDs should be unique strings (e.g., based on their value or path). The root node should be at the top center, and children should be placed below their parent, left and right. The canvas is 500px wide and 400px high.

  The visualizationData JSON string must be an array of step objects. It must be a valid JSON that can be parsed with \`JSON.parse\`. Pay close attention to escaping quotes and other special characters within the string fields like \`stepDescription\`.

  Each step object must contain the state of the tree. The state should include:
  - "nodes": The array of all nodes, including their id, value, x, y coordinates, and state properties (like 'color'). This array should be consistent across all steps.
  - "edges": The array of all edges, each with "source" and "target" ids. This array should be consistent across all steps.
  - "traversalOrder": An array of node values in the order they have been processed/visited up to this step.
  - "stepDescription": A brief description of what is happening in this specific step.
  - "found_at": The 'id' of the target node if found in this step. For traversal algorithms, this MUST always be \`null\`.

  ---
  **Algorithm-Specific Visualization State:**

  **For Traversals (In-order, Pre-order, Post-order):**
  - Node properties: \`color\` ('default', 'active', 'visited').
    - 'active': The node currently being considered by the algorithm, but not yet added to the traversal order.
    - 'visited': The node has been processed and its value added to the traversal order.
  - The \`traversalOrder\` array should be built up as the simulation progresses.
  - The \`found_at\` property MUST be \`null\` in every step.
  - Follow the specific order for each traversal type:
    - **In-order:** Process left child, then the node itself, then the right child.
    - **Pre-order:** Process the node itself, then its left child, then its right child.
    - **Post-order:** Process the left child, then the right child, then the node itself.
  - Your simulation steps must clearly show the recursive calls and backtracking. A node becomes 'active' when it is first reached. It becomes 'visited' only when its value is added to the \`traversalOrder\` array according to the specific traversal logic.

  **For Binary Search:**
  - Node properties: \`color\` ('default', 'active', 'path').
    - 'active': The node currently being compared against the target.
    - 'path': Nodes that have been visited on the path to the current active node.
  - Once the target is found, the 'found_at' property should be set to the node's id, and the node's color should become 'accent'.
  - If the target is not found, the simulation should end after the last possible comparison.

  ---
  **Example for In-order Traversal on a small tree:**
  {
    "simulationDescription": "In-order traversal visits the left subtree, then the root, then the right subtree. We start at the root node 10, move to its left child 5. Node 5 has no left child, so we visit 5. Then we return to the root 10 and visit it. Finally, we move to the right child 15 and visit it.",
    "visualizationData": "[{\\"nodes\\":[{\\"id\\":\\"10\\",\\"value\\":10,\\"x\\":250,\\"y\\":50,\\"color\\":\\"active\\"},{\\"id\\":\\"5\\",\\"value\\":5,\\"x\\":150,\\"y\\":150,\\"color\\":\\"default\\"},{\\"id\\":\\"15\\",\\"value\\":15,\\"x\\":350,\\"y\\":150,\\"color\\":\\"default\\"}],\\"edges\\":[{\\"source\\":\\"10\\",\\"target\\":\\"5\\"},{\\"source\\":\\"10\\",\\"target\\":\\"15\\"}],\\"traversalOrder\\":[],\\"stepDescription\\":\\"Start at root 10. Move to left child 5.\\",\\"found_at\\":null},{\\"nodes\\":[{\\"id\\":\\"10\\",\\"value\\":10,\\"x\\":250,\\"y\\":50,\\"color\\":\\"default\\"},{\\"id\\":\\"5\\",\\"value\\":5,\\"x\\":150,\\"y\\":150,\\"color\\":\\"active\\"},{\\"id\\":\\"15\\",\\"value\\":15,\\"x\\":350,\\"y\\":150,\\"color\\":\\"default\\"}],\\"edges\\":[{\\"source\\":\\"10\\",\\"target\\":\\"5\\"},{\\"source\\":\\"10\\",\\"target\\":\\"15\\"}],\\"traversalOrder\\":[],\\"stepDescription\\":\\"At node 5. It has no left child. Visit node 5.\\",\\"found_at\\":null},{\\"nodes\\":[{\\"id\\":\\"10\\",\\"value\\":10,\\"x\\":250,\\"y\\":50,\\"color\\":\\"default\\"},{\\"id\\":\\"5\\",\\"value\\":5,\\"x\\":150,\\"y\\":150,\\"color\\":\\"visited\\"},{\\"id\\":\\"15\\",\\"value\\":15,\\"x\\":350,\\"y\\":150,\\"color\\":\\"default\\"}],\\"edges\\":[{\\"source\\":\\"10\\",\\"target\\":\\"5\\"},{\\"source\\":\\"10\\",\\"target\\":\\"15\\"}],\\"traversalOrder\\":[5],\\"stepDescription\\":\\"Node 5 visited. Return to parent 10 and mark it active.\\",\\"found_at\\":null},{\\"nodes\\":[{\\"id\\":\\"10\\",\\"value\\":10,\\"x\\":250,\\"y\\":50,\\"color\\":\\"active\\"},{\\"id\\":\\"5\\",\\"value\\":5,\\"x\\":150,\\"y\\":150,\\"color\\":\\"visited\\"},{\\"id\\":\\"15\\",\\"value\\":15,\\"x\\":350,\\"y\\":150,\\"color\\":\\"default\\"}],\\"edges\\":[{\\"source\\":\\"10\\",\\"target\\":\\"5\\"},{\\"source\\":\\"10\\",\\"target\\":\\"15\\"}],\\"traversalOrder\\":[5],\\"stepDescription\\":\\"Visit node 10.\\",\\"found_at\\":null},{\\"nodes\\":[{\\"id\\":\\"10\\",\\"value\\":10,\\"x\\":250,\\"y\\":50,\\"color\\":\\"visited\\"},{\\"id\\":\\"5\\",\\"value\\":5,\\"x\\":150,\\"y\\":150,\\"color\\":\\"visited\\"},{\\"id\\":\\"15\\",\\"value\\":15,\\"x\\":350,\\"y\\":150,\\"color\\":\\"active\\"}],\\"edges\\":[{\\"source\\":\\"10\\",\\"target\\":\\"5\\"},{\\"source\\":\\"10\\",\\"target\\":\\"15\\"}],\\"traversalOrder\\":[5,10],\\"stepDescription\\":\\"Node 10 visited. Move to right child 15 and visit it.\\",\\"found_at\\":null},{\\"nodes\\":[{\\"id\\":\\"10\\",\\"value\\":10,\\"x\\":250,\\"y\\":50,\\"color\\":\\"visited\\"},{\\"id\\":\\"5\\",\\"value\\":5,\\"x\\":150,\\"y\\":150,\\"color\\":\\"visited\\"},{\\"id\\":\\"15\\",\\"value\\":15,\\"x\\":350,\\"y\\":150,\\"color\\":\\"visited\\"}],\\"edges\\":[{\\"source\\":\\"10\\",\\"target\\":\\"5\\"},{\\"source\\":\\"10\\",\\"target\\":\\"15\\"}],\\"traversalOrder\\":[5,10,15],\\"stepDescription\\":\\"Node 15 visited. Traversal complete.\\",\\"found_at\\":null}]"
  }

  Ensure the visualizationData is a valid JSON string that can be parsed by JSON.parse. The simulation should cover the entire process from start to finish.
  `,
});

const generateTreeSimulationFlow = ai.defineFlow(
  {
    name: 'generateTreeSimulationFlow',
    inputSchema: TreeSimulationInputSchema,
    outputSchema: TreeSimulationOutputSchema,
  },
  async input => {
    const {output} = await treeSimulationPrompt(input);
    return output!;
  }
);
