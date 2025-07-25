import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetricsTable({ metrics }) {
  if (!metrics) return null;

  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '—';
    
    // Format different types of metrics
    if (key.toLowerCase().includes('ratio') || key.toLowerCase().includes('margin')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('earnings')) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    
    return value.toString();
  };

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="bg-surface border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Trailing Twelve Months Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(metrics).map(([key, value], index) => (
            <div 
              key={key} 
              className={`flex justify-between items-center py-2 ${
                index !== Object.entries(metrics).length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-sm font-medium text-foreground">
                {formatKey(key)}
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {formatValue(value, key)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}