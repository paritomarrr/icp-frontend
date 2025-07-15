import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Building2, Users, Target, Download, ChevronRight, Briefcase, Award, CheckCircle, Eye, Copy, ArrowRight } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { usePermissions } from '@/hooks/use-permissions';

const SegmentDetails = () => {
  const { slug, segmentId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Get segments directly from MongoDB structure
  const segments = Array.isArray(icpData?.segments) ? icpData.segments : [];
  
  // Find segment by _id
  const currentSegment = segments.find((segment: any) => {
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

  // Use segment data directly from MongoDB structure
  const segmentData = {
    _id: currentSegment._id,
    id: currentSegment._id?.toString() || segmentId,
    name: currentSegment.name || 'Unnamed Segment',
    industry: currentSegment.industry || '',
    companySize: currentSegment.companySize || '',
    geography: currentSegment.geography || '',
    awarenessLevel: currentSegment.awarenessLevel || '',
    priority: currentSegment.priority || 'medium',
    status: currentSegment.status || 'active',
    locations: (currentSegment as any).locations || [],
    characteristics: currentSegment.characteristics || [],
    industries: (currentSegment as any).industries || [],
    companySizes: (currentSegment as any).companySizes || [],
    technologies: (currentSegment as any).technologies || [],
    qualificationCriteria: (currentSegment as any).qualificationCriteria || [],
    signals: (currentSegment as any).signals || [],
    painPoints: currentSegment.painPoints || [],
    buyingProcesses: (currentSegment as any).buyingProcesses || [],
    specificBenefits: (currentSegment as any).specificBenefits || [],
    ctaOptions: (currentSegment as any).ctaOptions || [],
    qualification: (currentSegment as any).qualification || {
      tier1Criteria: [],
      idealCriteria: [],
      lookalikeCompanies: [],
      disqualifyingCriteria: []
    },
    personas: (currentSegment as any).personas || [],
    createdAt: (currentSegment as any).createdAt,
    updatedAt: (currentSegment as any).updatedAt,
    // Add fields for display compatibility
    description: `${currentSegment.name} - ${currentSegment.industry} segment`,
    firmographics: [
      { label: 'Industry', value: currentSegment.industry || 'N/A' },
      { label: 'Company Size', value: currentSegment.companySize || 'N/A' },
      { label: 'Geography', value: currentSegment.geography || 'N/A' },
      { label: 'Awareness Level', value: currentSegment.awarenessLevel || 'N/A' }
    ],
    benefits: (currentSegment as any).specificBenefits?.join(', ') || 'Benefits not specified',
    marketSize: 'Not specified',
    growthRate: 'Not specified',
    customerCount: 'Not specified'
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
            <p className="text-sm text-slate-600 mt-1">Segment Details & Information</p>
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
                  {segmentData.characteristics?.length > 0 ? segmentData.characteristics.map((char: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                      • {char}
                    </div>
                  )) : <div className="text-xs text-slate-500">No characteristics defined</div>}
                </div>
              </CardContent>
            </Card>

            {/* Personas in this Segment */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Personas ({segmentData.personas?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {segmentData.personas?.length > 0 ? segmentData.personas.map((persona: any, idx: number) => (
                    <Button
                      key={persona._id || idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-xs h-auto py-3"
                      onClick={() => navigate(`/workspace/${slug}/personas/${persona._id?.$oid || persona._id}`)}
                    >
                      <div className="flex flex-col items-start">
                        <div className="font-semibold text-slate-800">{persona.name}</div>
                        <div className="text-slate-600">{persona.title} • {persona.seniority}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-xs bg-purple-100 text-purple-800">
                          {persona.decisionInfluence}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </Button>
                  )) : (
                    <div className="text-xs text-slate-500 text-center py-4">
                      No personas defined for this segment
                    </div>
                  )}
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
    </div>
  );
};

export default SegmentDetails; 