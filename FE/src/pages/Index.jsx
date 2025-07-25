import { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MainContent from '../components/MainContent';
import { useValuation } from '../hooks/useValuation';
import { usePriceStream } from '../hooks/usePriceStream';
import { useFallbackPrice } from '../hooks/useFallbackPrice';
import { usePriceStore } from '../store/priceStore';

const Index = () => {
  const { data, isLoading, error, ticker, startValuation, retry } = useValuation();
  const { connected } = usePriceStream(ticker);
  
  // Use fallback price fetching when WebSocket is disconnected
  useFallbackPrice(ticker, connected);

  // Track valuation start time for timeout handling
  const handleSearch = (newTicker) => {
    // Store start time globally for timeout handling
    if (typeof window !== 'undefined') {
      window.valuationStartTime = Date.now();
    }
    startValuation(newTicker);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      <MainContent 
        ticker={ticker}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
      />
    </div>
  );
};

export default Index;