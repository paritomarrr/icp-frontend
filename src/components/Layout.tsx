
import { Outlet, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Home, ShoppingBag, Building2, Users, Target } from 'lucide-react';

const WorkspaceLayout = () => {
  const { slug } = useParams();
  const location = useLocation();
  // const { id } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;

  console.log("🧭 WorkspaceLayout → slug:", slug);
console.log("🧭 WorkspaceLayout → workspace from storage:", workspace);

  
  if (!user) {
    console.log("⛔ User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  if (slug && !workspace) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogout = () => {
    authService.logout();
    console.log("🔒 User logged out, redirecting to login page");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 min-h-screen">
          <div className="p-6 border-b border-slate-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800">ICP Wizard</span>
            </Link>
            {workspace && (
              <div className="mt-4">
                <h3 className="font-semibold text-slate-800 truncate">{workspace.name}</h3>
                <p className="text-sm text-slate-600 truncate">{workspace.companyName}</p>
              </div>
            )}
          </div>
          
          <nav className="p-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-500 truncate" title={user.email}>{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-800 ml-2 flex-shrink-0"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
