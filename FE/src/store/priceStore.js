import { create } from 'zustand';

export const usePriceStore = create((set, get) => ({
  prices: {},
  lastUpdate: null,
  connected: false,
  websocket: null,

  setPrice: (ticker, price) => set((state) => ({
    prices: { ...state.prices, [ticker]: price },
    lastUpdate: new Date()
  })),

  setConnected: (connected) => set({ connected }),

  setWebSocket: (websocket) => set({ websocket }),

  getPrice: (ticker) => {
    const state = get();
    return state.prices[ticker] || null;
  }
}));