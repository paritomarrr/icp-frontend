
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
  products?: Product[];
  personas?: Persona[];
  segments?: Segment[];
  useCases?: string[];
  differentiation?: string;
  competitors?: Array<{
    name: string;
    url: string;
    _id?: string;
  }>;
  icpEnrichmentVersions?: {
    [key: number]: any;
  };
}

export interface Product {
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  targetAudience?: string;
  valueProposition?: string;
  problems?: string[];
  features?: string[];
  benefits?: string[];
  useCases?: string[];
  competitors?: string[];
  uniqueSellingPoints?: string[];
  usps?: string[];
  solution?: string;
  whyNow?: string[];
  pricing?: string;
  status?: 'active' | 'draft' | 'archived';
  priority?: 'high' | 'medium' | 'low';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Persona {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Segment {
  _id?: string;
  name: string;
  description?: string;
  size?: string;
  region?: string;
  budget?: string;
  focus?: string;
  industry?: string;
  companySize?: string;
  revenue?: string;
  geography?: string;
  employees?: string;
  marketSize?: string;
  growthRate?: string;
  customerCount?: string;
  competitiveIntensity?: string;
  characteristics?: string[];
  industries?: string[];
  companySizes?: string[];
  technologies?: string[];
  qualificationCriteria?: string[];
  painPoints?: string[];
  buyingProcesses?: string[];
  firmographics?: Array<{
    label: string;
    value: string;
  }>;
  benefits?: string;
  awarenessLevel?: 'Problem' | 'Solution' | 'Product' | 'Brand';
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'draft' | 'archived';
  qualification?: {
    idealCriteria?: string[];
    lookalikeCompanies?: string[];
    disqualifyingCriteria?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICPData {
  workspaceId?: string;
  _id?: string;
  name?: string;
  companyName?: string;
  companyUrl?: string;
  ownerId?: string;
  slug?: string;
  products?: Product[];
  personas?: Persona[];
  segments?: Segment[];
  useCases?: string[];
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
