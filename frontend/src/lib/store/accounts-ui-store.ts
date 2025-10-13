import { create } from 'zustand';

interface AccountsUIState {
  // UI state only - data is managed by React Query
  selectedAccount: string | null;

  // Actions
  setSelectedAccount: (accountName: string | null) => void;
}

export const useAccountsUIStore = create<AccountsUIState>()((set) => ({
  // Initial state
  selectedAccount: null,

  // Actions
  setSelectedAccount: (accountName: string | null) => {
    set({ selectedAccount: accountName });
  },
}));

// Persistence helper for selected account
if (typeof window !== 'undefined') {
  // Initialize from localStorage
  const savedAccount = localStorage.getItem('selectedAccount');
  if (savedAccount) {
    useAccountsUIStore.getState().setSelectedAccount(savedAccount);
  }

  // Persist selected account preference
  useAccountsUIStore.subscribe((state) => {
    const selectedAccount = state.selectedAccount;
    if (selectedAccount) {
      localStorage.setItem('selectedAccount', selectedAccount);
    } else {
      localStorage.removeItem('selectedAccount');
    }
  });
}
