import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Workspace } from '@/types';
import { Plus, Search, Calendar, Users, ExternalLink, LogOut, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!user) {
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';
    fetch(`${API_BASE}/workspaces`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setWorkspaces(data);
        // Store workspaces in localStorage for access in other components
        data.forEach((workspace: any) => {
          storageService.saveWorkspace(workspace.slug, workspace);
        });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch workspaces:", err);
        }
      });
    return () => controller.abort();
  }, [user, navigate]);

  if (!user) return null;

  const handleWorkspaceClick = (workspace: Workspace) => {
    const workspaceSlug = workspace.slug;

    try {
      if (workspace.product) {
        // Redirect to product page/home page if ICP generation is complete
        navigate(`/workspace/${workspaceSlug}/product`);
      } else if (workspace.product || workspace.personas?.length > 0) {
        // Redirect to product page/home page if products or personas exist
        navigate(`/workspace/${workspaceSlug}/product`);
      } else {
        // Redirect to enhanced ICP wizard if setup is required
        navigate(`/workspace/${workspaceSlug}/enhanced-icp-wizard`);
      }
    } catch (error) {
      console.error('Error navigating to workspace:', error);
      navigate(`/workspace/${workspaceSlug}`);
    }
  };

  const handleDeleteWorkspace = async (workspace: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    const isConfirmed = confirm(
      `Are you sure you want to delete "${workspace.name}"?\n\nThis action cannot be undone and will permanently remove all workspace data.`
    );
    if (!isConfirmed) return;
    setDeletingWorkspaceId(workspace._id);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';
      const response = await fetch(`${API_BASE}/workspaces/${workspace._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete workspace');
      }
      setWorkspaces(prev => prev.filter(w => w._id !== workspace._id));
      storageService.deleteWorkspace(workspace._id);
      toast({
        title: "Workspace deleted",
        description: `"${workspace.name}" has been permanently deleted.`,
      });
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingWorkspaceId(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredWorkspaces = workspaces.map(workspace => {
    const hasIcpData = Boolean(workspace.product || workspace.personas?.length > 0);
    return {
      ...workspace,
      icpStatus: hasIcpData ? 'ICP Complete' : 'Setup Required',
    };
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-octave-light-1">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-octave-dark-3 mb-1">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-octave-dark-1">
              Manage your ICP workspaces and generate insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/workspace/new">
              <Button className="bg-octave-dark-2 hover:bg-octave-dark-3 text-white text-xs">
                <Plus className="w-3 h-3 mr-2" />
                New Workspace
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-octave-light-3 text-octave-dark-1 hover:bg-octave-light-2 text-xs"
            >
              <LogOut className="w-3 h-3 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-octave-dark-1 w-3 h-3" />
            <Input
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs border-octave-light-3 focus:border-octave-dark-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => {
            const hasIcpData = workspace.product || workspace.personas?.length > 0;
            return (
              <Card 
                key={workspace._id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                onClick={() => handleWorkspaceClick(workspace)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-slate-800 mb-1">
                        {workspace.name}
                      </CardTitle>
                      <p className="text-xs text-slate-600">{workspace.companyName}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteWorkspace(workspace, e)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 text-xs"
                          disabled={deletingWorkspaceId === workspace._id}
                        >
                          {deletingWorkspaceId === workspace._id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete Workspace
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-xs text-slate-500">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      <span className="truncate">{workspace.companyUrl}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="w-3 h-3 mr-2" />
                      <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Users className="w-3 h-3 mr-2" />
                      <span>{workspace.collaborators?.length + 1 || 1} collaborator(s)</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        hasIcpData 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {hasIcpData ? 'ICP Complete' : 'Setup Required'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredWorkspaces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">No workspaces found</p>
              <p className="text-sm">Create your first workspace to get started</p>
            </div>
            <Link to="/workspace/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
