// lib/api.ts
import { authService } from './auth';

const API_BASE_URL = 'http://localhost:3000/api';

export interface StepData {
  companyName: string;
  companyUrl: string;
  products: string[];
  personas: string[];
  useCases: string[];
  differentiation: string;
  segments: string[];
  competitors: { name: string; url: string }[];
}

export interface StepResponse {
  success: boolean;
  airtableRecordId?: string;
  suggestions?: any;
  nextStep?: number;
  error?: string;
}

export const icpWizardApi = {
  async submitStep(stepData: StepData, currentStep: number, workspaceSlug: string, airtableRecordId?: string): Promise<StepResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          stepData,
          currentStep,
          workspaceSlug,
          airtableRecordId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit step');
      }

      return await response.json();
    } catch (error) {
      console.error('Step submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async updateStep(recordId: string, stepData: StepData, currentStep: number, isComplete: boolean): Promise<StepResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/step/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          stepData,
          currentStep,
          isComplete,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update step');
      }

      return await response.json();
    } catch (error) {
      console.error('Step update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async generateSuggestions(currentStep: number, formData: StepData, companyName: string): Promise<StepResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/generate-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          currentStep,
          formData,
          companyName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Generate suggestions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async generatePersonaDetails(personaTitle: string, companyData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/generate-persona-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          personaTitle,
          companyData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate persona details');
      }

      return await response.json();
    } catch (error) {
      console.error('Generate persona details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async generateSegmentDetails(segmentDescription: string, companyData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/generate-segment-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          segmentDescription,
          companyData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate segment details');
      }

      return await response.json();
    } catch (error) {
      console.error('Generate segment details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async generateProductDetails(productName: string, companyData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/generate-product-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          productName,
          companyData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate product details');
      }

      return await response.json();
    } catch (error) {
      console.error('Generate product details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
}; 