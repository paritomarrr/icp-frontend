
export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

export interface Workspace {
  _id: string; 
  name: string;
  slug: string;
  companyName: string; 
  companyUrl: string; 
  creatorId: string;
  collaborators: string[];
  createdAt: string;

  // ICP data fields (optional)
  products?: string[];
  personas?: string[];
}

export interface ICPData {
  workspaceId?: string;
  _id?: string;
  name?: string;
  companyName?: string;
  companyUrl?: string;
  ownerId?: string;
  slug?: string;
  products?: string[];
  personas?: string[];
  useCases?: string[];
  segments?: string[];
  competitors?: Array<{
    name: string;
    url: string;
    _id?: string;
  }>;
  differentiation?: string;
  icpEnrichmentVersions?: {
    [key: number]: {
      oneLiner?: string;
      companySummary?: string;
      products?: {
        problems?: string[];
        features?: string[];
        solution?: string;
        usp?: string[];
        whyNow?: string[];
      };
      competitorDomains?: string[];
      salesDeckIdeas?: string[];
      caseStudies?: Array<{
        title: string;
        results?: string;
        outcome?: string;
      }>;
      ctaOptions?: string[];
      segments?: Array<{
        name: string;
        size?: string;
        region?: string;
        budget?: string;
        focus?: string;
        criteria?: string;
        characteristics?: string;
        needs?: string;
        painPoints?: string[];
      }>;
      personasTable?: Array<{
        title: string;
        painPoints?: string[];
        goals?: string[];
        influence?: string;
        triggers?: string[];
      }>;
    };
  };
  createdAt?: string;
  updatedAt?: string;
  currentVersion?: number;
  versions?: {
    [key: number]: {
      products: string;
      personas: string;
      useCases: string;
      differentiation: string;
      segments: string;
      competitors: string;
    };
  };
}

export interface Collaborator {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'invited' | 'active';
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
  invitedAt: string;
  joinedAt?: string;
}
