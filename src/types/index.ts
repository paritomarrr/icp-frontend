
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

  // Optional ICP data
  products?: string[];
  personas?: string[];
}


export interface ICPData {
  workspaceId: string;
  companyUrl: string;
  products: string;
  personas: string;
  useCases: string;
  differentiation: string;
  segments: string;
  competitors: string;
  currentVersion: number;
  versions: {
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
  role: string;
  status: 'invited' | 'active';
}
