
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { Target, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Workspace } from '@/types';

const CreateWorkspace = () => {
  const [formData, setFormData] = useState({
    name: '',
    clientCompany: '',
    clientWebsite: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';
      const res = await fetch(`${API_BASE}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          name: formData.name,
          companyName: formData.clientCompany,
          companyUrl: formData.clientWebsite,
          creatorId: user.id,
          collaborators: [],
        }),
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create workspace");
      }
  
      const data = await res.json();
      console.log("✅ Workspace created:", data);

      const formattedWorkspace: Workspace = {
        _id: data._id,
        name: data.name,
        slug: data.slug,
        companyName: data.companyName,
        companyUrl: data.companyUrl,
        creatorId: data.creatorId || data.ownerId || user.id, // Use the correct field
        collaborators: data.collaborators || [],
        createdAt: data.createdAt || new Date().toISOString(),
        products: data.products || [],
        personas: data.personas || [],
      };

      storageService.saveWorkspace(data.slug, formattedWorkspace);

      console.log(authService.getToken());
      console.log(authService.getCurrentUser());

  
      toast({
        title: "Workspace created successfully!",
        description: "You can now start building your ICP",
      });
  
      // Optionally store the workspace slug if needed later
      localStorage.setItem("workspaceSlug", data.slug);

  
      // Navigate to the Enhanced ICP wizard step
      navigate(`/workspace/${data.slug}/enhanced-icp-wizard`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-octave-light-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border border-octave-light-2 bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <CardTitle className="text-xl font-bold text-octave-dark-3">
            Create New Workspace
          </CardTitle>
          <CardDescription className="text-xs text-octave-dark-1">
            Set up a new ICP project
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-octave-dark-2">Workspace Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Q1 2024 Marketing Strategy"
                value={formData.name}
                onChange={handleChange}
                required
                className="border-octave-light-3 focus:border-octave-dark-2 text-xs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientCompany" className="text-xs text-octave-dark-2">Client Company Name</Label>
              <Input
                id="clientCompany"
                name="clientCompany"
                type="text"
                placeholder="e.g., Acme Corporation"
                value={formData.clientCompany}
                onChange={handleChange}
                required
                className="border-octave-light-3 focus:border-octave-dark-2 text-xs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientWebsite" className="text-xs text-octave-dark-2">Client Website</Label>
              <Input
                id="clientWebsite"
                name="clientWebsite"
                type="url"
                placeholder="https://example.com"
                value={formData.clientWebsite}
                onChange={handleChange}
                className="border-octave-light-3 focus:border-octave-dark-2 text-xs"
              />
            </div>
          </CardContent>
          
          <CardContent className="flex flex-col space-y-4 pt-0">
            <Button
              type="submit"
              className="w-full bg-octave-dark-2 hover:bg-octave-dark-3 text-white text-xs font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Workspace...' : 'Create Workspace'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full border-octave-light-3 hover:bg-octave-light-1 text-octave-dark-2 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default CreateWorkspace;
