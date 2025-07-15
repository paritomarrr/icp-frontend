import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Users, Edit, Save, X, Plus, Trash2, ChevronRight, Target, TrendingUp, Building2, User, Briefcase } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { icpWizardApi } from '@/lib/api';
import { usePermissions } from '@/hooks/use-permissions';
import { EditPersonaModal } from '@/components/modals';

const PersonaDetails = () => {
  const { slug, personaId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPersona, setEditedPersona] = useState<any>(null);
  const { canEdit, canView, getUserRole } = usePermissions();

  useEffect(() => {
    const fetchICPData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      let data = storageService.getICPData(slug);
      if (data) {
        setIcpData(data);
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`/workspaces/slug/${slug}`);
        if (res.data) {
          storageService.saveICPData({ ...res.data, workspaceId: slug });
          setIcpData({ ...res.data, workspaceId: slug });
        } else {
          setError('No ICP data found for this workspace.');
        }
      } catch (err: any) {
        setError('Failed to fetch ICP data from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchICPData();
  }, [slug]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  if (!canView()) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
            <p className="text-slate-600">You don't have permission to view this workspace.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-slate-600">Loading persona details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">Error Loading Data</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!icpData) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No ICP Data Found</h2>
            <p className="text-slate-600">Please generate ICP data first.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get personas from the workspace data - check both root personas and personas within segments
  const rootPersonas = Array.isArray(icpData?.personas) ? icpData.personas : [];
  const segments = Array.isArray(icpData?.segments) ? icpData.segments : [];
  
  // Collect all personas from segments
  const segmentPersonas: any[] = [];
  segments.forEach((segment: any) => {
    if (segment.personas && Array.isArray(segment.personas)) {
      segmentPersonas.push(...segment.personas);
    }
  });
  
  // Combine all personas
  const allPersonas = [...rootPersonas, ...segmentPersonas];
  
  // Find persona by _id
  const currentPersona = allPersonas.find((persona: any) => {
    if (typeof persona === 'string') {
      return false; // Skip string personas, we need object personas with _id
    }
    const personaIdToMatch = typeof persona._id === 'object' && persona._id.$oid ? persona._id.$oid : persona._id;
    return personaIdToMatch === personaId;
  });

  if (!currentPersona) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Persona Not Found</h2>
            <p className="text-slate-600">The requested persona could not be found.</p>
            <Button 
              onClick={() => navigate(`/workspace/${slug}/personas`)}
              className="mt-4"
            >
              Back to Personas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle both old string format and new object format
  const personaData = typeof currentPersona === 'string' ? {} : currentPersona as any;
  
  // Use persona data directly from MongoDB structure - map correct fields
  const displayPersona = {
    id: currentPersona._id || personaId,
    name: personaData.name || 'Unnamed Persona',
    title: personaData.title || '',
    description: personaData.description || '',
    summary: personaData.summary || '',
    painPoints: personaData.painPoints || [],
    goals: personaData.goals || [],
    triggers: personaData.triggers || [],
    channels: personaData.channels || [],
    objections: personaData.objections || [],
    messaging: personaData.messaging || '',
    created: personaData.createdAt ? new Date(personaData.createdAt).toLocaleDateString() : '',
    status: personaData.status || 'active',
    priority: personaData.priority || 'medium',
    influence: personaData.decisionInfluence || '',
    jobTitles: personaData.jobTitles || [],
    okrs: personaData.okrs || [],
    // Map backend fields correctly
    seniority: personaData.seniority || '',
    primaryResponsibilities: personaData.primaryResponsibilities || [],
    responsibilities: personaData.responsibilities || personaData.primaryResponsibilities || [],
    challenges: personaData.challenges || []
  };

  // Function to enhance persona with Claude AI - REMOVED

  const handleEdit = () => {
    setEditedPersona({ ...personaData });
    setEditDialogOpen(true);
  };

  const handleSave = async (updatedPersonaData: any) => {
    if (!icpData || !workspace || !personaData || !slug) return;
    
    try {
      // Call the API to update the persona
      const response = await icpWizardApi.updatePersona(slug, personaData.id.toString(), updatedPersonaData);
      
      if (response.success && response.persona) {
        // Update local state
        const updatedICPData = {
          ...icpData,
          personas: icpData.personas.map((p: any) => 
            p.id === personaData.id ? response.persona : p
          )
        };
        
        setIcpData(updatedICPData);
        storageService.saveICPData(updatedICPData);
        setEditDialogOpen(false);
        setIsEditing(false);
        
        // Show success message (you can add a toast here)
        console.log('Persona updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update persona');
      }
    } catch (error) {
      console.error('Error saving persona:', error);
      // Show error message (you can add a toast here)
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    
    try {
      // Here you would typically delete from backend
      console.log('Deleting persona:', personaData.name);
      navigate(`/workspace/${slug}/personas`);
    } catch (error) {
      console.error('Error deleting persona:', error);
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'Decision Maker': return 'bg-purple-100 text-purple-800';
      case 'Champion': return 'bg-blue-100 text-blue-800';
      case 'End User': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/workspace/${slug}/personas`} className="hover:text-foreground transition-colors">Personas</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{personaData.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{personaData.name}</h1>
            <p className="text-sm text-slate-600 mt-1">Persona Details & Messaging</p>
          </div>
          <div className="flex items-center space-x-3">
            {getUserRole() && (
              <Badge variant="outline" className="text-xs">
                {getUserRole() === 'owner' ? 'Owner' : getUserRole() === 'editor' ? 'Editor' : 'Viewer'}
              </Badge>
            )}
            {canEdit() && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Persona
              </Button>
            )}
            {canEdit() && (
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Persona Overview */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Persona Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {displayPersona.description || displayPersona.summary || 'No description available'}
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  {displayPersona.influence && (
                    <Badge className={`${getInfluenceColor(displayPersona.influence)} text-xs`}>
                      {displayPersona.influence}
                    </Badge>
                  )}
                </div>
                {displayPersona.title && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Job Title</h4>
                    <p className="text-sm text-gray-600">{displayPersona.title}</p>
                  </div>
                )}
                {displayPersona.seniority && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Seniority Level</h4>
                    <p className="text-sm text-gray-600">{displayPersona.seniority}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Primary Responsibilities */}
            {displayPersona.primaryResponsibilities && displayPersona.primaryResponsibilities.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Primary Responsibilities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayPersona.primaryResponsibilities.map((responsibility: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{responsibility}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* OKRs (Objectives & Key Results) */}
            {displayPersona.okrs && displayPersona.okrs.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>OKRs (Objectives & Key Results)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayPersona.okrs.map((okr: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{okr}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pain Points */}
            {displayPersona.painPoints && displayPersona.painPoints.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>Pain Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayPersona.painPoints.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals & Objectives */}
            {displayPersona.goals && displayPersona.goals.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>Goals & Objectives</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayPersona.goals.map((goal: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{goal}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Triggers */}
              {displayPersona.triggers && displayPersona.triggers.length > 0 && (
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span>Triggers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {displayPersona.triggers.map((trigger: string, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          • {trigger}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferred Channels */}
              {displayPersona.channels && displayPersona.channels.length > 0 && (
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span>Preferred Channels</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {displayPersona.channels.map((channel: string, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          • {channel}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Related Pages */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span>Related Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Target className="w-4 h-4 mr-2" />
                      View Segments
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/products`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Building2 className="w-4 h-4 mr-2" />
                      View Products
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      All Personas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Persona Summary */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayPersona.title && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Job Title</h4>
                      <p className="text-sm text-gray-600">{displayPersona.title}</p>
                    </div>
                  )}
                  {displayPersona.seniority && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Seniority</h4>
                      <p className="text-sm text-gray-600">{displayPersona.seniority}</p>
                    </div>
                  )}
                  {displayPersona.influence && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Decision Influence</h4>
                      <Badge className={`${getInfluenceColor(displayPersona.influence)} text-xs`}>
                        {displayPersona.influence}
                      </Badge>
                    </div>
                  )}
                  {displayPersona.created && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Created</h4>
                      <p className="text-sm text-gray-600">{displayPersona.created}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Titles */}
            {displayPersona.jobTitles && displayPersona.jobTitles.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Job Titles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayPersona.jobTitles.map((title: string, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Objections */}
            {displayPersona.objections && displayPersona.objections.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Common Objections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayPersona.objections.map((objection: string, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        • {objection}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Persona Modal */}
      <EditPersonaModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
        personaData={editedPersona}
      />
    </div>
  );
};

export default PersonaDetails; 