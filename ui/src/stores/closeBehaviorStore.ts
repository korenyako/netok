import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CloseBehavior = 'minimize_to_tray' | 'close_app';

interface CloseBehaviorState {
  closeBehavior: CloseBehavior;
  setCloseBehavior: (behavior: CloseBehavior) => void;
}

export const useCloseBehaviorStore = create<CloseBehaviorState>()(
  persist(
    (set) => ({
      closeBehavior: 'minimize_to_tray',
      setCloseBehavior: (behavior: CloseBehavior) => set({ closeBehavior: behavior }),
    }),
    {
      name: 'close-behavior-storage',
    }
  )
);
