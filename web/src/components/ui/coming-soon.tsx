import React from 'react';
import { Rocket, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ 
  title, 
  description = "We're working hard to bring you this feature. Check back soon for updates!" 
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-3xl border border-primary/20 shadow-2xl relative">
          <Rocket className="w-16 h-16 text-primary drop-shadow-md" strokeWidth={1.5} />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        {title}
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-[500px] mb-10 leading-relaxed">
        {description}
      </p>
      
      <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
