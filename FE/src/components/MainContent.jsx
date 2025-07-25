import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ValuationCard from './ValuationCard';
import MetricsTable from './MetricsTable';
import FiveYearChart from './FiveYearChart';

export default function MainContent({ 
  ticker, 
  data, 
  isLoading, 
  error, 
  onRetry 
}) {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-surface border-border shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analyzing {ticker}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Calculating fair value using comprehensive financial analysis. 
              This may take up to 90 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-surface border-border shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analysis Failed
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {error}
            </p>
            <Button 
              onClick={onRetry}
              variant="outline" 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-surface border-border shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Analyze
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter a stock ticker above to get started with fair value analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ValuationCard valuation={data} ticker={ticker} />
        </div>
        
        <div>
          <MetricsTable metrics={data.ttm} />
        </div>
        
        <div>
          <FiveYearChart data={data.five_year} />
        </div>
      </div>
    </div>
  );
}