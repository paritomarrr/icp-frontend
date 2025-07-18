
import { Outlet, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/ui/logo';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Home, ShoppingBag, Building2, Users, Target, UserPlus, Crown, Eye, PenTool } from 'lucide-react';
import { Workspace } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';

const WorkspaceLayout = () => {
  const { slug } = useParams();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOwner, getUserRole } = usePermissions();

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!slug) return;

      let workspaceData = storageService.getWorkspace(slug);

      if (!workspaceData) {
        try {
          const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';
          const response = await fetch(`${API_BASE}/workspaces/slug/${slug}`, {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          });

          if (response.ok) {
            workspaceData = await response.json();
            storageService.saveWorkspace(slug, workspaceData);
          } else {
            console.error("Failed to fetch workspace from API");
          }
        } catch (error) {
          console.error("Error fetching workspace:", error);
        }
      }

      setWorkspace(workspaceData);
      setLoading(false);
    };

    loadWorkspace();
  }, [slug]);

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading workspace...</p>
        </div>
      </div>
    );
  }
  
  if (slug && !workspace) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const sidebarItems = [
    { icon: Home, label: 'Home', path: `/workspace/${slug}/home` },
    { icon: ShoppingBag, label: 'Product', path: `/workspace/${slug}/product` },
    { icon: Building2, label: 'Segments', path: `/workspace/${slug}/segments` },
    { icon: Users, label: 'Personas', path: `/workspace/${slug}/personas` },
    { icon: Target, label: 'Pre-Sales Outbound Plays', path: `/workspace/${slug}/outbound-plays` },
    { icon: UserPlus, label: 'Collaborators', path: `/workspace/${slug}/collaborators` },
  ];

  const isActivePath = (itemPath: string) => {
    return location.pathname === itemPath;
  };

  const getUserRoleIcon = () => {
    const role = getUserRole();
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'editor':
        return <PenTool className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getUserRoleColor = () => {
    const role = getUserRole();
    switch (role) {
      case 'owner':
        return 'bg-octave-accent/20 text-octave-dark-3 border-octave-accent/50';
      case 'editor':
        return 'bg-octave-light-3/50 text-octave-dark-2 border-octave-dark-1/30';
      case 'viewer':
        return 'bg-octave-light-2/50 text-octave-dark-1 border-octave-light-3/50';
      default:
        return 'bg-octave-light-1 text-octave-dark-1 border-octave-light-2';
    }
  };

  return (
    <div className="h-screen bg-octave-light-1 flex">
      {/* Sidebar - Fixed height, non-scrollable */}
      <div className="w-64 bg-white border-r border-octave-light-2 flex flex-col h-full shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-octave-light-2/30 flex-shrink-0 bg-gradient-to-r from-octave-light-1 to-white">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <Logo size="lg" />
            <span className="font-semibold text-octave-dark-3 text-base">ICP Model</span>
          </Link>
          {workspace && (
            <div className="mt-5">
              <h3 className="font-semibold text-octave-dark-2 truncate text-sm">{workspace.name}</h3>
              <p className="text-xs text-octave-dark-1 truncate mt-1">{workspace.companyName}</p>
              <div className="mt-2 flex items-center space-x-2">
                <Badge className={`text-xs ${getUserRoleColor()}`}>
                  {getUserRoleIcon()}
                  <span className="ml-1 capitalize">{getUserRole()}</span>
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation - Flexible, will shrink if needed */}
        <nav className="p-4 flex-1 overflow-hidden">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActivePath(item.path)
                    ? 'bg-octave-accent/20 text-octave-dark-3 shadow-sm border border-octave-accent/30'
                    : 'text-octave-dark-1 hover:bg-octave-light-1 hover:text-octave-dark-2'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* User Info - Fixed at bottom */}
        <div className="p-4 border-t border-octave-light-2 flex-shrink-0">
          <div className="flex items-center justify-between p-3 bg-octave-light-1 rounded-xl border border-octave-light-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-octave-dark-3 truncate">{user.fullName}</p>
              <p className="text-xs text-octave-dark-1 truncate mt-1" title={user.email}>{user.email}</p>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-octave-dark-1 hover:text-octave-dark-3 hover:bg-octave-light-2 ml-2 flex-shrink-0 text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto bg-octave-light-1">
        <Outlet />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
