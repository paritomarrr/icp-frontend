
import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { collaboratorApi } from '@/lib/api';
import { UserPlus, Check, MoreHorizontal, Trash2, PenTool, Users, Crown, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Collaborators = () => {
  const { slug } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [email, setEmail] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    if (workspace?._id) {
      loadCollaborators();
    }
  }, [workspace?._id]);

  const loadCollaborators = async () => {
    if (!workspace?._id) return;
    
    const result = await collaboratorApi.getCollaborators(workspace._id);
    if (result.success && result.collaborators) {
      setCollaborators(result.collaborators || []);
      setOwner(result.owner || null);
    } else {
      setCollaborators([]);
      setOwner(null);
      console.error('Failed to load collaborators:', result.error);
    }
  };

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  if (!workspace._id) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-slate-600">Workspace not found or invalid</p>
          </div>
        </div>
      </div>
    );
  }



  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !workspace?._id) return;
    
    setIsAdding(true);
    
    // Directly call addCollaborator with the email
    const result = await collaboratorApi.addCollaborator(workspace._id, email.trim());
    
    setIsAdding(false);
    
    if (result.success) {
      setEmail('');
      await loadCollaborators(); // Reload the collaborators list
      
      toast({
        title: "Collaborator added!",
        description: `${email.trim()} has been added as a collaborator`,
      });
    } else {
      toast({
        title: "Failed to add collaborator",
        description: result.error || "An error occurred while adding the collaborator",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string, collaboratorEmail: string) => {
    if (!workspace?._id) return;
    
    const result = await collaboratorApi.removeCollaborator(workspace._id, collaboratorId);
    
    if (result.success) {
      await loadCollaborators(); // Reload the collaborators list
      toast({
        title: "Collaborator removed!",
        description: `${collaboratorEmail} has been removed from the workspace`,
      });
    } else {
      toast({
        title: "Failed to remove collaborator",
        description: result.error || "An error occurred while removing the collaborator",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Collaborators</h1>
          <p className="text-slate-600">Manage team access and permissions for this workspace</p>
        </div>

        {/* Invite Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Invite New Collaborator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter email address to invite as collaborator"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-200 focus:border-blue-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Collaborator'
                  )}
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                <strong>Editor:</strong> Can view and edit workspace data
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Collaborators List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-slate-600" />
              <span>Team Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Workspace Owner */}
              {owner && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{owner.fullName || owner.name || owner.email}</p>
                      <p className="text-sm text-slate-600">{owner.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Owner
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              )}
              {/* Collaborators */}
              {collaborators
                .filter(c => !owner || c._id !== owner._id) // Exclude owner if present
                .map((collaborator, index) => (
                  <div key={collaborator._id || index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{collaborator.fullName || collaborator.name || collaborator.email}</p>
                        <p className="text-sm text-slate-600">{collaborator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <PenTool className="w-3 h-3 mr-1" />
                        <span className="ml-1">Collaborator</span>
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRemoveCollaborator(collaborator._id || collaborator.id, collaborator.email)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              {collaborators.filter(c => !owner || c._id !== owner._id).length === 0 && (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No collaborators invited yet</p>
                  <p className="text-sm text-slate-500">Invite team members to start collaborating</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Collaborators;
