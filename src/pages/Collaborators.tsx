
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Collaborator } from '@/types';
import { UserPlus, Mail, Check, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Collaborators = () => {
  const { id } = useParams();
  const user = authService.getCurrentUser();
  const workspace = id ? storageService.getWorkspace(id) : null;
  const [email, setEmail] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (id) {
      const workspaceCollaborators = storageService.getCollaborators(id);
      setCollaborators(workspaceCollaborators);
    }
  }, [id]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    const newCollaborator: Collaborator = {
      email: email.trim(),
      role: 'Collaborator',
      status: 'invited',
    };
    
    storageService.addCollaborator(id!, newCollaborator);
    setCollaborators([...collaborators, newCollaborator]);
    setEmail('');
    
    toast({
      title: "Invitation sent!",
      description: `${email} has been invited to collaborate`,
    });
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Collaborators</h1>
          <p className="text-slate-600">Invite team members to collaborate on this workspace</p>
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
            <form onSubmit={handleInvite} className="flex space-x-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-slate-200 focus:border-blue-500"
                required
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Send Invite
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Collaborators List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Workspace Owner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{user.fullName}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Owner</Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>

              {/* Invited Collaborators */}
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{collaborator.email}</p>
                      <p className="text-sm text-slate-600">{collaborator.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
