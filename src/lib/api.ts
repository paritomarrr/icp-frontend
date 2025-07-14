// lib/api.ts
import { authService } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';

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
  suggestions?: any;
  nextStep?: number;
  error?: string;
}

// New interfaces for detailed items
export interface ProductData {
  name: string;
  description?: string;
  category?: string;
  targetAudience?: string;
  valueProposition?: string;
  problems?: string[];
  features?: string[];
  benefits?: string[];
  useCases?: string[];
  usps?: string[];
  solution?: string;
  whyNow?: string[];
  pricing?: string;
  status?: 'active' | 'draft' | 'archived';
  priority?: 'high' | 'medium' | 'low';
}

export interface PersonaData {
  name: string;
  title?: string;
  department?: string;
  seniority?: string;
  industry?: string;
  company?: string;
  location?: string;
  description?: string;
  painPoints?: string[];
  goals?: string[];
  responsibilities?: string[];
  challenges?: string[];
  decisionInfluence?: 'Decision Maker' | 'Influencer' | 'User' | 'Gatekeeper';
  budget?: string;
  teamSize?: string;
  channels?: string[];
  objections?: string[];
  triggers?: string[];
  messaging?: string;
  status?: 'active' | 'draft' | 'archived';
  priority?: 'high' | 'medium' | 'low';
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  demographics?: {
    age?: string;
    experience?: string;
    education?: string;
    industry?: string;
  };
  buyingBehavior?: {
    researchTime?: string;
    decisionFactors?: string[];
    preferredChannels?: string[];
  };
}

export interface SegmentData {
  name: string;
  description?: string;
  size?: string;
  region?: string;
  budget?: string;
  focus?: string;
  industry?: string;
  revenue?: string;
  employees?: string;
  characteristics?: string[];
  firmographics?: Array<{ label: string; value: string }>;
  benefits?: string;
  awarenessLevel?: 'Problem' | 'Solution' | 'Product' | 'Brand';
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'draft' | 'archived';
  marketSize?: string;
  growthRate?: string;
  qualification?: {
    idealCriteria?: string[];
    lookalikeCompanies?: string[];
    disqualifyingCriteria?: string[];
  };
}

export const icpWizardApi = {
  async generateSuggestions(currentStepOrField: string, formData: StepData, companyName: string): Promise<StepResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/icp-wizard/generate-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          currentStepOrField,
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

  // ==================== PRODUCT MANAGEMENT ====================
  async addProduct(workspaceSlug: string, productData: ProductData): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      return await response.json();
    } catch (error) {
      console.error('Add product error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async updateProduct(workspaceSlug: string, productId: string, productData: Partial<ProductData>): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      return await response.json();
    } catch (error) {
      console.error('Update product error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async deleteProduct(workspaceSlug: string, productId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete product error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  // ==================== PERSONA MANAGEMENT ====================
  async addPersona(workspaceSlug: string, personaData: PersonaData): Promise<{ success: boolean; persona?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/personas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(personaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add persona');
      }

      return await response.json();
    } catch (error) {
      console.error('Add persona error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async updatePersona(workspaceSlug: string, personaId: string, personaData: Partial<PersonaData>): Promise<{ success: boolean; persona?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/personas/${personaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(personaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update persona');
      }

      return await response.json();
    } catch (error) {
      console.error('Update persona error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async deletePersona(workspaceSlug: string, personaId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/personas/${personaId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete persona');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete persona error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  // ==================== SEGMENT MANAGEMENT ====================
  async addSegment(workspaceSlug: string, segmentData: SegmentData): Promise<{ success: boolean; segment?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(segmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add segment');
      }

      return await response.json();
    } catch (error) {
      console.error('Add segment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async updateSegment(workspaceSlug: string, segmentId: string, segmentData: Partial<SegmentData>): Promise<{ success: boolean; segment?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/segments/${segmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(segmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update segment');
      }

      return await response.json();
    } catch (error) {
      console.error('Update segment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async deleteSegment(workspaceSlug: string, segmentId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceSlug}/segments/${segmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete segment');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete segment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
}; 