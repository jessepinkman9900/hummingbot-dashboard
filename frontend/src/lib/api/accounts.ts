import { apiClient } from './client';
import {
  PortfolioHistoryResponse,
  PortfolioDistributionResponse,
  AccountsDistributionResponse,
} from '@/lib/types';

// API Endpoints for account management
export const accountsApi = {
  // Get list of all accounts
  async listAccounts(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('accounts/');
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
        `accounts/${accountName}/credentials`
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
      `accounts/add-account?account_name=${encodeURIComponent(accountName)}`
    );
    return response.data;
  },

  // Delete an account
  async deleteAccount(accountName: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `accounts/delete-account?account_name=${encodeURIComponent(accountName)}`
    );
    return response.data;
  },

  // Add credentials for a specific account and connector
  async addCredential(
    accountName: string,
    connectorName: string,
    credentials: Record<string, string>
  ): Promise<{ message: string }> {
    // Process credentials to handle newline characters properly
    const processedCredentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(credentials)) {
      // Replace escaped newlines with actual newlines
      processedCredentials[key] = value.replace(/\\n/g, '\n');
    }

    const response = await apiClient.post<{ message: string }>(
      `/accounts/add-credential/${accountName}/${connectorName}`,
      processedCredentials
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
  }): Promise<any> {
    try {
      // Transform parameters to match API expectations
      const requestBody: any = {};
      if (filterRequest?.accounts && filterRequest.accounts.length > 0) {
        requestBody.account_names = filterRequest.accounts;
      }
      if (filterRequest?.connectors && filterRequest.connectors.length > 0) {
        requestBody.connector_names = filterRequest.connectors;
      }
      if (filterRequest?.tokens && filterRequest.tokens.length > 0) {
        requestBody.token_names = filterRequest.tokens;
      }

      const response = await apiClient.post<any>(
        '/portfolio/state',
        requestBody
      );
      return response.data || {};
    } catch (error) {
      console.error('Failed to fetch portfolio state:', error);
      return {};
    }
  },

  // Get portfolio history with pagination
  async getPortfolioHistory(filterRequest?: {
    accounts?: string[];
    connectors?: string[];
    tokens?: string[];
    startTime?: Date;
    endTime?: Date;
    limit?: number;
    cursor?: string;
  }): Promise<PortfolioHistoryResponse> {
    try {
      const requestBody: any = {
        limit: filterRequest?.limit || 100,
        cursor: filterRequest?.cursor || 'string',
        start_time: filterRequest?.startTime
          ? Math.floor(filterRequest.startTime.getTime() / 1000)
          : 0,  // Send 0 to get all historical data
        end_time: filterRequest?.endTime
          ? Math.floor(filterRequest.endTime.getTime() / 1000)
          : 0,  // Send 0 to get all historical data
      };

      if (filterRequest?.accounts && filterRequest.accounts.length > 0) {
        requestBody.account_names = filterRequest.accounts;
      }
      if (filterRequest?.connectors && filterRequest.connectors.length > 0) {
        requestBody.connector_names = filterRequest.connectors;
      }

      console.log('Portfolio History API Request:', {
        filterRequest,
        requestBody,
        url: '/portfolio/history',
        timestamps: {
          start_time_readable: requestBody.start_time ? new Date(requestBody.start_time * 1000).toISOString() : 'not set',
          end_time_readable: requestBody.end_time ? new Date(requestBody.end_time * 1000).toISOString() : 'not set'
        }
      });

      const response = await apiClient.post<PortfolioHistoryResponse>(
        '/portfolio/history',
        requestBody
      );

      console.log('Portfolio History API Response:', response.data);
      return (
        response.data || {
          data: [],
          pagination: {
            limit: 100,
            has_more: false,
            next_cursor: null,
            current_cursor: 'string',
            filters: {
              account_names: [],
              connector_names: [],
              start_time: 0,
              end_time: 0,
            },
          },
        }
      );
    } catch (error) {
      console.error('Failed to fetch portfolio history:', error);
      return {
        data: [],
        pagination: {
          limit: 100,
          has_more: false,
          next_cursor: null,
          current_cursor: 'string',
          filters: {
            account_names: [],
            connector_names: [],
            start_time: 0,
            end_time: 0,
          },
        },
      };
    }
  },

  // Get portfolio distribution by tokens
  async getPortfolioDistribution(filterRequest?: {
    accounts?: string[];
    connectors?: string[];
    tokens?: string[];
  }): Promise<PortfolioDistributionResponse> {
    try {
      const requestBody: any = {};

      if (filterRequest?.accounts && filterRequest.accounts.length > 0) {
        requestBody.account_names = filterRequest.accounts;
      }
      if (filterRequest?.connectors && filterRequest.connectors.length > 0) {
        requestBody.connector_names = filterRequest.connectors;
      }
      if (filterRequest?.tokens && filterRequest.tokens.length > 0) {
        requestBody.token_names = filterRequest.tokens;
      }

      const response = await apiClient.post<PortfolioDistributionResponse>(
        '/portfolio/distribution',
        requestBody
      );
      return (
        response.data || {
          total_portfolio_value: 0,
          token_count: 0,
          distribution: [],
          account_filter: undefined,
        }
      );
    } catch (error) {
      console.error('Failed to fetch portfolio distribution:', error);
      return {
        total_portfolio_value: 0,
        token_count: 0,
        distribution: [],
        account_filter: undefined,
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
      const requestBody: any = {};

      if (filterRequest?.accounts && filterRequest.accounts.length > 0) {
        requestBody.account_names = filterRequest.accounts;
      }
      if (filterRequest?.connectors && filterRequest.connectors.length > 0) {
        requestBody.connector_names = filterRequest.connectors;
      }
      if (filterRequest?.tokens && filterRequest.tokens.length > 0) {
        requestBody.token_names = filterRequest.tokens;
      }

      const response = await apiClient.post<AccountsDistributionResponse>(
        '/portfolio/accounts-distribution',
        requestBody
      );
      return (
        response.data || {
          accounts: {},
          total_value: 0,
          account_count: 0,
        }
      );
    } catch (error) {
      console.error('Failed to fetch accounts distribution:', error);
      return {
        accounts: {},
        total_value: 0,
        account_count: 0,
      };
    }
  },
};
