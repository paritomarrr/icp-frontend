import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Building2, Users, Target, ChevronRight, TrendingUp, Edit, User } from 'lucide-react';
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
    <div className="min-h-screen bg-octave-light-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/workspace/${slug}/segments`} className="hover:text-foreground transition-colors">Segments</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{segmentData.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/30 p-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-slate-900 mb-1">
                {segmentData.name}
              </h1>
              <p className="text-xs text-slate-600">
                Segment Details & Analysis
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${getPriorityColor(segmentData.priority)} text-xs`}>
                {segmentData.priority} Priority
              </Badge>
              <Badge className={`${getStatusColor(segmentData.status)} text-xs`}>
                {segmentData.status}
              </Badge>
              {canEdit() && (
                <Button size="sm" variant="outline" className="text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit Segment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Segment Overview */}
            <Card className="shadow-sm border border-slate-200/60 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Segment Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Industry</p>
                    <p className="text-sm text-slate-900">{segmentData.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Company Size</p>
                    <p className="text-sm text-slate-900">{segmentData.companySize || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Geography</p>
                    <p className="text-sm text-slate-900">{segmentData.geography || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Awareness Level</p>
                    <p className="text-sm text-slate-900">{segmentData.awarenessLevel || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pain Points */}
            {segmentData.painPoints && segmentData.painPoints.length > 0 && (
              <Card className="shadow-sm border border-slate-200/60 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Target className="w-4 h-4 text-red-600" />
                    <span>Pain Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segmentData.painPoints.map((point: string, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border">
                        • {point}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specific Benefits */}
            {segmentData.specificBenefits && segmentData.specificBenefits.length > 0 && (
              <Card className="shadow-sm border border-slate-200/60 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Specific Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segmentData.specificBenefits.map((benefit: string, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700 p-3 bg-green-50 rounded-lg border border-green-200">
                        • {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Qualification Criteria */}
            {segmentData.qualification && Object.keys(segmentData.qualification).some(key => 
              segmentData.qualification[key] && segmentData.qualification[key].length > 0
            ) && (
              <Card className="shadow-sm border border-slate-200/60 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Qualification Criteria</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {segmentData.qualification.tier1Criteria && segmentData.qualification.tier1Criteria.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Tier 1 Criteria</p>
                      <div className="space-y-1">
                        {segmentData.qualification.tier1Criteria.map((criteria: string, idx: number) => (
                          <div key={idx} className="text-sm text-slate-700 p-2 bg-blue-50 rounded border border-blue-200">
                            • {criteria}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {segmentData.qualification.idealCriteria && segmentData.qualification.idealCriteria.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Ideal Criteria</p>
                      <div className="space-y-1">
                        {segmentData.qualification.idealCriteria.map((criteria: string, idx: number) => (
                          <div key={idx} className="text-sm text-slate-700 p-2 bg-purple-50 rounded border border-purple-200">
                            • {criteria}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {segmentData.qualification.lookalikeCompanies && segmentData.qualification.lookalikeCompanies.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Lookalike Companies</p>
                      <div className="space-y-1">
                        {segmentData.qualification.lookalikeCompanies.map((company: string, idx: number) => (
                          <div key={idx} className="text-sm text-slate-700 p-2 bg-orange-50 rounded border border-orange-200">
                            • {company}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Personas in this Segment */}
            {segmentData.personas && segmentData.personas.length > 0 && (
              <Card className="shadow-sm border border-slate-200/60 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base font-medium">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Personas ({segmentData.personas.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {segmentData.personas.map((persona: any, idx: number) => (
                      <div
                        key={persona._id?.$oid || persona._id || idx}
                        className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/workspace/${slug}/personas/${persona._id?.$oid || persona._id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-900 mb-1">{persona.name}</h4>
                            <p className="text-xs text-slate-600 mb-2">{persona.title}</p>
                            {persona.seniority && (
                              <Badge variant="outline" className="text-xs">
                                {persona.seniority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {persona.decisionInfluence && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">
                                {persona.decisionInfluence}
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm border border-slate-200/60 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
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
                      <User className="w-3 h-3 mr-2" />
                      View All Personas
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Target className="w-3 h-3 mr-2" />
                      Back to Segments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Segment Metadata */}
            <Card className="shadow-sm border border-slate-200/60 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Segment Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium text-slate-700">Created</span>
                    <span className="text-xs text-slate-600">
                      {segmentData.createdAt ? new Date(segmentData.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium text-slate-700">Last Updated</span>
                    <span className="text-xs text-slate-600">
                      {segmentData.updatedAt ? new Date(segmentData.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium text-slate-700">Priority</span>
                    <Badge className={`${getPriorityColor(segmentData.priority)} text-xs`}>
                      {segmentData.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium text-slate-700">Status</span>
                    <Badge className={`${getStatusColor(segmentData.status)} text-xs`}>
                      {segmentData.status}
                    </Badge>
                  </div>
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