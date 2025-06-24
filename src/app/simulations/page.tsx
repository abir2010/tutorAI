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
import { Loader2, Play } from "lucide-react";
import { handleAlgorithmSimulation } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlgorithmSimulationOutput } from "@/ai/flows/generate-algorithm-simulation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";

const ALGORITHMS = {
  array: [
    { value: "Bubble Sort", label: "Bubble Sort" },
    { value: "Selection Sort", label: "Selection Sort" },
    { value: "Insertion Sort", label: "Insertion Sort" },
  ],
  graph: [
    { value: "Breadth-First Search", label: "Breadth-First Search" },
    { value: "Depth-First Search", label: "Depth-First Search" },
  ],
  tree: [
    { value: "In-order Traversal", label: "In-order Traversal" },
    { value: "Pre-order Traversal", label: "Pre-order Traversal" },
  ]
};

const formSchema = z.object({
  category: z.string().min(1, "Please select a category."),
  algorithm: z.string().min(1, "Please select an algorithm."),
  arrayInput: z.string().refine(val => {
    if (val.trim() === '') return false;
    try {
      const arr = JSON.parse(`[${val}]`);
      return Array.isArray(arr) && arr.every(item => typeof item === 'number');
    } catch {
      return false;
    }
  }, { message: "Please enter a valid comma-separated list of numbers." })
});

type FormValues = z.infer<typeof formSchema>;

export default function SimulationsPage() {
  const [isPending, startTransition] = useTransition();
  const [simulationData, setSimulationData] = useState<AlgorithmSimulationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "array",
      algorithm: "Bubble Sort",
      arrayInput: "5, 2, 8, 1, 9, 4",
    },
  });

  const category = form.watch("category");

  const onSubmit = (values: FormValues) => {
    setError(null);
    setSimulationData(null);
    startTransition(async () => {
      const result = await handleAlgorithmSimulation({
        algorithmName: values.algorithm,
        parameters: {
          array: `[${values.arrayInput}]`
        }
      });
      if (result.success) {
        setSimulationData(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Simulator</CardTitle>
              <CardDescription>Select an algorithm and provide parameters to see it in action.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("algorithm", "");
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="graph" disabled>Graph (coming soon)</SelectItem>
                            <SelectItem value="tree" disabled>Tree (coming soon)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {category && (
                    <FormField
                      control={form.control}
                      name="algorithm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Algorithm</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an algorithm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ALGORITHMS[category as keyof typeof ALGORITHMS]?.map(algo => (
                                <SelectItem key={algo.value} value={algo.value}>{algo.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                   {category === 'array' && (
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
  <div className="space-y-6">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="w-full h-64 mt-8">
      <Skeleton className="w-full h-full" />
    </div>
  </div>
);

function SimulationDisplay({ data }: { data: AlgorithmSimulationOutput }) {
  const [step, setStep] = useState(0);

  let visualizationSteps: {array: number[]}[] = [];
  try {
    const parsedData = JSON.parse(data.visualizationData);
    if (Array.isArray(parsedData) && parsedData.every(item => Array.isArray(item.array))) {
      visualizationSteps = parsedData;
    }
  } catch(e) {
    console.error("Failed to parse visualization data", e);
    return <div className="text-destructive">Error: Invalid visualization data from AI.</div>;
  }
  
  if (visualizationSteps.length === 0) {
     return <div className="text-muted-foreground">No visualization data available.</div>;
  }
  
  const currentStepData = visualizationSteps[step]?.array?.map((value: number, index: number) => ({
    name: index.toString(),
    value: value,
  }));
  
  return (
    <div className="space-y-6">
       <div>
         <h3 className="font-semibold text-lg mb-2">Description</h3>
         <pre className="text-muted-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">{data.simulationDescription}</pre>
       </div>
       <div className="space-y-4">
         <h3 className="font-semibold text-lg">Visualization</h3>
         <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentStepData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'hsla(var(--card), 0.5)'}} 
                  contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} 
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" animationDuration={300} />
              </BarChart>
            </ResponsiveContainer>
         </div>
         <div className="flex items-center gap-4 pt-2">
            <span className="text-sm text-muted-foreground w-28">Step: {step + 1} / {visualizationSteps.length}</span>
            <Slider
              min={0}
              max={visualizationSteps.length > 0 ? visualizationSteps.length - 1 : 0}
              step={1}
              value={[step]}
              onValueChange={(value) => setStep(value[0])}
              className="w-full"
            />
         </div>
       </div>
    </div>
  );
}
