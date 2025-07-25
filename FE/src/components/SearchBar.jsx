import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SearchBar({ onSearch, isLoading }) {
  const [ticker, setTicker] = useState('');
  
  console.log('SearchBar render:', { isLoading, ticker });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTicker = ticker.trim().toUpperCase();
    if (cleanTicker && !isLoading) {
      onSearch(cleanTicker);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter stock ticker (e.g., AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              disabled={isLoading}
              className="pl-10 bg-surface border-border focus:ring-ring focus:border-ring"
              aria-label="Stock ticker"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!ticker.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </form>
    </div>
  );
}