import { useParams } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';

export const usePermissions = () => {
  const { slug } = useParams();
  const user = authService.getCurrentUser();

  const isOwner = () => {
    if (!slug || !user) return false;
    const workspace = storageService.getWorkspace(slug);
    // Prioritize ownerId (backend schema) over creatorId (legacy)
    return (workspace?.ownerId && workspace.ownerId === user.id) || 
           (workspace?.creatorId === user.id);
  };

  const hasPermission = (permission: 'canView' | 'canEdit' | 'canInvite' | 'canDelete') => {
    if (!slug || !user) return false;
    
    // Owner has all permissions
    if (isOwner()) return true;
    
    return storageService.canUserAccess(slug, user.email, permission);
  };

  const canView = () => hasPermission('canView');
  const canEdit = () => hasPermission('canEdit');
  const canInvite = () => hasPermission('canInvite');
  const canDelete = () => hasPermission('canDelete');

  const getUserRole = () => {
    if (!slug || !user) return null;
    
    if (isOwner()) return 'owner';
    
    const collaborators = storageService.getCollaborators(slug);
    const collaborator = collaborators.find(c => c.email === user.email);
    return collaborator?.role || null;
  };

  return {
    isOwner,
    hasPermission,
    canView,
    canEdit,
    canInvite,
    canDelete,
    getUserRole,
    user,
    slug
  };
}; 