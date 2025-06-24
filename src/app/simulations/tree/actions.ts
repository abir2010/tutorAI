"use server";

import { z } from "zod";
import { generateTreeSimulation, TreeSimulationInput, TreeSimulationOutput } from "@/ai/flows/generate-tree-simulation";

const formSchema = z.object({
  algorithmName: z.string(),
  treeData: z.string(),
  target: z.string().optional(),
});

type Result =
  | { success: true, data: TreeSimulationOutput }
  | { success: false, error: string };

export async function handleTreeSimulation(values: z.infer<typeof formSchema>): Promise<Result> {
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    // Validate that treeData is valid JSON
    JSON.parse(parsed.data.treeData);
  } catch (e) {
    return { success: false, error: "Invalid tree data format. Please provide valid JSON." };
  }

  const input: TreeSimulationInput = {
    algorithmName: parsed.data.algorithmName,
    treeData: parsed.data.treeData,
    target: parsed.data.target ? Number(parsed.data.target) : undefined,
  };

  try {
    const output = await generateTreeSimulation(input);
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
