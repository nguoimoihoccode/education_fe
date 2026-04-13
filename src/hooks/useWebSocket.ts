import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
export interface Price {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  [key: string]: any;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

interface UseWebSocketOptions {
  symbols: string[];
  enabled?: boolean;
}

interface ChartUpdate {
  symbol: string;
  period: string;
  interval: string;
  dataPoint: {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
  fullData?: Array<{
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export const useWebSocket = ({ symbols, enabled = true }: UseWebSocketOptions) => {
  const [prices, setPrices] = useState<Map<string, Price>>(new Map());
  const [connected, setConnected] = useState(false);
  const [chartUpdates, setChartUpdates] = useState<Map<string, ChartUpdate>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  const subscribeToChart = useCallback((symbol: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe-chart', { symbol });
    }
  }, [connected]);

  const unsubscribeFromChart = useCallback((symbol: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('unsubscribe-chart', { symbol });
    }
  }, [connected]);

  useEffect(() => {
    if (!enabled || symbols.length === 0) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token found for WebSocket connection');
      return;
    }

    const socket = io(`${WS_URL}/prices`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('WebSocket connected');
      
      // Subscribe to symbols
      socket.emit('subscribe', { symbols });
      
      // Subscribe to chart updates for all symbols
      symbols.forEach(symbol => {
        socket.emit('subscribe-chart', { symbol });
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    socket.on('price-update', (data: Price & { symbol: string }) => {
      setPrices((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.symbol, data);
        return newMap;
      });
    });

    socket.on('chart-update', (data: ChartUpdate) => {
      setChartUpdates((prev) => {
        const newMap = new Map(prev);
        // Store by symbol and period-interval key
        const key = `${data.symbol}-${data.period}-${data.interval}`;
        newMap.set(key, data);
        return newMap;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', { symbols });
        symbols.forEach(symbol => {
          socketRef.current?.emit('unsubscribe-chart', { symbol });
        });
        socketRef.current.disconnect();
      }
    };
  }, [symbols, enabled]);

  return { 
    prices, 
    connected, 
    chartUpdates,
    subscribeToChart,
    unsubscribeFromChart,
  };
};

