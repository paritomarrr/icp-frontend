import { Workspace, ICPData, Collaborator } from '@/types';

const WORKSPACES_KEY = 'icp_wizard_workspaces';
const ICP_DATA_KEY = 'icp_wizard_icp_data';
const COLLABORATORS_KEY = 'icp_wizard_collaborators';

export const storageService = {
  // Create a workspace locally if not saving from backend
  createWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt'>): Workspace => {
    const workspaces = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    const newWorkspace: Workspace = {
      ...workspace,
      _id: Math.random().toString(36).substr(2, 9), // Temporary id
      createdAt: new Date().toISOString(),
    };
    workspaces.push(newWorkspace);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    return newWorkspace;
  },

  saveWorkspace: (slug: string, workspace: Workspace): void => {
    const existing = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    const updated = Array.isArray(existing)
      ? [...existing.filter(w => w.slug !== slug), workspace]
      : [workspace]; // Fallback if previous format was object
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated));
  },

  getUserWorkspaces: (userId: string): Workspace[] => {
    const workspaces = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    return workspaces.filter((w: Workspace) =>
      // Check ownerId first (backend schema), then fallback to creatorId (legacy)
      (w.ownerId && w.ownerId === userId) || 
      (w.creatorId === userId) ||
      // Check if user is in collaborators array
      (w.collaborators && Array.isArray(w.collaborators) && w.collaborators.includes(userId))
    );
  },

  getWorkspace: (idOrSlug: string): Workspace | null => {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (!raw) return null;
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
    if (Array.isArray(data)) {
      return data.find((w: Workspace) => w._id === idOrSlug || w.slug === idOrSlug) || null;
    } else {
      return data[idOrSlug] || null;
    }
  },

  deleteWorkspace: (id: string): void => {
    const workspaces = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    const filtered = workspaces.filter((w: Workspace) => w._id !== id);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(filtered));
    // Remove related ICP data
    const allICPData = JSON.parse(localStorage.getItem(ICP_DATA_KEY) || '{}');
    delete allICPData[id];
    localStorage.setItem(ICP_DATA_KEY, JSON.stringify(allICPData));
    // Remove related collaborators
    const allCollaborators = JSON.parse(localStorage.getItem(COLLABORATORS_KEY) || '{}');
    delete allCollaborators[id];
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(allCollaborators));
  },

  // ICP Data
  saveICPData: (data: ICPData): void => {
    const allData = JSON.parse(localStorage.getItem(ICP_DATA_KEY) || '{}');
    allData[data.workspaceId] = data;
    localStorage.setItem(ICP_DATA_KEY, JSON.stringify(allData));
  },

  getICPData: (workspaceId: string): ICPData | null => {
    const allData = JSON.parse(localStorage.getItem(ICP_DATA_KEY) || '{}');
    return allData[workspaceId] || null;
  },

  // Collaborators
  addCollaborator: (workspaceId: string, collaborator: Collaborator): void => {
    const all = JSON.parse(localStorage.getItem(COLLABORATORS_KEY) || '{}');
    if (!all[workspaceId]) {
      all[workspaceId] = [];
    }
    all[workspaceId].push(collaborator);
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(all));
  },

  getCollaborators: (workspaceId: string): Collaborator[] => {
    const all = JSON.parse(localStorage.getItem(COLLABORATORS_KEY) || '{}');
    return all[workspaceId] || [];
  },

  updateCollaborator: (workspaceId: string, email: string, updates: Partial<Collaborator>): void => {
    const all = JSON.parse(localStorage.getItem(COLLABORATORS_KEY) || '{}');
    if (!all[workspaceId]) return;
    
    const index = all[workspaceId].findIndex((c: Collaborator) => c.email === email);
    if (index !== -1) {
      all[workspaceId][index] = { ...all[workspaceId][index], ...updates };
      localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(all));
    }
  },

  removeCollaborator: (workspaceId: string, email: string): void => {
    const all = JSON.parse(localStorage.getItem(COLLABORATORS_KEY) || '{}');
    if (!all[workspaceId]) return;
    
    all[workspaceId] = all[workspaceId].filter((c: Collaborator) => c.email !== email);
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(all));
  },

  getCollaboratorPermissions: (workspaceId: string, userEmail: string): Collaborator['permissions'] | null => {
    const collaborators = storageService.getCollaborators(workspaceId);
    const collaborator = collaborators.find(c => c.email === userEmail);
    return collaborator ? collaborator.permissions : null;
  },

  canUserAccess: (workspaceId: string, userEmail: string, permission: keyof Collaborator['permissions']): boolean => {
    // First check if user is the workspace owner
    const workspace = storageService.getWorkspace(workspaceId);
    if (workspace) {
      // Get current user to check if they're the owner
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (currentUser) {
        // Check against backend schema: ownerId first, then fallback to creatorId for backwards compatibility
        const isOwner = (workspace.ownerId && workspace.ownerId === currentUser.id) || 
                       (workspace.creatorId === currentUser.id);
        
        if (isOwner) {
          // Owner has all permissions
          return true;
        }
        
        // Check if user ID is in collaborators array (backend simple approach)
        if (workspace.collaborators && Array.isArray(workspace.collaborators) && 
            workspace.collaborators.includes(currentUser.id)) {
          // For now, collaborators in the simple array have view/edit permissions
          return permission === 'canView' || permission === 'canEdit';
        }
      }
    }
    
    // If not owner or simple collaborator, check detailed collaborator permissions (frontend system)
    const permissions = storageService.getCollaboratorPermissions(workspaceId, userEmail);
    return permissions ? permissions[permission] : false;
  }
};
