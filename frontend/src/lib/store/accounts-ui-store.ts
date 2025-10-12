import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AccountsUIState {
  // UI state only - data is managed by React Query
  selectedAccount: string | null;

  // Actions
  setSelectedAccount: (accountName: string | null) => void;
}

export const useAccountsUIStore = create<AccountsUIState>()(
  subscribeWithSelector((set) => ({
    // Initial state
    selectedAccount: null,

    // Actions
    setSelectedAccount: (accountName: string | null) => {
      set({ selectedAccount: accountName });
    },
  }))
);
