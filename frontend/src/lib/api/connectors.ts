import { apiClient } from './client';

// Connectors API endpoints
export const connectorsApi = {
  // Get list of available connectors
  async getAvailableConnectors(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/connectors/');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch available connectors:', error);
      return [];
    }
  },

  // Get connector configuration map
  async getConnectorConfigMap(connectorName: string): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `/connectors/${connectorName}/config-map`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch config map for ${connectorName}:`, error);
      return [];
    }
  },

  // Get trading rules for a connector
  async getTradingRules(
    connectorName: string,
    tradingPairs?: string[]
  ): Promise<Record<string, any>> {
    try {
      const params = tradingPairs
        ? `?trading_pairs=${tradingPairs.join(',')}`
        : '';
      const response = await apiClient.get<Record<string, any>>(
        `/connectors/${connectorName}/trading-rules${params}`
      );
      return response.data || {};
    } catch (error) {
      console.error(
        `Failed to fetch trading rules for ${connectorName}:`,
        error
      );
      return {};
    }
  },

  // Get supported order types for a connector
  async getSupportedOrderTypes(connectorName: string): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `/connectors/${connectorName}/order-types`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch order types for ${connectorName}:`, error);
      return [];
    }
  },
};
