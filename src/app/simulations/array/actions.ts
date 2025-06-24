"use server";

import { z } from "zod";
import { generateAlgorithmSimulation, AlgorithmSimulationInput, AlgorithmSimulationOutput } from "@/ai/flows/generate-algorithm-simulation";

const formSchema = z.object({
  algorithmName: z.string(),
  parameters: z.record(z.any()),
});

type Result = 
  | { success: true, data: AlgorithmSimulationOutput }
  | { success: false, error: string };

export async function handleAlgorithmSimulation(values: z.infer<typeof formSchema>): Promise<Result> {
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const input: AlgorithmSimulationInput = {
    algorithmName: parsed.data.algorithmName,
    parameters: parsed.data.parameters,
  };

  try {
    const output = await generateAlgorithmSimulation(input);
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
