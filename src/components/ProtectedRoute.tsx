import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { useParams } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: 'canView' | 'canEdit' | 'canInvite' | 'canDelete';
}

const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { slug } = useParams();
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If no specific permission is required, just check if user is authenticated
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // If we're in a workspace context, check collaborator permissions
  if (slug) {
    const workspace = storageService.getWorkspace(slug);
    
    // If user is the workspace owner, they have all permissions
    if (workspace && ((workspace.ownerId && workspace.ownerId === user.id) || workspace.creatorId === user.id)) {
      return <>{children}</>;
    }

    // Check if user has the required permission
    const hasPermission = storageService.canUserAccess(slug, user.email, requiredPermission);
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">You don't have permission to access this resource.</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
