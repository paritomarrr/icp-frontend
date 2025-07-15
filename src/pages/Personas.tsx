
import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Users, Search, Plus, Building2 } from 'lucide-react';
import { AddPersonaModal } from '@/components/modals';
import { icpWizardApi, PersonaData } from '@/lib/api';

const Personas = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [addPersonaModalOpen, setAddPersonaModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      const data = storageService.getICPData(slug);
      setIcpData(data);
    }
  }, [slug]);

  const handleAddPersona = async (personaData: PersonaData) => {
    if (!slug) return;
    
    try {
      const result = await icpWizardApi.addPersona(slug, personaData);
      
      if (result.success) {
        console.log('Persona added successfully:', result.persona);
        // Refresh the ICP data to show the new persona
        const data = storageService.getICPData(slug);
        if (data) {
          setIcpData({ ...data }); // Force re-render
        }
        // You might want to add a toast notification here
      } else {
        console.error('Failed to add persona:', result.error);
        // You might want to show an error message to the user
      }
    } catch (error) {
      console.error('Error adding persona:', error);
    }
  };

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  // Get personas from the workspace data - include both root personas and personas within segments
  const rootPersonas = Array.isArray(icpData?.personas) ? icpData.personas : [];
  const segments = Array.isArray(icpData?.segments) ? icpData.segments : [];
  
  // Collect all personas from segments
  const segmentPersonas: any[] = [];
  segments.forEach((segment: any) => {
    if (segment.personas && Array.isArray(segment.personas)) {
      // Add segment info to each persona to identify which segment they belong to
      const personasWithSegment = segment.personas.map((persona: any) => ({
        ...persona,
        segmentName: segment.name,
        segmentId: segment._id
      }));
      segmentPersonas.push(...personasWithSegment);
    }
  });
  
  // Combine all personas
  const allPersonasRaw = [...rootPersonas, ...segmentPersonas];
  
  // Transform the personas array into the expected format using MongoDB structure
  const allPersonas = allPersonasRaw.map((persona: any, index: number) => {
    return {
      id: persona._id?.$oid || persona._id || index + 1,
      title: persona.name || persona.title || `Persona ${index + 1}`,
      summary: `${persona.name || 'Unknown Name'} - ${persona.title || 'Unknown Title'}${persona.segmentName ? ` (${persona.segmentName} segment)` : ''}`,
      created: persona.createdAt ? new Date(persona.createdAt).toLocaleDateString() : 'Jul 12, 2025',
      status: persona.status || 'active',
      priority: persona.priority || 'medium',
      influence: persona.decisionInfluence || 'Decision Maker',
      painPoints: persona.painPoints || [],
      goals: persona.goals || [],
      department: '',
      seniority: persona.seniority || '',
      industry: '',
      company: '',
      location: '',
      description: `${persona.name} - ${persona.title}`,
      budget: '',
      teamSize: '',
      channels: persona.channels || [],
      objections: persona.objections || [],
      responsibilities: persona.primaryResponsibilities || persona.responsibilities || [],
      challenges: persona.challenges || [],
      segmentName: persona.segmentName || '',
      segmentId: persona.segmentId || ''
    };
  });

  // Filter personas based on search and filter
  const filteredPersonas = allPersonas.filter(persona => {
    const matchesSearch = persona.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || persona.priority === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'Decision Maker': return 'bg-purple-100 text-purple-800';
      case 'Champion': return 'bg-blue-100 text-blue-800';
      case 'End User': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-octave-light-1 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 text-xs text-slate-400 mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-slate-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700">Personas</span>
        </nav>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 mb-1">
              Buyer Personas
            </h1>
            <p className="text-xs text-slate-500">
              Understand your target audience and their decision-making process
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setAddPersonaModalOpen(true)}>
              <Plus className="w-3 h-3 mr-1" />
              Add Persona
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
            <Input
              placeholder="Search personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-foreground">Filter:</span>
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedFilter('all')}
            >
              All Personas
            </Button>
            <Button
              variant={selectedFilter === 'high' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedFilter('high')}
            >
              High Priority
            </Button>
            <Button
              variant={selectedFilter === 'medium' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedFilter('medium')}
            >
              Medium Priority
            </Button>
          </div>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {filteredPersonas.map((persona, idx) => (
            <Card
              key={persona.title}
              className="cursor-pointer shadow-md border hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(`/workspace/${slug}/personas/${persona.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 mb-2">
                  {persona.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {persona.summary && (
                    <div className="text-xs text-slate-600 line-clamp-2">
                      {persona.summary}
                    </div>
                  )}
                  
                  {/* Simple metrics */}
                  <div className="text-xs text-slate-500 space-y-1">
                    {persona.painPoints?.length > 0 && (
                      <div>Pain Points: {persona.painPoints.length}</div>
                    )}
                    {persona.goals?.length > 0 && (
                      <div>Goals: {persona.goals.length}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Persona Overview */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Persona Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { metric: 'Total Personas', value: filteredPersonas.length.toString(), icon: '👤' },
                  { metric: 'Decision Makers', value: filteredPersonas.filter(p => p.influence === 'Decision Maker').length.toString(), icon: '🎯' }
                ].map((item) => (
                  <div key={item.metric} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{item.metric}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Segments */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-xl">🔀</span>
                <span className="text-base">Market Segments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-slate-700">
                  Enterprise, Mid-Market, SMB segments
                </div>
                <Link to={`/workspace/${slug}/segments`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Building2 className="w-3 h-3 mr-2" />
                    View All Segments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-xl">📦</span>
                <span className="text-base">Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-slate-700">
                  {workspace.name} - Main product offering
                </div>
                <Link to={`/workspace/${slug}/products`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Building2 className="w-3 h-3 mr-2" />
                    View All Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Persona Modal */}
      <AddPersonaModal
        open={addPersonaModalOpen}
        onOpenChange={setAddPersonaModalOpen}
        onSave={handleAddPersona}
      />
    </div>
  );
};

export default Personas;
