'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const routes = [
  { href: '/', label: 'Home' },
  { href: '/base', label: 'Base Chat' },
  { href: '/chapters-demo', label: 'Chapters' },
  { href: '/chat-file', label: 'Chat File' },
  { href: '/image-generation', label: 'Image Gen' },
  { href: '/prompt-input', label: 'Prompt Input' },
  { href: '/quiz-agent', label: 'Quiz Agent' },
  { href: '/quiz-chat', label: 'Quiz Chat' },
  { href: '/stream-object', label: 'Stream Object' },
  { href: '/use-chat-streaming-tool-calls', label: 'Tool Calls' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-12 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap",
                  pathname === route.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}