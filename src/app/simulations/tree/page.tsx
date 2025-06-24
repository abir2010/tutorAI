import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Binary } from "lucide-react";

export default function TreeSimulationsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Binary className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Tree Simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is coming soon! Visualize tree traversal algorithms like In-order, Pre-order, and Post-order.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
