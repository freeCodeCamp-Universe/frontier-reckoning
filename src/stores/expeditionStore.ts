import { create } from 'zustand';

type ExpeditionState = {
  started: boolean;
  startExpedition: () => void;
};

export const useExpeditionStore = create<ExpeditionState>((set) => ({
  started: false,
  startExpedition: () => set({ started: true }),
}));
