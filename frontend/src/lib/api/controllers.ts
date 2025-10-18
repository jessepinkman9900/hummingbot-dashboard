import { apiClient } from './client';

// Types
export interface ControllersByType {
  directional_trading?: string[];
  market_making?: string[];
  generic?: string[];
  [key: string]: string[] | undefined;
}

export interface ControllerConfigField {
  default: any;
  type: string;
  required: boolean;
}

export interface ControllerConfigTemplate {
  [key: string]: ControllerConfigField;
}

export interface ControllerCode {
  name: string;
  type: string;
  content: string;
}

// API Functions

/**
 * Get all available controllers grouped by type
 * GET /controllers/
 */
export async function getControllers(): Promise<ControllersByType> {
  const response = await apiClient.get<ControllersByType>('/controllers/');
  return response.data;
}

/**
 * Get configuration template for a specific controller
 * GET /controllers/{controller_type}/{controller_name}/config/template
 */
export async function getControllerConfigTemplate(
  controllerType: string,
  controllerName: string
): Promise<ControllerConfigTemplate> {
  const response = await apiClient.get<ControllerConfigTemplate>(
    `/controllers/${controllerType}/${controllerName}/config/template`
  );
  return response.data;
}

/**
 * Get the source code for a specific controller
 * GET /controllers/{controller_type}/{controller_name}
 */
export async function getControllerCode(
  controllerType: string,
  controllerName: string
): Promise<ControllerCode> {
  const response = await apiClient.get<ControllerCode>(
    `/controllers/${controllerType}/${controllerName}`
  );
  return response.data;
}
