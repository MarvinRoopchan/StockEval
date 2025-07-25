import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { requestValuation, checkValuationStatus } from '../services/api';
import { useToast } from './use-toast';

export function useValuation() {
  const [jobId, setJobId] = useState(null);
  const [ticker, setTicker] = useState(null);
  const { toast } = useToast();

  // Poll for valuation results
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['valuation', jobId],
    queryFn: () => checkValuationStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling when ready or failed
      if (data?.status === 'ready' || data?.status === 'failed') {
        return false;
      }
      return 1000; // Poll every 1 second
    },
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (error?.status === 0 && failureCount < 3) {
        return true;
      }
      return false;
    },
    onError: (error) => {
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze stock",
        variant: "destructive"
      });
    }
  });

  const startValuation = useCallback(async (newTicker) => {
    try {
      setTicker(newTicker);
      setJobId(null);

      const response = await requestValuation(newTicker);
      
      if (response.job_id) {
        setJobId(response.job_id);
        toast({
          title: "Analysis Started",
          description: `Analyzing ${newTicker}...`,
        });
      } else {
        throw new Error('No job ID received');
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to start analysis",
        variant: "destructive"
      });
    }
  }, [toast]);

  const retry = useCallback(() => {
    if (ticker) {
      startValuation(ticker);
    }
  }, [ticker, startValuation]);

  // Check if we have completed data
  const isReady = data?.status === 'ready';
  const isFailed = data?.status === 'failed';
  const valuationData = isReady ? data.data : null;

  // Handle timeout (2 minutes)
  const startTime = typeof window !== 'undefined' ? (window.valuationStartTime || 0) : 0;
  const isTimeout = isLoading && jobId && startTime > 0 && Date.now() - startTime > 120000;

  console.log('Valuation hook state:', { 
    jobId, 
    isLoading, 
    isReady, 
    isFailed, 
    isTimeout,
    dataStatus: data?.status 
  });

  return {
    data: valuationData,
    isLoading: isLoading && !isReady && !isFailed && !isTimeout,
    error: isFailed ? (data?.error || 'Analysis failed') : 
           isTimeout ? 'Data unavailable. Try again later.' : 
           error ? error.message : null,
    ticker,
    startValuation,
    retry
  };
}