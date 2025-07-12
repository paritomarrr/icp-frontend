
import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Users, Download, ArrowRight, Search, Plus, MoreHorizontal, Eye, Copy, ChevronRight, Users2, Target, TrendingUp, Building2 } from 'lucide-react';

const Personas = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [selectedIndex] = useState(0); // not used for details panel anymore
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (slug) {
      const data = storageService.getICPData(slug);
      setIcpData(data);
    }
  }, [slug]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  // Get the latest enrichment version
  const enrichment = icpData?.icpEnrichmentVersions;
  console.log('icpData:', icpData);
  console.log('Enrichment:', enrichment);
  
  // Find the latest version by getting the last key
  const latestVersionKey = enrichment ? Object.keys(enrichment).sort().pop() : null;
  const latestVersion = latestVersionKey ? enrichment[latestVersionKey] : null;
  
  console.log('Latest version key:', latestVersionKey);
  console.log('Latest version data:', latestVersion);

  // Extract persona names from the persona content
  const parsePersonaNames = (personaContent: string) => {
    if (!personaContent) return [];
    const lines = personaContent.split('\n');
    const personas = [];
    for (const line of lines) {
      if (line.includes('Persona') && !line.includes('analysis')) {
        personas.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    }
    return personas.length > 0 ? personas : ['Chief Marketing Officer', 'Vice President of Marketing', 'Head of Content Strategy'];
  };

  const personaNames = parsePersonaNames(latestVersion?.personas || '');

  // Persona summary data for card display
  const allPersonas = [
    {
      id: 1,
      title: 'Chief Marketing Officer',
      summary: 'The Chief Marketing Officer drives revenue growth by orchestrating demand generation, brand strategy, and cross-functional alignment.',
      created: 'Jun 18, 2025',
      status: 'active',
      priority: 'high',
      influence: 'Decision Maker',
      painPoints: ['Revenue attribution', 'Cross-functional alignment', 'Budget optimization'],
      goals: ['Increase pipeline velocity', 'Improve conversion rates', 'Scale demand generation']
    },
    {
      id: 2,
      title: 'Vice President of Marketing',
      summary: 'A senior marketing executive who owns the strategic direction and operational effectiveness of the marketing team.',
      created: 'Jun 18, 2025',
      status: 'active',
      priority: 'medium',
      influence: 'Influencer',
      painPoints: ['Team scaling', 'Technology stack integration', 'Performance measurement'],
      goals: ['Optimize marketing operations', 'Improve team productivity', 'Enhance customer experience']
    },
    {
      id: 3,
      title: 'Head of Content Strategy',
      summary: 'This executive owns the strategic direction and operational effectiveness of an organization\'s content marketing efforts.',
      created: 'Jun 18, 2025',
      status: 'active',
      priority: 'medium',
      influence: 'User',
      painPoints: ['Content ROI measurement', 'Distribution strategy', 'Audience engagement'],
      goals: ['Increase content engagement', 'Improve conversion rates', 'Scale content production']
    },
  ];

  // Filter personas based on search and filter
  const filteredPersonas = allPersonas.filter(persona => {
    const matchesSearch = persona.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || persona.priority === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'Decision Maker': return 'bg-purple-100 text-purple-800';
      case 'Influencer': return 'bg-blue-100 text-blue-800';
      case 'User': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Personas</span>
        </nav>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">
              Buyer Personas
            </h1>
            <p className="text-xs text-muted-foreground">
              Understand your target audience and their decision-making process
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-border hover:bg-accent text-xs">
              <Download className="w-3 h-3 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
              <Plus className="w-3 h-3 mr-2" />
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
              className={`cursor-pointer border-0 transition-all duration-200 group shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl`}
              onClick={() => navigate(`/personas/${idx}`)}
            >
              <CardHeader className="pb-2">
                {/* Colored header bar for persona role/title */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block bg-sky-200 text-sky-800 text-xs font-semibold px-3 py-1 rounded-t-md rounded-b mb-1 tracking-wide">
                    {persona.title}
                  </span>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {/* Prominent persona name/title */}
                <CardTitle className="text-base font-bold text-slate-900 mb-1 truncate">
                  {persona.title}
                </CardTitle>
                {/* Pill-shaped, color-coded badges in a single row */}
                <div className="flex items-center space-x-2 mt-1 mb-1">
                  <Badge className={`${getPriorityColor(persona.priority)} text-xs rounded-full px-2 py-0.5 font-medium`}>{persona.priority} Priority</Badge>
                  <Badge className={`${getStatusColor(persona.status)} text-xs rounded-full px-2 py-0.5 font-medium`}>{persona.status}</Badge>
                  <Badge className={`${getInfluenceColor(persona.influence)} text-xs rounded-full px-2 py-0.5 font-medium`}>{persona.influence}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-slate-600 mb-2 line-clamp-2">
                    {persona.summary}
                  </div>
                  {/* Divider before metrics */}
                  <div className="border-t border-slate-100 my-2"></div>
                  {/* Metrics row */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center"><Target className="w-3 h-3 text-blue-500 mr-1" />Pain Points: {persona.painPoints.length}</span>
                      <span className="flex items-center"><TrendingUp className="w-3 h-3 text-green-500 mr-1" />Goals</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Created: {persona.created}</div>
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
              <CardTitle className="flex items-center space-x-2">
                <span className="text-xl">👥</span>
                <span className="text-base">Persona Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { metric: 'Total Personas', value: filteredPersonas.length.toString(), icon: '👤' },
                  { metric: 'Decision Makers', value: filteredPersonas.filter(p => p.influence === 'Decision Maker').length.toString(), icon: '🎯' },
                  { metric: 'Avg. Pain Points', value: '3.2', icon: '💡' },
                  { metric: 'Engagement Rate', value: '87%', icon: '📈' }
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
    </div>
  );
};

export default Personas;
