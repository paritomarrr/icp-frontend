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
import { Building2, Users, Target, TrendingUp, Download, Edit, Save, X, Plus, Trash2, Eye, Copy, MoreHorizontal, ChevronRight, Sparkles } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { icpWizardApi } from '@/lib/api';
import { usePermissions } from '@/hooks/use-permissions';

const SegmentDetails = () => {
  const { slug, segmentId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedSegment, setEditedSegment] = useState<any>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);
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
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
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
              <p className="text-lg text-slate-600">Loading segment details...</p>
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
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No ICP Data Found</h2>
            <p className="text-slate-600">Please generate ICP data first.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get segments from the workspace data and ICP enrichment versions
  const rootSegments = Array.isArray(icpData?.segments) ? icpData.segments : [];
  const enrichmentData = icpData?.icpEnrichmentVersions;
  const latestVersion = enrichmentData ? Math.max(...Object.keys(enrichmentData).map(Number)) : null;
  const segmentsEnrichment = latestVersion && enrichmentData?.[latestVersion]?.segments || [];
  
  const segIndex = segmentId ? parseInt(segmentId, 10) - 1 : 0;
  const currentSegment = rootSegments[segIndex];

  if (!currentSegment) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Segment Not Found</h2>
            <p className="text-slate-600">The requested segment could not be found.</p>
            <Button 
              onClick={() => navigate(`/workspace/${slug}/segments`)}
              className="mt-4"
            >
              Back to Segments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Extract meaningful segment name from description
  let segmentName = `Segment ${segIndex + 1}`;
  
  // Look for key patterns to extract segment names
  if (currentSegment.includes('manufacturing')) {
    segmentName = 'Enterprise Manufacturing';
  } else if (currentSegment.includes('engineering firms')) {
    segmentName = 'Mid-size Engineering Firms';
  } else if (currentSegment.includes('construction')) {
    segmentName = 'Construction & Infrastructure';
  } else if (currentSegment.includes('technology startups') || currentSegment.includes('startups')) {
    segmentName = 'Technology Startups';
  } else {
    // Extract the first part before any size/region descriptors
    const match = currentSegment.match(/^([^(]+)/);
    if (match) {
      segmentName = match[1].trim();
      // Clean up common prefixes
      segmentName = segmentName.replace(/^(Large|Mid-sized|Small)\s+/, '');
    }
  }

  // Try to find matching enrichment data
  const enrichmentMatch = segmentsEnrichment.find((s: any) => 
    s.name && (currentSegment.toLowerCase().includes(s.name.toLowerCase()) ||
               s.name.toLowerCase().includes(segmentName.toLowerCase()))
  );

  // Transform segment data for display
  const segmentData = {
    id: segIndex + 1,
    name: enrichmentMatch?.name || segmentName,
    description: currentSegment,
    firmographics: [
      { label: 'Size', value: enrichmentMatch?.size || '100-500 employees' },
      { label: 'Region', value: enrichmentMatch?.region || 'Global' },
      { label: 'Budget', value: enrichmentMatch?.budget || '$200K-500K' },
      { label: 'Focus', value: enrichmentMatch?.focus || 'Growth' },
      { label: 'Employees', value: '50 - 500 employees' }
    ],
    benefits: `High-value customers with proven need for ${icpData?.companyName || 'Your Company'} solutions`,
    awarenessLevel: 'Solution',
    priority: 'Medium',
    status: 'active',
    marketSize: enhancedData?.marketSize || '$500M - $2B',
    growthRate: enhancedData?.growthRate || '12% YoY',
    qualification: {
      tier1Criteria: enhancedData?.qualification?.idealCriteria || ['Revenue > $10M', 'Technology adoption', 'Growth stage'],
      lookalikeCompanies: enhancedData?.qualification?.lookalikeCompanies || ['salesforce.com', 'hubspot.com', 'slack.com'],
      disqualifyingCriteria: enhancedData?.qualification?.disqualifyingCriteria || ['Less than 50 employees', 'Pre-revenue stage', 'Legacy systems only']
    }
  };

  // Function to enhance segment with Claude AI
  const enhanceSegmentWithAI = async () => {
    if (!icpData) return;
    
    setIsEnhancing(true);
    const companyData = {
      companyName: icpData.companyName || workspace?.companyName,
      products: icpData.products,
      companyUrl: icpData.companyUrl || workspace?.companyUrl
    };

    try {
      console.log(`Enhancing segment: ${currentSegment}`);
      const result = await icpWizardApi.generateSegmentDetails(currentSegment, companyData);
      
      if (result.success && result.data) {
        setEnhancedData(result.data);
        console.log('Enhanced segment data:', result.data);
      }
    } catch (error) {
      console.error('Error enhancing segment:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleEdit = () => {
    setEditedSegment({ ...segmentData });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editedSegment) return;
    
    try {
      // Here you would typically save to backend
      // For now, we'll just update the local state
      console.log('Saving segment:', editedSegment);
      setEditDialogOpen(false);
      setIsEditing(false);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error saving segment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      // Here you would typically delete from backend
      console.log('Deleting segment:', segmentData.name);
      navigate(`/workspace/${slug}/segments`);
    } catch (error) {
      console.error('Error deleting segment:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/workspace/${slug}/segments`} className="hover:text-foreground transition-colors">Segments</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{segmentData.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{segmentData.name}</h1>
            <p className="text-sm text-slate-600 mt-1">Segment Details & Messaging</p>
          </div>
          <div className="flex items-center space-x-3">
            {getUserRole() && (
              <Badge variant="outline" className="text-xs">
                {getUserRole() === 'owner' ? 'Owner' : getUserRole() === 'editor' ? 'Editor' : 'Viewer'}
              </Badge>
            )}
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
              onClick={enhanceSegmentWithAI}
              disabled={isEnhancing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
            {canEdit() && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Segment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Segment: {segmentData.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Segment Name</Label>
                      <Input
                        id="name"
                        value={editedSegment?.name || ''}
                        onChange={(e) => setEditedSegment({ ...editedSegment, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editedSegment?.description || ''}
                        onChange={(e) => setEditedSegment({ ...editedSegment, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="benefits">Benefits</Label>
                      <Textarea
                        id="benefits"
                        value={editedSegment?.benefits || ''}
                        onChange={(e) => setEditedSegment({ ...editedSegment, benefits: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={editedSegment?.priority || 'medium'}
                        onChange={(e) => setEditedSegment({ ...editedSegment, priority: e.target.value })}
                        className="border rounded px-3 py-2"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
            {/* Segment Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Segment Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {segmentData.description}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getPriorityColor(segmentData.priority)} text-xs`}>
                    {segmentData.priority} Priority
                  </Badge>
                  <Badge className={`${getStatusColor(segmentData.status)} text-xs`}>
                    {segmentData.status}
                  </Badge>
                  {enhancedData && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Firmographics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>Firmographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {segmentData.firmographics.map((firmo: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-700">{firmo.label}</h4>
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                        {firmo.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits & Awareness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                    {segmentData.benefits}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Awareness Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Unaware', 'Problem', 'Solution', 'Product', 'Most Aware'].map((level) => (
                      <div key={level} className={`p-2 rounded text-xs ${level === segmentData.awarenessLevel ? 'bg-blue-100 text-blue-800' : 'bg-slate-50'}`}>
                        {level}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Qualification Criteria */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Qualification Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Tier 1 Criteria</h4>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                    {segmentData.qualification.tier1Criteria.map((criteria: string, idx: number) => (
                      <div key={idx}>• {criteria}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Lookalike Companies</h4>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                    {segmentData.qualification.lookalikeCompanies.map((company: string, idx: number) => (
                      <div key={idx}>• {company}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Disqualifying Criteria</h4>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                    {segmentData.qualification.disqualifyingCriteria.map((criteria: string, idx: number) => (
                      <div key={idx}>• {criteria}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Eye className="w-3 h-3 mr-2" />
                    View Companies
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Segment
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Download className="w-3 h-3 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Pages */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Related Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to={`/workspace/${slug}/products`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Building2 className="w-3 h-3 mr-2" />
                      View Products
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Users className="w-3 h-3 mr-2" />
                      View Personas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Segment Metrics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Segment Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Market Size', value: segmentData.marketSize },
                    { metric: 'Growth Rate', value: segmentData.growthRate },
                    { metric: 'Total Companies', value: '1,247' },
                    { metric: 'Accounts Reached', value: '324' }
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <p className="text-xs font-medium text-slate-700">{item.metric}</p>
                        <p className="text-sm font-bold text-slate-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentDetails; 