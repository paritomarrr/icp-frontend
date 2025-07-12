
import { Outlet, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Home, ShoppingBag, Building2, Users, Target } from 'lucide-react';
import { Workspace } from '@/types';

const WorkspaceLayout = () => {
  const { slug } = useParams();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!slug) return;

      // Retrieve workspace from localStorage first
      // If not in localStorage, fetch from API
      // Save to localStorage for future use
      let workspaceData = storageService.getWorkspace(slug);

      if (!workspaceData) {
        try {
          const response = await fetch(`http://localhost:3000/api/workspaces/slug/${slug}`, {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          });

          if (response.ok) {
            workspaceData = await response.json();
            // Save to localStorage for future use
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
    console.log("User not authenticated, redirecting to login");
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
    console.log("Workspace not found, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  const handleLogout = () => {
    authService.logout();
    console.log("User logged out, redirecting to login page");
    window.location.href = '/login';
  };

  const sidebarItems = [
    { icon: Home, label: 'Home', path: `/workspace/${slug}/home` },
    { icon: ShoppingBag, label: 'Products', path: `/workspace/${slug}/products` },
    { icon: Building2, label: 'Segments', path: `/workspace/${slug}/segments` },
    { icon: Users, label: 'Personas', path: `/workspace/${slug}/personas` },
    { icon: Target, label: 'Pre-Sales Outbound Plays', path: `/workspace/${slug}/outbound-plays` },
  ];

  // Helper function to check if current path matches exactly
  const isActivePath = (itemPath: string) => {
    return location.pathname === itemPath;
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - Fixed height, non-scrollable */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-primary text-base">ICP Wizard</span>
          </Link>
          {workspace && (
            <div className="mt-5">
              <h3 className="font-semibold text-sidebar-primary truncate text-sm">{workspace.name}</h3>
              <p className="text-xs text-sidebar-foreground truncate mt-1">{workspace.companyName}</p>
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
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* User Info - Fixed at bottom */}
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center justify-between p-3 bg-sidebar-accent rounded-xl">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-primary truncate">{user.fullName}</p>
              <p className="text-xs text-sidebar-foreground truncate mt-1" title={user.email}>{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:text-sidebar-primary ml-2 flex-shrink-0 text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto bg-background">
        <Outlet />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
