import { apiClient } from './client';
import { ApiResponse } from '@/lib/types';

export interface Script {
  name: string;
  content: string;
}

export interface ScriptCreateUpdateRequest {
  content: string;
}

/**
 * Scripts API functions for managing bot scripts
 */
export const scriptsApi = {
  /**
   * Get all available scripts
   */
  async listScripts(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/scripts/');
  },

  /**
   * Get a specific script by name
   */
  async getScript(scriptName: string): Promise<ApiResponse<Script>> {
    return apiClient.get<Script>(`/scripts/${encodeURIComponent(scriptName)}`);
  },

  /**
   * Create or update a script
   */
  async createOrUpdateScript(
    scriptName: string,
    content: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(
      `/scripts/${encodeURIComponent(scriptName)}`,
      { content }
    );
  },

  /**
   * Delete a script
   */
  async deleteScript(scriptName: string): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/scripts/${encodeURIComponent(scriptName)}`);
  },
};