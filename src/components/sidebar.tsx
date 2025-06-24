'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Home, SquareCode, GitFork, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'AI Tutor', href: '/', icon: Home },
  { name: 'Array Simulations', href: '/simulations/array', icon: SquareCode },
  { name: 'Graph Simulations', href: '/simulations/graph', icon: GitFork },
  { name: 'Tree Simulations', href: '/simulations/tree', icon: Binary },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 border-r bg-card/50">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">TutorAI</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {links.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={cn(
                          pathname === item.href ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
