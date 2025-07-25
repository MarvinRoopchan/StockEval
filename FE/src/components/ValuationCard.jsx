import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePriceStore } from '../store/priceStore';

export default function ValuationCard({ valuation, ticker }) {
  const getPrice = usePriceStore(state => state.getPrice);
  const lastUpdate = usePriceStore(state => state.lastUpdate);
  const connected = usePriceStore(state => state.connected);
  const [animatePrice, setAnimatePrice] = useState(false);

  const priceData = getPrice(ticker);
  const currentPrice = priceData?.price || null;
  const fairValue = valuation?.fair_value;

  // Animate price updates
  useEffect(() => {
    if (lastUpdate) {
      setAnimatePrice(true);
      const timer = setTimeout(() => setAnimatePrice(false), 100);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  const getValuationStatus = () => {
    if (!currentPrice || !fairValue) return null;
    
    const difference = ((currentPrice - fairValue) / fairValue) * 100;
    const isUndervalued = currentPrice < fairValue;
    
    return {
      isUndervalued,
      difference: Math.abs(difference),
      text: isUndervalued ? 'Undervalued' : 'Overvalued'
    };
  };

  const status = getValuationStatus();

  return (
    <Card className="bg-surface border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {ticker} Valuation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Fair Value</p>
            <p className="text-3xl font-bold text-foreground">
              {fairValue ? `$${fairValue.toFixed(2)}` : '—'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Current Price</p>
              {connected && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                     title="Live price feed connected" />
              )}
            </div>
            <p className={`text-3xl font-bold text-foreground transition-opacity duration-100 ${
              animatePrice ? 'animate-price-pulse' : ''
            }`} aria-live="polite">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : '—'}
            </p>
            {priceData?.timestamp && (
              <p className="text-xs text-muted-foreground">
                Updated: {new Date(priceData.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {status && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Badge 
                variant={status.isUndervalued ? "default" : "destructive"}
                className={status.isUndervalued ? 
                  "bg-undervalued text-undervalued-foreground hover:bg-undervalued/90" : 
                  "bg-overvalued text-overvalued-foreground hover:bg-overvalued/90"
                }
              >
                {status.text}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {status.difference.toFixed(1)}% {status.isUndervalued ? 'below' : 'above'} fair value
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}