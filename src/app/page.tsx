import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Cpu, Sigma } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-grid-white/[0.05] relative flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
              Unlock Your Potential with TutorAI
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Your personal AI-powered guide to mastering complex subjects. Get step-by-step explanations, visualize algorithms, and bring code to life.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/tutor">
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/simulations">Explore Simulations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline mb-12">
            Learning for Every Discipline
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Sigma className="h-8 w-8 text-primary" />}
              title="Mathematics"
              description="From algebra to calculus, get clear, step-by-step solutions and explanations for any math problem."
            />
            <FeatureCard
              icon={<Code className="h-8 w-8 text-primary" />}
              title="Programming"
              description="Understand programming concepts, debug code, and learn new languages with an interactive AI tutor."
            />
            <FeatureCard
              icon={<Cpu className="h-8 w-8 text-primary" />}
              title="Algorithm Simulations"
              description="Visualize complex algorithms like sorting and graph traversal to build a deeper, intuitive understanding."
            />
          </div>
        </div>
      </section>
       <section className="w-full py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Interactive Learning, Reimagined</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Don't just read about concepts, experience them. Our interactive platform allows you to ask questions with your voice, see data come to life in dynamic graphs, and understand complex processes.
              </p>
               <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 pt-1"><ArrowRight className="w-5 h-5 text-accent" /></div>
                  <p className="ml-3 text-muted-foreground">Step-by-step AI-driven explanations for any topic.</p>
                </li>
                <li className="flex items-start">
                   <div className="flex-shrink-0 pt-1"><ArrowRight className="w-5 h-5 text-accent" /></div>
                  <p className="ml-3 text-muted-foreground">Voice input for convenient, hands-free questioning.</p>
                </li>
                 <li className="flex items-start">
                   <div className="flex-shrink-0 pt-1"><ArrowRight className="w-5 h-5 text-accent" /></div>
                   <p className="ml-3 text-muted-foreground">Dynamic visualizations for algorithms and data structures.</p>
                </li>
              </ul>
            </div>
             <div>
              <Image 
                src="https://placehold.co/600x400.png"
                alt="A student interacting with a futuristic learning interface."
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="learning education"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card border-border/60 hover:border-primary/50 hover:bg-card/80 transition-all transform hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center gap-4">
          {icon}
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
