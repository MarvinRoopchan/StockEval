import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FiveYearChart({ data }) {
  const chartRef = useRef(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="bg-surface border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Five Year Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No historical data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract years and metrics from the data
  const years = data.map(item => item.year || 'Unknown');
  const metrics = Object.keys(data[0]).filter(key => key !== 'year');

  // Create datasets for each metric
  const datasets = metrics.slice(0, 3).map((metric, index) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)', // blue
      'rgba(16, 185, 129, 0.8)', // green
      'rgba(245, 158, 11, 0.8)',  // amber
    ];

    const borderColors = [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)', 
      'rgba(245, 158, 11, 1)',
    ];

    return {
      label: metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: data.map(item => item[metric] || 0),
      backgroundColor: colors[index],
      borderColor: borderColors[index],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: years,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(148, 163, 184)', // slate-400
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
        titleColor: 'rgb(248, 250, 252)', // slate-50
        bodyColor: 'rgb(226, 232, 240)', // slate-200
        borderColor: 'rgb(71, 85, 105)', // slate-600
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const metric = context.dataset.label.toLowerCase();
            
            if (metric.includes('ratio') || metric.includes('margin')) {
              return `${context.dataset.label}: ${(value * 100).toFixed(1)}%`;
            }
            
            if (metric.includes('revenue') || metric.includes('earnings')) {
              return `${context.dataset.label}: $${(value / 1e9).toFixed(2)}B`;
            }
            
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)', // slate-400
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with opacity
        },
      },
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)', // slate-400
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with opacity
        },
      },
    },
  };

  return (
    <Card className="bg-surface border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Five Year Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}