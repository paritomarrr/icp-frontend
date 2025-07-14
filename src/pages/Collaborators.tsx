
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Collaborator } from '@/types';
import { UserPlus, Mail, Check, Clock, MoreHorizontal, Edit, Trash2, Shield, Eye, PenTool, Users, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Collaborators = () => {
  const { slug } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor'>('viewer');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (slug) {
      const workspaceCollaborators = storageService.getCollaborators(slug);
      setCollaborators(workspaceCollaborators);
    }
  }, [slug]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  const getRolePermissions = (role: 'owner' | 'editor' | 'viewer') => {
    switch (role) {
      case 'owner':
        return { canView: true, canEdit: true, canInvite: true, canDelete: true };
      case 'editor':
        return { canView: true, canEdit: true, canInvite: false, canDelete: false };
      case 'viewer':
        return { canView: true, canEdit: false, canInvite: false, canDelete: false };
      default:
        return { canView: false, canEdit: false, canInvite: false, canDelete: false };
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    const newCollaborator: Collaborator = {
      email: email.trim(),
      role: selectedRole,
      status: 'invited',
      permissions: getRolePermissions(selectedRole),
      invitedAt: new Date().toISOString(),
    };
    
    storageService.addCollaborator(slug!, newCollaborator);
    setCollaborators([...collaborators, newCollaborator]);
    setEmail('');
    
    toast({
      title: "Invitation sent!",
      description: `${email} has been invited as ${selectedRole}`,
    });
  };

  const handleRoleChange = (email: string, newRole: 'viewer' | 'editor') => {
    const permissions = getRolePermissions(newRole);
    storageService.updateCollaborator(slug!, email, { role: newRole, permissions });
    
    setCollaborators(collaborators.map(c => 
      c.email === email ? { ...c, role: newRole, permissions } : c
    ));
    
    toast({
      title: "Role updated!",
      description: `${email} is now ${newRole}`,
    });
  };

  const handleRemoveCollaborator = (email: string) => {
    storageService.removeCollaborator(slug!, email);
    setCollaborators(collaborators.filter(c => c.email !== email));
    
    toast({
      title: "Collaborator removed!",
      description: `${email} has been removed from the workspace`,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'editor':
        return <PenTool className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-slate-200 focus:border-blue-500"
                  required
                />
                <Select value={selectedRole} onValueChange={(value: 'viewer' | 'editor') => setSelectedRole(value)}>
                  <SelectTrigger className="w-48 border-slate-200 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Viewer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center space-x-2">
                        <PenTool className="w-4 h-4" />
                        <span>Editor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Send Invite
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                <strong>Viewer:</strong> Can view all workspace data • <strong>Editor:</strong> Can view and edit workspace data
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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{user.fullName}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
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

              {/* Invited Collaborators */}
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{collaborator.email}</p>
                      <p className="text-sm text-slate-600">Invited {new Date(collaborator.invitedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(collaborator.role)}>
                      {getRoleIcon(collaborator.role)}
                      <span className="ml-1 capitalize">{collaborator.role}</span>
                    </Badge>
                    <Badge 
                      variant={collaborator.status === 'active' ? 'default' : 'outline'}
                      className={collaborator.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }
                    >
                      {collaborator.status === 'active' ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Invited
                        </>
                      )}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(collaborator.email, 'viewer')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Make Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(collaborator.email, 'editor')}>
                          <PenTool className="w-4 h-4 mr-2" />
                          Make Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemoveCollaborator(collaborator.email)}
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

              {collaborators.length === 0 && (
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
