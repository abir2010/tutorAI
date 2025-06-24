"use server";

import { z } from "zod";
import { reasonAboutHelpfulInformation, ReasonAboutHelpfulInformationInput, ReasonAboutHelpfulInformationOutput } from "@/ai/flows/reason-about-helpful-information";

const formSchema = z.object({
  subject: z.string(),
  question: z.string(),
});

type Result = 
  | { success: true, data: ReasonAboutHelpfulInformationOutput }
  | { success: false, error: string };

export async function handleTutorRequest(values: z.infer<typeof formSchema>): Promise<Result> {
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const input: ReasonAboutHelpfulInformationInput = {
    subject: parsed.data.subject,
    question: parsed.data.question,
  };

  try {
    const output = await reasonAboutHelpfulInformation(input);
    return { success: true, data: output };
  } catch (e) {
    console.error(e);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
