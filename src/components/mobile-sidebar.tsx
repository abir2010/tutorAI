'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SquareCode, GitFork, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'Tutor', href: '/', icon: Home },
  { name: 'Array', href: '/simulations/array', icon: SquareCode },
  { name: 'Graph', href: '/simulations/graph', icon: GitFork },
  { name: 'Tree', href: '/simulations/tree', icon: Binary },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 z-50 w-full h-16 bg-card border-t">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon
              className="w-6 h-6 mb-1 group-hover:text-foreground"
              aria-hidden="true"
            />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
