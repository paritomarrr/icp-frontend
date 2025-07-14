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
import { Building2, Users, Target, TrendingUp, Download, Edit, Save, X, Plus, Trash2, Eye, Copy, MoreHorizontal, ChevronRight, Sparkles, Briefcase, Award, CheckCircle } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { icpWizardApi } from '@/lib/api';
import { usePermissions } from '@/hooks/use-permissions';
import { EditSegmentModal } from '@/components/modals';

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
  
  // Debug: Log segmentId and available segment IDs
  console.log('segmentId from URL:', segmentId);
  console.log('Available segment IDs:', rootSegments.map(s => typeof s._id === 'object' && s._id.$oid ? s._id.$oid : s._id));
  // Find segment by _id instead of array index
  const currentSegment = rootSegments.find((segment: any) => {
    if (typeof segment === 'string') {
      return false; // Skip string segments, we need object segments with _id
    }
    // Support both string and object _id (MongoDB $oid)
    const segId = typeof segment._id === 'object' && segment._id.$oid ? segment._id.$oid : segment._id;
    return segId === segmentId;
  });

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

  // Handle both old string format and new object format
  const segmentDesc = typeof currentSegment === 'string' ? currentSegment : currentSegment.name;
  const currentSegmentData = typeof currentSegment === 'string' ? {} : currentSegment as any;
  
  // Extract meaningful segment name from description
  let segmentName = currentSegmentData.name || `Segment ${segmentId}`;
  
  // If no name in segmentData, try to extract from description
  if (!currentSegmentData.name && typeof segmentDesc === 'string') {
    if (segmentDesc.includes('manufacturing')) {
      segmentName = 'Enterprise Manufacturing';
    } else if (segmentDesc.includes('engineering firms')) {
      segmentName = 'Mid-size Engineering Firms';
    } else if (segmentDesc.includes('construction')) {
      segmentName = 'Construction & Infrastructure';
    } else if (segmentDesc.includes('technology startups') || segmentDesc.includes('startups')) {
      segmentName = 'Technology Startups';
    } else {
      // Extract the first part before any size/region descriptors
      const match = segmentDesc.match(/^([^(]+)/);
      if (match) {
        segmentName = match[1].trim();
        // Clean up common prefixes
        segmentName = segmentName.replace(/^(Large|Mid-sized|Small)\s+/, '');
      }
    }
  }

  // Try to find matching enrichment data
  const enrichmentMatch = segmentsEnrichment.find((s: any) => 
    s.name && (segmentDesc.toLowerCase().includes(s.name.toLowerCase()) ||
               s.name.toLowerCase().includes(segmentName.toLowerCase()))
  );

  // Transform segment data for display
  const segmentData = {
    id: currentSegmentData._id || segmentId,
    name: enrichmentMatch?.name || segmentName,
    description: currentSegmentData.description || segmentDesc,
    firmographics: currentSegmentData.firmographics || [
      { label: 'Size', value: enrichmentMatch?.size || currentSegmentData.size || '100-500 employees' },
      { label: 'Region', value: enrichmentMatch?.region || currentSegmentData.region || 'Global' },
      { label: 'Budget', value: enrichmentMatch?.budget || currentSegmentData.budget || '$200K-500K' },
      { label: 'Focus', value: enrichmentMatch?.focus || currentSegmentData.focus || 'Growth' },
      { label: 'Employees', value: currentSegmentData.employees || '50 - 500 employees' }
    ],
    benefits: currentSegmentData.benefits || `High-value customers with proven need for ${icpData?.companyName || 'Your Company'} solutions`,
    awarenessLevel: currentSegmentData.awarenessLevel || 'Solution',
    priority: currentSegmentData.priority || 'Medium',
    status: currentSegmentData.status || 'active',
    marketSize: enhancedData?.marketSize || currentSegmentData.marketSize || '$500M - $2B',
    growthRate: enhancedData?.growthRate || currentSegmentData.growthRate || '12% YoY',
    qualification: currentSegmentData.qualification || {
      idealCriteria: enhancedData?.qualification?.idealCriteria || ['Revenue > $10M', 'Technology adoption', 'Growth stage'],
      lookalikeCompanies: enhancedData?.qualification?.lookalikeCompanies || ['salesforce.com', 'hubspot.com', 'slack.com'],
      disqualifyingCriteria: enhancedData?.qualification?.disqualifyingCriteria || ['Less than 50 employees', 'Pre-revenue stage', 'Legacy systems only']
    },
    size: currentSegmentData.size || '',
    region: currentSegmentData.region || '',
    budget: currentSegmentData.budget || '',
    focus: currentSegmentData.focus || '',
    industry: currentSegmentData.industry || '',
    companySize: currentSegmentData.companySize || '',
    revenue: currentSegmentData.revenue || '',
    geography: currentSegmentData.geography || '',
    employees: currentSegmentData.employees || '',
    customerCount: currentSegmentData.customerCount || '',
    competitiveIntensity: currentSegmentData.competitiveIntensity || '',
    characteristics: currentSegmentData.characteristics || [],
    industries: currentSegmentData.industries || [],
    companySizes: currentSegmentData.companySizes || [],
    technologies: currentSegmentData.technologies || [],
    qualificationCriteria: currentSegmentData.qualificationCriteria || [],
    painPoints: currentSegmentData.painPoints || [],
    buyingProcesses: currentSegmentData.buyingProcesses || []
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
      console.log(`Enhancing segment: ${segmentDesc}`);
      const result = await icpWizardApi.generateSegmentDetails(segmentDesc, companyData);
      
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

  const handleSave = async (updatedSegmentData: any) => {
    if (!icpData || !workspace || !segmentData || !slug) return;
    
    try {
      // Call the API to update the segment
      const response = await icpWizardApi.updateSegment(slug, segmentData.id.toString(), updatedSegmentData);
      
      if (response.success && response.segment) {
        // Update local state
        const updatedICPData = {
          ...icpData,
          segments: icpData.segments.map((s: any) => 
            s.id === segmentData.id ? response.segment : s
          )
        };
        
        setIcpData(updatedICPData);
        storageService.saveICPData(updatedICPData);
        setEditDialogOpen(false);
        setIsEditing(false);
        
        // Show success message (you can add a toast here)
        console.log('Segment updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update segment');
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      // Show error message (you can add a toast here)
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
            {/* Add Enhance with AI, Edit, Delete as needed */}
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
                </div>
              </CardContent>
            </Card>

            {/* Firmographics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span>Firmographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {segmentData.firmographics?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-xs font-medium text-slate-700 capitalize">{item.label}</span>
                      <span className="text-xs text-slate-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pain Points */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="w-4 h-4 text-red-600" />
                  <span>Pain Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {segmentData.painPoints?.map((point: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                      • {point}
                    </div>
                  )) || <div className="text-xs text-slate-500">No pain points defined</div>}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  {segmentData.benefits}
                </div>
              </CardContent>
            </Card>

            {/* Qualification Criteria */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Qualification Criteria</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-xs">Ideal Criteria:</span>
                    <ul className="list-disc ml-5">
                      {segmentData.qualification?.idealCriteria?.map((c: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-600">{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-xs">Lookalike Companies:</span>
                    <ul className="list-disc ml-5">
                      {segmentData.qualification?.lookalikeCompanies?.map((c: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-600">{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-xs">Disqualifying Criteria:</span>
                    <ul className="list-disc ml-5">
                      {segmentData.qualification?.disqualifyingCriteria?.map((c: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-600">{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Characteristics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Award className="w-4 h-4 text-orange-600" />
                  <span>Characteristics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {segmentData.characteristics?.map((char: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                      • {char}
                    </div>
                  )) || <div className="text-xs text-slate-500">No characteristics defined</div>}
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Segment Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Market Size', value: segmentData.marketSize },
                    { metric: 'Growth Rate', value: segmentData.growthRate },
                    { metric: 'Total Companies', value: segmentData.customerCount || 'N/A' },
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

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Eye className="w-3 h-3 mr-2" />
                    View Accounts
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
          </div>
        </div>
      </div>

      {/* Edit Segment Modal */}
      <EditSegmentModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
        segmentData={editedSegment}
      />
    </div>
  );
};

export default SegmentDetails; 