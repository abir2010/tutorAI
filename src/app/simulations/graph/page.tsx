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
import { handleGraphSimulation } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { GraphSimulationOutput } from "@/ai/flows/generate-graph-simulation";
import { cn } from "@/lib/utils";

const ALGORITHMS = [
    { value: "BFS", label: "Breadth-First Search", needsStart: true, needsEnd: false },
    { value: "DFS", label: "Depth-First Search", needsStart: true, needsEnd: false },
    { value: "Dijkstra's", label: "Dijkstra's Algorithm", needsStart: true, needsEnd: true },
    { value: "Bellman-Ford", label: "Bellman-Ford Algorithm", needsStart: true, needsEnd: false },
    { value: "Kruskal's", label: "Kruskal's Algorithm", needsStart: false, needsEnd: false },
    { value: "Floyd-Warshall", label: "Floyd-Warshall Algorithm", needsStart: false, needsEnd: false },
];

const defaultGraphData = `{
  "nodes": [
    {"id": "A"}, {"id": "B"}, {"id": "C"},
    {"id": "D"}, {"id": "E"}, {"id": "F"}
  ],
  "edges": [
    {"source": "A", "target": "B", "weight": 7},
    {"source": "A", "target": "C", "weight": 9},
    {"source": "A", "target": "F", "weight": 14},
    {"source": "B", "target": "C", "weight": 10},
    {"source": "B", "target": "D", "weight": 15},
    {"source": "C", "target": "D", "weight": 11},
    {"source": "C", "target": "F", "weight": 2},
    {"source": "D", "target": "E", "weight": 6},
    {"source": "E", "target": "F", "weight": 9}
  ]
}`;

