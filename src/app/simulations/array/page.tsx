"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { handleAlgorithmSimulation } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlgorithmSimulationOutput } from "@/ai/flows/generate-algorithm-simulation";
import { cn } from "@/lib/utils";

const ALGORITHMS = [
    { value: "Bubble Sort", label: "Bubble Sort", type: "sort" },
    { value: "Selection Sort", label: "Selection Sort", type: "sort" },
    { value: "Insertion Sort", label: "Insertion Sort", type: "sort" },
    { value: "Merge Sort", label: "Merge Sort", type: "sort" },
    { value: "Quick Sort", label: "Quick Sort", type: "sort" },
    { value: "Linear Search", label: "Linear Search", type: "search" },
    { value: "Binary Search", label: "Binary Search", type: "search" },
];

const formSchema = z.object({
  algorithm: z.string().min(1, "Please select an algorithm."),
  arrayInput: z.string().refine(val => {
    if (val.trim() === '') return false;
    try {
      const arr = JSON.parse(`[${val}]`);
      return Array.isArray(arr) && arr.every(item => typeof item === 'number');
    } catch {
      return false;
    }
  }, { message: "Please enter a valid comma-separated list of numbers." }),
  target: z.string().optional(),
}).refine(data => {
  const selectedAlgorithm = ALGORITHMS.find(a => a.value === data.algorithm);
  if (selectedAlgorithm?.type === 'search') {
    return data.target !== undefined && data.target.trim() !== '' && !isNaN(Number(data.target));
  }
  return true;
}, {
  message: "Please enter a valid number to search for.",
  path: ["target"],
});


type FormValues = z.infer<typeof formSchema>;

type VisualizationStep = {
  array: number[];
  highlighted: number[];
  sorted?: number[];
  found_at?: number | null;
};

export default function SimulationsPage() {
  const [isPending, startTransition] = useTransition();
  const [simulationData, setSimulationData] = useState<AlgorithmSimulationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithm: "Bubble Sort",
      arrayInput: "5, 2, 8, 1, 9, 4",
      target: "9",
    },
  });
  
  const algorithm = form.watch("algorithm");
  const selectedAlgorithm = ALGORITHMS.find(a => a.value === algorithm);

  const onSubmit = (values: FormValues) => {
    setError(null);
    setSimulationData(null);
    startTransition(async () => {
      
      const parameters: {array: string, target?: number} = {
        array: `[${values.arrayInput}]`
      };

      if (selectedAlgorithm?.type === 'search' && values.target) {
        parameters.target = Number(values.target);
      }

      const result = await handleAlgorithmSimulation({
        algorithmName: values.algorithm,
        parameters: parameters
      });
      if (result.success) {
        setSimulationData(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-10">
            <CardHeader>
              <CardTitle>Array Simulator</CardTitle>
              <CardDescription>Select an algorithm and provide an array to see it in action.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="algorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Algorithm</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            const newAlgo = ALGORITHMS.find(a => a.value === value);
                            if (newAlgo?.type === 'sort') {
                              form.setValue('target', undefined);
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ALGORITHMS.map(algo => (
                              <SelectItem key={algo.value} value={algo.value}>{algo.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrayInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input Array</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5, 2, 8, 1, 9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedAlgorithm?.type === 'search' && (
                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Value</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulating...</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" /> Run Simulation</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle>Simulation View</CardTitle>
              <CardDescription>Watch the algorithm work its magic, step by step.</CardDescription>
            </CardHeader>
            <CardContent>
              {isPending && <SimulationSkeleton />}
              {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}
              {simulationData && <SimulationDisplay data={simulationData} />}
               {!isPending && !error && !simulationData && (
                 <div className="text-center text-muted-foreground pt-32">
                    Your algorithm simulation will appear here.
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const SimulationSkeleton = () => (
  <div className="space-y-6 pt-4">
    <div className="flex gap-2 h-20 items-center">
      <Skeleton className="h-16 w-16" />
      <Skeleton className="h-16 w-16" />
      <Skeleton className="h-16 w-16" />
      <Skeleton className="h-16 w-16" />
      <Skeleton className="h-16 w-16" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

function SimulationDisplay({ data }: { data: AlgorithmSimulationOutput }) {
  const [step, setStep] = useState(0);

  let visualizationSteps: VisualizationStep[] = [];
  try {
    const parsedData = JSON.parse(data.visualizationData);
    visualizationSteps = parsedData;
  } catch(e) {
    console.error("Failed to parse visualization data", e);
    return <div className="text-destructive">Error: Invalid visualization data from AI.</div>;
  }
  
  if (visualizationSteps.length === 0) {
     return <div className="text-muted-foreground">No visualization data available.</div>;
  }
  
  const currentStepData = visualizationSteps[step];
  
  return (
    <div className="space-y-6">
       <div className="space-y-4">
         <h3 className="font-semibold text-lg">Visualization</h3>
         <div className="w-full min-h-32 p-4 bg-muted/50 rounded-lg flex items-center justify-center">
           <div className="flex gap-2" style={{ transition: 'all 0.3s ease-in-out' }}>
              {currentStepData.array.map((value, index) => {
                const isHighlighted = currentStepData.highlighted.includes(index);
                const isSorted = currentStepData.sorted?.includes(index);
                const isFound = currentStepData.found_at === index;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                     <div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-md border text-lg font-bold transition-all duration-300",
                          isFound ? "bg-accent text-accent-foreground shadow-lg scale-110" :
                          isSorted ? "bg-primary/20 border-primary/30" : 
                          isHighlighted ? "bg-primary/80 border-primary text-primary-foreground shadow-lg scale-110" :
                          "bg-card border-border"
                        )}
                      >
                       {value}
                     </div>
                     <span className="text-xs text-muted-foreground">{index}</span>
                  </div>
                )
              })}
           </div>
         </div>
         <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-muted-foreground w-28">Step: {step + 1} / {visualizationSteps.length}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setStep(s => Math.min(visualizationSteps.length - 1, s + 1))} disabled={step === visualizationSteps.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
         </div>
       </div>
       <div>
         <h3 className="font-semibold text-lg mb-2">Description</h3>
         <p className="text-muted-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">{data.simulationDescription}</p>
       </div>
    </div>
  );
}
