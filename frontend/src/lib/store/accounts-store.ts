import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { accountsApi, portfolioApi } from '@/lib/api/accounts';
import { connectorsApi } from '@/lib/api/connectors';
import {
  PortfolioStateResponse,
  AccountsDistributionResponse,
  PortfolioDistributionResponse,
} from '@/lib/types';

interface AccountsState {
  // Account list state
  accounts: string[];
  loadingAccounts: boolean;
  accountsError: string | null;

  // Selected account state
  selectedAccount: string | null;
  accountCredentials: string[];
  loadingCredentials: boolean;
  credentialsError: string | null;

  // Available connectors
  availableConnectors: string[];
  loadingConnectors: boolean;
  connectorsError: string | null;

  // Portfolio data
  portfolioState: PortfolioStateResponse | null;
  portfolioDistribution: PortfolioDistributionResponse | null;
  accountsDistribution: AccountsDistributionResponse | null;
  loadingPortfolio: boolean;
  portfolioError: string | null;

  // Actions
  fetchAccounts: () => Promise<void>;
  fetchAccountCredentials: (accountName: string) => Promise<void>;
  fetchAvailableConnectors: () => Promise<void>;
  fetchPortfolioData: (accounts?: string[]) => Promise<void>;

  addAccount: (accountName: string) => Promise<void>;
  deleteAccount: (accountName: string) => Promise<void>;
  addCredential: (
    accountName: string,
    connectorName: string,
    credentials: Record<string, string>
  ) => Promise<void>;
  deleteCredential: (
    accountName: string,
    connectorName: string
  ) => Promise<void>;

  setSelectedAccount: (accountName: string | null) => void;
  clearErrors: () => void;
}

export const useAccountsStore = create<AccountsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    accounts: [],
    loadingAccounts: false,
    accountsError: null,

    selectedAccount: null,
    accountCredentials: [],
    loadingCredentials: false,
    credentialsError: null,

    availableConnectors: [],
    loadingConnectors: false,
    connectorsError: null,

    portfolioState: null,
    portfolioDistribution: null,
    accountsDistribution: null,
    loadingPortfolio: false,
    portfolioError: null,

    // Actions
    fetchAccounts: async () => {
      // Only make API calls on client side
      if (typeof window === 'undefined') {
        console.log('[Store] Skipping fetchAccounts - running on server side');
        return;
      }

      set({ loadingAccounts: true, accountsError: null });
      try {
        console.log('[Store] Fetching accounts...');
        const accounts = await accountsApi.listAccounts();
        console.log('[Store] Accounts fetched successfully:', accounts);
        set({ accounts, loadingAccounts: false });
      } catch (error) {
        console.error('[Store] Error fetching accounts:', error);
        set({
          accountsError:
            error instanceof Error ? error.message : 'Failed to fetch accounts',
          loadingAccounts: false,
        });
      }
    },

    fetchAccountCredentials: async (accountName: string) => {
      // Only make API calls on client side
      if (typeof window === 'undefined') {
        console.log(
          '[Store] Skipping fetchAccountCredentials - running on server side'
        );
        return;
      }

      set({ loadingCredentials: true, credentialsError: null });
      try {
        console.log('[Store] Fetching account credentials for:', accountName);
        const credentials = await accountsApi.getAccountCredentials(
          accountName
        );
        console.log('[Store] Account credentials fetched successfully');
        set({ accountCredentials: credentials, loadingCredentials: false });
      } catch (error) {
        set({
          credentialsError:
            error instanceof Error
              ? error.message
              : 'Failed to fetch credentials',
          loadingCredentials: false,
        });
      }
    },

    fetchAvailableConnectors: async () => {
      // Only make API calls on client side
      if (typeof window === 'undefined') {
        console.log(
          '[Store] Skipping fetchAvailableConnectors - running on server side'
        );
        return;
      }

      set({ loadingConnectors: true, connectorsError: null });
      try {
        console.log('[Store] Fetching available connectors...');
        const connectors = await connectorsApi.getAvailableConnectors();
        console.log(
          '[Store] Connectors fetched successfully:',
          connectors?.length || 0,
          'connectors'
        );
        set({
          availableConnectors: connectors || [],
          loadingConnectors: false,
        });
      } catch (error) {
        console.error('[Store] Error fetching connectors:', error);
        set({
          connectorsError:
            error instanceof Error
              ? error.message
              : 'Failed to fetch connectors',
          loadingConnectors: false,
        });
      }
    },

    fetchPortfolioData: async (accounts?: string[]) => {
      // Only make API calls on client side
      if (typeof window === 'undefined') {
        console.log(
          '[Store] Skipping fetchPortfolioData - running on server side'
        );
        return;
      }

      set({ loadingPortfolio: true, portfolioError: null });
      try {
        console.log('[Store] Fetching portfolio data for accounts:', accounts);
        const filterRequest = accounts ? { accounts } : undefined;

        const [portfolioState, portfolioDistribution, accountsDistribution] =
          await Promise.all([
            portfolioApi.getPortfolioState(filterRequest),
            portfolioApi.getPortfolioDistribution(filterRequest),
            portfolioApi.getAccountsDistribution(filterRequest),
          ]);

        set({
          portfolioState,
          portfolioDistribution,
          accountsDistribution,
          loadingPortfolio: false,
        });
      } catch (error) {
        set({
          portfolioError:
            error instanceof Error
              ? error.message
              : 'Failed to fetch portfolio data',
          loadingPortfolio: false,
        });
      }
    },

    addAccount: async (accountName: string) => {
      try {
        await accountsApi.addAccount(accountName);
        // Refresh accounts list
        await get().fetchAccounts();
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Failed to add account'
        );
      }
    },

    deleteAccount: async (accountName: string) => {
      try {
        await accountsApi.deleteAccount(accountName);
        // Refresh accounts list and clear selected account if it was deleted
        const { selectedAccount } = get();
        if (selectedAccount === accountName) {
          set({ selectedAccount: null, accountCredentials: [] });
        }
        await get().fetchAccounts();
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Failed to delete account'
        );
      }
    },

    addCredential: async (
      accountName: string,
      connectorName: string,
      credentials: Record<string, string>
    ) => {
      try {
        await accountsApi.addCredential(
          accountName,
          connectorName,
          credentials
        );
        // Refresh credentials for the current account
        if (get().selectedAccount === accountName) {
          await get().fetchAccountCredentials(accountName);
        }
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Failed to add credential'
        );
      }
    },

    deleteCredential: async (accountName: string, connectorName: string) => {
      try {
        await accountsApi.deleteCredential(accountName, connectorName);
        // Refresh credentials for the current account
        if (get().selectedAccount === accountName) {
          await get().fetchAccountCredentials(accountName);
        }
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Failed to delete credential'
        );
      }
    },

    setSelectedAccount: (accountName: string | null) => {
      set({ selectedAccount: accountName, accountCredentials: [] });
      if (accountName) {
        get().fetchAccountCredentials(accountName);
      }
    },

    clearErrors: () => {
      set({
        accountsError: null,
        credentialsError: null,
        connectorsError: null,
        portfolioError: null,
      });
    },
  }))
);

// Auto-fetch accounts and connectors on store initialization
// This will now use Basic Auth credentials from health monitor if available
useAccountsStore.getState().fetchAccounts();
useAccountsStore.getState().fetchAvailableConnectors();
