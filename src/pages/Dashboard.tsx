import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth';
import { Workspace } from '@/types';
import { Plus, Search, Calendar, Users, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!user) {
      console.warn('⚠️ Workspace not found, maybe still loading?');

      // navigate('/login');
    }

    if (user) {
      fetch(`http://localhost:3000/api/workspaces/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(data => {
          setWorkspaces(data);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Failed to fetch workspaces:", err);
          }
        });
    }
    return () => controller.abort();
  }, [user, navigate]);

  if (!user) return null;

  const handleWorkspaceClick = (workspace: Workspace) => {
    const hasIcpData = workspace.products?.length > 0 || workspace.personas?.length > 0;
    const workspaceSlug = workspace.slug;

    if (hasIcpData) {
      navigate(`/workspace/${workspaceSlug}/products`);
    } else {
      navigate(`/workspace/${workspaceSlug}/icp-wizard`);
    }
  };

  const handleDeleteWorkspace = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workspace?')) {
      fetch(`http://localhost:3000/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(() => {
          setWorkspaces(prev => prev.filter(w => w._id !== workspaceId));
        })
        .catch(err => console.error("Failed to delete workspace:", err));
    }
  };

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    // navigate('/login');
    console.warn('⚠️ Workspace not found, maybe still loading?');

    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-600">
              Manage your ICP workspaces and generate insights
            </p>
          </div>
          <Link to="/workspace/new">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => {
            const hasIcpData = workspace.products?.length > 0 || workspace.personas?.length > 0;

            return (
              <Card 
                key={workspace._id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                onClick={() => handleWorkspaceClick(workspace)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-800 mb-1">
                        {workspace.name}
                      </CardTitle>
                      <p className="text-sm text-slate-600">{workspace.companyName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteWorkspace(workspace._id, e)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-500">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      <span className="truncate">{workspace.companyUrl}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-2" />
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
