import { apiClient } from './client';
import {
  PortfolioStateResponse,
  PortfolioHistoryResponse,
  PortfolioDistributionResponse,
  AccountsDistributionResponse,
} from '@/lib/types';

// API Endpoints for account management
export const accountsApi = {
  // Get list of all accounts
  async listAccounts(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/accounts/');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  },

  // Get credentials for a specific account
  async getAccountCredentials(accountName: string): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `/accounts/${accountName}/credentials`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch credentials for ${accountName}:`, error);
      return [];
    }
  },

  // Add a new account
  async addAccount(accountName: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/accounts/add-account',
      {
        account_name: accountName,
      }
    );
    return response.data;
  },

  // Delete an account
  async deleteAccount(accountName: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/accounts/delete-account',
      {
        account_name: accountName,
      }
    );
    return response.data;
  },

  // Add credentials for a specific account and connector
  async addCredential(
    accountName: string,
    connectorName: string,
    credentials: Record<string, string>
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/accounts/add-credential/${accountName}/${connectorName}`,
      credentials
    );
    return response.data;
  },

  // Delete credentials for a specific account and connector
  async deleteCredential(
    accountName: string,
    connectorName: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/accounts/delete-credential/${accountName}/${connectorName}`
    );
    return response.data;
  },
};

// Portfolio API endpoints for portfolio-related data
export const portfolioApi = {
  // Get current portfolio state
  async getPortfolioState(filterRequest?: {
    accounts?: string[];
    connectors?: string[];
    tokens?: string[];
  }): Promise<PortfolioStateResponse> {
    try {
      const response = await apiClient.post<PortfolioStateResponse>(
        '/portfolio/state',
        filterRequest || {}
      );
      return (
        response.data || {
          accounts: {},
          total_balance: 0,
          total_pnl: 0,
          total_pnl_percentage: 0,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to fetch portfolio state:', error);
      return {
        accounts: {},
        total_balance: 0,
        total_pnl: 0,
        total_pnl_percentage: 0,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get portfolio history with pagination
  async getPortfolioHistory(filterRequest?: {
    accounts?: string[];
    connectors?: string[];
    tokens?: string[];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<PortfolioHistoryResponse> {
    try {
      const response = await apiClient.post<PortfolioHistoryResponse>(
        '/portfolio/history',
        {
          ...filterRequest,
          startDate: filterRequest?.startDate?.toISOString(),
          endDate: filterRequest?.endDate?.toISOString(),
        }
      );
      return response.data || { data: [] };
    } catch (error) {
      console.error('Failed to fetch portfolio history:', error);
      return { data: [] };
    }
  },

  // Get portfolio distribution by tokens
  async getPortfolioDistribution(filterRequest?: {
    accounts?: string[];
    connectors?: string[];
    tokens?: string[];
  }): Promise<PortfolioDistributionResponse> {
    try {
      const response = await apiClient.post<PortfolioDistributionResponse>(
        '/portfolio/distribution',
        filterRequest || {}
      );
      return (
        response.data || {
          tokens: {},
          total_value: 0,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to fetch portfolio distribution:', error);
      return {
        tokens: {},
        total_value: 0,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get accounts distribution
  async getAccountsDistribution(filterRequest?: {
    accounts?: string[];
    connectors?: string[];
    tokens?: string[];
  }): Promise<AccountsDistributionResponse> {
    try {
      const response = await apiClient.post<AccountsDistributionResponse>(
        '/portfolio/accounts-distribution',
        filterRequest || {}
      );
      return (
        response.data || {
          accounts: {},
          total_value: 0,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to fetch accounts distribution:', error);
      return {
        accounts: {},
        total_value: 0,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
