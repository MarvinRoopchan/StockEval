import { TrendingUp } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fair Value Stock Analyzer</h1>
            <p className="text-sm text-muted-foreground">Real-time stock valuation and analysis</p>
          </div>
        </div>
      </div>
    </header>
  );
}