const formSchema = z.object({
  algorithm: z.string().min(1, "Please select an algorithm."),
  graphData: z.string().refine(val => {
    try {
      const data = JSON.parse(val);
      return typeof data === 'object' && data !== null && Array.isArray(data.nodes) && Array.isArray(data.edges);
    } catch {
      return false;
    }
  }, { message: "Invalid JSON format for graph data." }),
  startNode: z.string().optional(),
  endNode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Node = { id: string; x: number; y: number; color?: string; distance?: number | string; parent?: string | null };
type Edge = { source: string; target: string; weight?: number; color?: string; isIncluded?: boolean };
type VisualizationStep = {
    nodes: Node[];
    edges: Edge[];
    stepDescription: string;
    distanceMatrix?: (number | string)[][];
    highlight?: {k: string, i: string, j: string};
};

function GraphVisualizer({ steps }: { steps: VisualizationStep[] }) {
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

    const isFloydWarshall = currentStep.distanceMatrix !== undefined;

    return (
        <div className="space-y-4">
            {isFloydWarshall ? (
                <FloydWarshallVisualizer step={currentStep} />
            ) : (
                <div className="relative w-full h-[550px] bg-muted/50 rounded-lg overflow-hidden">
                    <svg className="w-full h-full">
                        {/* Edges */}
                        {currentStep.edges.map((edge, index) => {
                            const sourceNode = nodeMap.get(edge.source);
                            const targetNode = nodeMap.get(edge.target);
                            if (!sourceNode || !targetNode) return null;
                            
                            const colorClasses: {[key: string]: string} = {
                                active: "stroke-primary",
                                traversed: "stroke-primary/70",
                                included: "stroke-accent stroke-[3]",
                                discarded: "stroke-destructive/50 stroke-dasharray-5",
                                path: "stroke-accent stroke-[3]",
                                default: "stroke-border",
                            }

                            return (
                                <g key={`${edge.source}-${edge.target}-${index}`}>
                                    <line
                                        x1={sourceNode.x} y1={sourceNode.y}
                                        x2={targetNode.x} y2={targetNode.y}
                                        className={cn("transition-all", colorClasses[edge.color || 'default'] || 'stroke-border')}
                                        strokeWidth={edge.color === 'path' || edge.color === 'included' ? 3 : 2}
                                    />
                                    {edge.weight !== undefined && (
                                        <text
                                            x={(sourceNode.x + targetNode.x) / 2}
                                            y={(sourceNode.y + targetNode.y) / 2}
                                            dy={-4}
                                            textAnchor="middle"
                                            className="fill-muted-foreground text-xs"
                                        >
                                            {edge.weight}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    {currentStep.nodes.map(node => {
                         const colorClasses: {[key: string]: string} = {
                            active: "bg-primary text-primary-foreground border-primary",
                            visited: "bg-primary/30 border-primary/50",
                            path: "bg-accent text-accent-foreground border-accent",
                            default: "bg-card border-border",
                         }
                        return (
                            <div
                                key={node.id}
                                className={cn("absolute w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all transform -translate-x-1/2 -translate-y-1/2 border-2", colorClasses[node.color || 'default'] || 'bg-card border-border')}
                                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                            >
                                <span className="text-sm font-bold">{node.id}</span>
                                {node.distance !== undefined && (
                                    <span className="text-xs">{node.distance === 'Infinity' || node.distance === Infinity ? '∞' : node.distance}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
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
                 <p className="text-sm text-muted-foreground">{currentStep.stepDescription}</p>
            </div>
        </div>
    );
}

function FloydWarshallVisualizer({ step }: { step: VisualizationStep }) {
    const nodeIds = useMemo(() => step.distanceMatrix![0].slice(1).map(String), [step]);
    
    return (
        <div className="space-y-4">
            <h4 className="font-semibold">Distance Matrix (k = {step.highlight?.k || 'start'})</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border border-border bg-muted/50"></th>
                            {nodeIds.map(id => <th key={id} className="p-2 border border-border bg-muted/50">{id}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {step.distanceMatrix!.slice(1).map((row, i) => (
                            <tr key={i}>
                                <th className="p-2 border border-border bg-muted/50">{nodeIds[i]}</th>
                                {row.slice(1).map((dist, j) => {
                                    const isHighlighted = step.highlight && step.highlight.i === nodeIds[i] && step.highlight.j === nodeIds[j];
                                    const isK = step.highlight && (step.highlight.k === nodeIds[i] || step.highlight.k === nodeIds[j]);
                                    return (
                                        <td key={j} className={cn("p-2 border border-border", isHighlighted ? "bg-primary/30" : isK ? "bg-accent/20" : "")}>
                                            {dist === 'Infinity' || dist === Infinity ? '∞' : String(dist)}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


export default function GraphSimulationsPage() {
  const [isPending, startTransition] = useTransition();
  const [simulationData, setSimulationData] = useState<GraphSimulationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithm: "Dijkstra's",
      graphData: defaultGraphData,
      startNode: "A",
      endNode: "E",
    },
  });

  const algorithm = form.watch("algorithm");
  const selectedAlgorithm = ALGORITHMS.find(a => a.value === algorithm);

  const onSubmit = (values: FormValues) => {
    setError(null);
    setSimulationData(null);
    startTransition(async () => {
      const result = await handleGraphSimulation({
        algorithmName: values.algorithm,
        graphData: values.graphData,
        startNode: values.startNode,
        endNode: values.endNode,
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
        return null;
    }
  }, [simulationData]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="sticky top-10">
            <CardHeader>
              <CardTitle>Graph Simulator</CardTitle>
              <CardDescription>Visualize graph algorithms step by step.</CardDescription>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="graphData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graph Data (JSON)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter graph data..." {...field} rows={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedAlgorithm?.needsStart && (
                    <FormField
                      control={form.control}
                      name="startNode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Node</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {selectedAlgorithm?.needsEnd && (
                    <FormField
                      control={form.control}
                      name="endNode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Node</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., F" {...field} />
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
                  Your graph simulation will appear here.
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
    <Skeleton className="h-[550px] w-full" />
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


function SimulationDisplay({ data, steps }: { data: GraphSimulationOutput, steps: VisualizationStep[] }) {
  return (
    <div className="space-y-6">
       <div className="space-y-4">
         <h3 className="font-semibold text-lg">Visualization</h3>
         <GraphVisualizer steps={steps} />
       </div>
       <div>
         <h3 className="font-semibold text-lg mb-2">Description</h3>
         <p className="text-muted-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">{data.simulationDescription}</p>
       </div>
    </div>
  );
}
