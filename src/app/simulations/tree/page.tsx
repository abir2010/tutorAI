"use client";

import { useState, useTransition, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { handleTreeSimulation } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { TreeSimulationOutput } from "@/ai/flows/generate-tree-simulation";
import { cn } from "@/lib/utils";

const ALGORITHMS = [
    { value: "In-order Traversal", label: "In-order Traversal", type: "traversal" },
    { value: "Pre-order Traversal", label: "Pre-order Traversal", type: "traversal" },
    { value: "Post-order Traversal", label: "Post-order Traversal", type: "traversal" },
    { value: "Binary Search", label: "Binary Search", type: "search" },
];

const defaultTreeData = `{
  "value": 15,
  "left": {
    "value": 6,
    "left": { "value": 3, "left": { "value": 2 }, "right": { "value": 4 } },
    "right": { "value": 7, "right": { "value": 13 } }
  },
  "right": {
    "value": 18,
    "left": { "value": 17 },
    "right": { "value": 20 }
  }
}`;

const formSchema = z.object({
  algorithm: z.string().min(1, "Please select an algorithm."),
  treeData: z.string().refine(val => {
    try {
      const data = JSON.parse(val);
      return typeof data === 'object' && data !== null && 'value' in data;
    } catch {
      return false;
    }
  }, { message: "Invalid JSON format for tree data." }),
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

type Node = { id: string; value: number; x: number; y: number; color?: string; };
type Edge = { source: string; target: string; };
type VisualizationStep = {
    nodes: Node[];
    edges: Edge[];
    stepDescription: string;
    traversalOrder: (number | string)[];
    found_at: string | null;
};


export default function TreeSimulationsPage() {
  const [isPending, startTransition] = useTransition();
  const [simulationData, setSimulationData] = useState<TreeSimulationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithm: "In-order Traversal",
      treeData: defaultTreeData,
      target: "13",
    },
  });

  const algorithm = form.watch("algorithm");
  const selectedAlgorithm = ALGORITHMS.find(a => a.value === algorithm);

  const onSubmit = (values: FormValues) => {
    setError(null);
    setSimulationData(null);
    startTransition(async () => {
      const result = await handleTreeSimulation({
        algorithmName: values.algorithm,
        treeData: values.treeData,
        target: values.target,
      });

      if (result.success) {
        setSimulationData(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  const simulationSteps: VisualizationStep[] | null = useMemo(() => {
    if (!simulationData) return null;
    try {
        return JSON.parse(simulationData.visualizationData);
    } catch (e) {
        setError("AI returned invalid visualization data. Please try again.");
        console.error("JSON parse error in tree page", e)
        return null;
    }
  }, [simulationData]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-10">
            <CardHeader>
              <CardTitle>Tree Simulator</CardTitle>
              <CardDescription>Visualize tree algorithms step by step.</CardDescription>
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
                            if (newAlgo?.type === 'traversal') {
                              form.setValue('target', undefined);
                            }
                          }}
                          defaultValue={field.value}>
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
                    name="treeData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tree Data (JSON)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter tree data as nested JSON..." {...field} rows={10} />
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
                            <Input type="number" placeholder="e.g., 13" {...field} />
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
          <Card className="min-h-[700px]">
            <CardHeader>
              <CardTitle>Simulation View</CardTitle>
              <CardDescription>Watch the algorithm work its magic, step by step.</CardDescription>
            </CardHeader>
            <CardContent>
              {isPending && <SimulationSkeleton />}
              {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}
              {simulationData && simulationSteps && <SimulationDisplay data={simulationData} steps={simulationSteps} />}
              {!isPending && !error && !simulationData && (
                <div className="text-center text-muted-foreground pt-32">
                  Your tree simulation will appear here.
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
    <Skeleton className="h-[400px] w-full" />
    <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
        </div>
    </div>
    <Skeleton className="h-24 w-full" />
  </div>
);

function SimulationDisplay({ data, steps }: { data: TreeSimulationOutput, steps: VisualizationStep[] }) {
    if (!steps || steps.length === 0) {
        return <div className="text-muted-foreground">No visualization data available.</div>;
    }
  return (
    <div className="space-y-6">
       <div className="space-y-4">
         <h3 className="font-semibold text-lg">Visualization</h3>
         <TreeVisualizer steps={steps} />
       </div>
       <div>
         <h3 className="font-semibold text-lg mb-2">Description</h3>
         <p className="text-muted-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">{data.simulationDescription}</p>
       </div>
    </div>
  );
}

function TreeVisualizer({ steps }: { steps: VisualizationStep[] }) {
    const [step, setStep] = useState(0);
    const currentStep = steps[step];
    
    const nodeMap = useMemo(() => {
        const map = new Map<string, Node>();
        if (currentStep?.nodes) {
            currentStep.nodes.forEach(node => map.set(node.id, node));
        }
        return map;
    }, [currentStep]);

    if (!currentStep) {
        return <div className="text-muted-foreground">Preparing visualization...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="relative w-full h-[400px] bg-muted/50 rounded-lg overflow-hidden">
                <svg className="w-full h-full">
                    {/* Edges */}
                    {currentStep.edges.map((edge, index) => {
                        const sourceNode = nodeMap.get(edge.source);
                        const targetNode = nodeMap.get(edge.target);
                        if (!sourceNode || !targetNode) return null;
                        
                        return (
                            <line
                                key={`${edge.source}-${edge.target}-${index}`}
                                x1={sourceNode.x} y1={sourceNode.y}
                                x2={targetNode.x} y2={targetNode.y}
                                className="stroke-border transition-all"
                                strokeWidth={2}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {currentStep.nodes.map(node => {
                     const colorClasses: {[key: string]: string} = {
                        active: "bg-primary text-primary-foreground border-primary shadow-lg scale-110",
                        visited: "bg-primary/30 border-primary/50",
                        path: "bg-accent/30 border-accent/50",
                        accent: "bg-accent text-accent-foreground border-accent shadow-lg scale-110",
                        default: "bg-card border-border",
                     }
                    return (
                        <div
                            key={node.id}
                            className={cn(
                                "absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 border-2", 
                                colorClasses[node.color || 'default'] || 'bg-card border-border'
                            )}
                            style={{ left: `${node.x}px`, top: `${node.y}px` }}
                        >
                            <span className="text-sm font-bold">{node.value}</span>
                        </div>
                    );
                })}
            </div>
            
             <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-sm text-muted-foreground w-28">Step: {step + 1} / {steps.length}</span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg min-h-16">
                 <h4 className="font-semibold mb-2">Current Step:</h4>
                 <p className="text-sm text-muted-foreground">{currentStep.stepDescription}</p>
            </div>
             {currentStep.traversalOrder && currentStep.traversalOrder.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Traversal Order:</h4>
                    <div className="flex flex-wrap gap-2">
                        {currentStep.traversalOrder.map((val, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium">
                                {String(val)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
