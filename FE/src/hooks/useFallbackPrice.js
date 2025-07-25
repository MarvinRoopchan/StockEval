import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLatestPrice } from '../services/api';
import { usePriceStore } from '../store/priceStore';

export function useFallbackPrice(ticker, isWebSocketConnected) {
  const { setPrice } = usePriceStore();
  const intervalRef = useRef(null);

  // Only fetch when WebSocket is disconnected and we have a ticker
  const shouldFetch = Boolean(ticker && !isWebSocketConnected);

  const { data } = useQuery({
    queryKey: ['price', ticker],
    queryFn: () => getLatestPrice(ticker),
    enabled: shouldFetch,
    refetchInterval: shouldFetch ? 5000 : false, // 5 seconds
    refetchIntervalInBackground: true,
    retry: 3,
    onSuccess: (data) => {
      if (data && data.price) {
        setPrice(ticker, {
          price: data.price,
          timestamp: data.timestamp || new Date().toISOString(),
          size: data.size
        });
      }
    }
  });

  return data;
}