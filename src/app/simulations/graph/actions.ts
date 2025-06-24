"use server";

import { z } from "zod";
import { generateGraphSimulation, GraphSimulationInput, GraphSimulationOutput } from "@/ai/flows/generate-graph-simulation";

const formSchema = z.object({
  algorithmName: z.string(),
  graphData: z.string(),
  startNode: z.string().optional(),
  endNode: z.string().optional(),
});

type Result = 
  | { success: true, data: GraphSimulationOutput }
  | { success: false, error: string };

export async function handleGraphSimulation(values: z.infer<typeof formSchema>): Promise<Result> {
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }
  
  try {
    // Validate that graphData is valid JSON
    JSON.parse(parsed.data.graphData);
  } catch (e) {
    return { success: false, error: "Invalid graph data format. Please provide valid JSON." };
  }

  const input: GraphSimulationInput = {
    algorithmName: parsed.data.algorithmName,
    graphData: parsed.data.graphData,
    startNode: parsed.data.startNode,
    endNode: parsed.data.endNode,
  };

  try {
    const output = await generateGraphSimulation(input);
    // Basic check to see if the JSON is valid before returning
    JSON.parse(output.visualizationData);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    if (e instanceof SyntaxError) {
       return { success: false, error: "AI returned invalid visualization data. Please try again." };
    }
    return { success: false, error: "An unexpected error occurred while running the simulation. Please try again." };
  }
}
