import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitFork } from "lucide-react";

export default function GraphSimulationsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <GitFork className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Graph Simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is coming soon! Visualize algorithms like Breadth-First Search and Depth-First Search on graphs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
