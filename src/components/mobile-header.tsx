'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileHeader() {
    const pathname = usePathname();
    const isSubPage = pathname !== '/';

    return (
        <header className="lg:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 sm:px-6 flex h-14 items-center">
                <div className="flex items-center gap-2">
                    {isSubPage && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Back to Home</span>
                            </Link>
                        </Button>
                    )}
                     <Link href="/" className="flex items-center gap-2">
                         <BrainCircuit className="h-7 w-7 text-primary" />
                         <span className="text-lg font-bold text-foreground">TutorAI</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
