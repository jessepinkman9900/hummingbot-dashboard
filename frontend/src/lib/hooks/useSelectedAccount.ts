import { useAccountsUIStore } from '@/lib/store/accounts-ui-store';

/**
 * Hook to get the currently selected account name
 * Returns 'master_account' as fallback if no account is selected
 */
export function useSelectedAccount(): string {
  const selectedAccount = useAccountsUIStore((state) => state.selectedAccount);
  return selectedAccount || 'master_account';
}

/**
 * Hook to get the account selection state and actions
 */
export function useAccountSelection() {
  const selectedAccount = useAccountsUIStore((state) => state.selectedAccount);
  const setSelectedAccount = useAccountsUIStore(
    (state) => state.setSelectedAccount
  );

  return {
    selectedAccount: selectedAccount || 'master_account',
    setSelectedAccount,
  };
}
