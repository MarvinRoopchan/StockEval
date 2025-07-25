import { useEffect, useRef } from 'react';
import { usePriceStore } from '../store/priceStore';
import { useToast } from './use-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function usePriceStream(ticker) {
  const { setPrice, setConnected, setWebSocket, websocket } = usePriceStore();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!ticker) return;

    let ws = null;
    
    const connect = () => {
      try {
        ws = new WebSocket(`${WS_URL}/ws/prices/stream?tickers=${ticker}`);
        setWebSocket(ws);

        ws.onopen = () => {
          console.log(`WebSocket connected for ${ticker}`);
          setConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.ticker && data.price) {
              setPrice(data.ticker, {
                price: data.price,
                timestamp: data.t || new Date().toISOString(),
                size: data.size
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log(`WebSocket closed for ${ticker}:`, event.code, event.reason);
          setConnected(false);
          setWebSocket(null);

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current += 1;
              connect();
            }, delay);
          } else {
            toast({
              title: "Connection Lost",
              description: "Unable to connect to live prices. Retrying...",
              variant: "destructive"
            });
          }
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${ticker}:`, error);
          toast({
            title: "Connection Error",
            description: "Live price connection failed. Using fallback.",
            variant: "destructive"
          });
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      setConnected(false);
      setWebSocket(null);
    };
  }, [ticker, setPrice, setConnected, setWebSocket, toast]);

  return { connected: usePriceStore(state => state.connected) };
}