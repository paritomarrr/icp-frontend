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
    budget: currentSegment.budget || '',
    description: currentSegment.description || `${currentSegment.name} - ${currentSegment.industry} segment`,
    marketSize: currentSegment.marketSize || 'Not specified',
    growthRate: currentSegment.growthRate || 'Not specified',
    customerCount: currentSegment.customerCount || 'Not specified',
    locations: currentSegment.locations || [],
    characteristics: currentSegment.characteristics || [],
    industries: currentSegment.industries || [],
    companySizes: currentSegment.companySizes || [],
    technologies: currentSegment.technologies || [],
    qualificationCriteria: currentSegment.qualificationCriteria || [],
    signals: currentSegment.signals || [],
    painPoints: currentSegment.painPoints || [],
    buyingProcesses: currentSegment.buyingProcesses || [],
    specificBenefits: currentSegment.specificBenefits || [],
    ctaOptions: currentSegment.ctaOptions || [],
    qualification: currentSegment.qualification || {
      tier1Criteria: [],
      idealCriteria: [],
      lookalikeCompanies: [],
      disqualifyingCriteria: []
    },
    personas: currentSegment.personas || [],
    createdAt: currentSegment.createdAt,
    updatedAt: currentSegment.updatedAt,
    firmographics: currentSegment.firmographics || {
      industry: currentSegment.industry || '',
      employees: currentSegment.companySize || '',
      location: currentSegment.geography ? [currentSegment.geography] : [],
      signals: currentSegment.signals || []
    },
    benefits: currentSegment.specificBenefits?.join(', ') || 'Benefits not specified'
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
              <h1 className="text-lg font-semibold text-slate-900 mb-1">
                {segmentData.name}
              </h1>
              <p className="text-xs text-slate-600">
                Segment Details & Analysis
              </p>
            </div>
            <div className="flex items-center space-x-3">
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
          {/* Left Column */}
          <div className="space-y-6">
            {/* Firmographics */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Firmographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Industry</p>
                    <p className="text-xs text-gray-600">{segmentData.firmographics?.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Company Size</p>
                    <p className="text-xs text-gray-600">{segmentData.firmographics?.employees || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-900 mb-1">Location</p>
                    <p className="text-xs text-gray-600">
                      {segmentData.firmographics?.location?.join(', ') || 'Not specified'}
                    </p>
                  </div>
                </div>
                {segmentData.firmographics && 'signals' in segmentData.firmographics && Array.isArray(segmentData.firmographics.signals) && segmentData.firmographics.signals.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-2">Qualifying Signals</p>
                    <div className="space-y-2">
                      {segmentData.firmographics.signals.map((signal, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">{signal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specific Benefits */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Specific Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  {segmentData.specificBenefits?.join(', ') || 'No benefits specified'}
                </p>
              </CardContent>
            </Card>

            {/* Awareness Level */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Awareness Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  {segmentData.awarenessLevel || 'Not specified'}
                </p>
              </CardContent>
            </Card>

            {/* CTA Options */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>CTA Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  {segmentData.ctaOptions?.join(', ') || 'No CTA options specified'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Qualification */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Qualification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Tier 1 Criteria</p>
                    <p className="text-xs text-gray-600">{segmentData.qualification?.tier1Criteria?.join(', ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Lookalike Companies</p>
                    <p className="text-xs text-gray-600">{segmentData.qualification?.lookalikeCompanies?.join(', ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Disqualifying Criteria</p>
                    <p className="text-xs text-gray-600">{segmentData.qualification?.disqualifyingCriteria?.join(', ') || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Companies */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Total Companies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Total Account Number</p>
                    <p className="text-xs text-gray-600">CSV</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Account Reached</p>
                    <p className="text-xs text-gray-600">CSV</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Account Meetings</p>
                    <p className="text-xs text-gray-600">CSV</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Deals Open</p>
                    <p className="text-xs text-gray-600">CSV</p>
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