import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ArrowLeft, Building2, Users, Target, TrendingUp, Download } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';

const SegmentDetails = () => {
  const { slug, segmentId } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  if (loading) {
    return <div className="p-8 text-center text-lg">Loading ICP data...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
  if (!icpData) {
    return <div className="p-8 text-center text-lg">No ICP data found.</div>;
  }

  // Get enrichment from icpData.icpEnrichmentVersions (use latest version if multiple)
  let enrichment;
  if (icpData.icpEnrichmentVersions) {
    const versionKeys = Object.keys(icpData.icpEnrichmentVersions);
    const latestVersion = versionKeys[versionKeys.length - 1];
    enrichment = icpData.icpEnrichmentVersions[latestVersion];
  }

  // Defensive fallback
  if (!enrichment) {
    return <div className="p-8 text-center text-lg">No segment enrichment data found.</div>;
  }

  // Get segments from enrichment
  const segments = enrichment.segments || [];
  const segIndex = segmentId ? parseInt(segmentId, 10) - 1 : 0;
  const currentSegment = segments[segIndex];

  if (!currentSegment) {
    return <div className="p-8 text-center text-lg">Segment not found.</div>;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={`/workspace/${slug}/segments`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Messaging Hub</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{currentSegment.name}</h1>
              <p className="text-lg text-slate-600 mt-1">Segment Details & Messaging</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Edit Segment
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
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Segment Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-slate-700 whitespace-pre-wrap">
                  {currentSegment.description || 'Segment description and overview'}
                </div>
              </CardContent>
            </Card>

            {/* Firmographics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Firmographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentSegment.characteristics && currentSegment.characteristics.map((item: string, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-semibold text-slate-700">Characteristic</h4>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {item}
                      </div>
                    </div>
                  ))}
                  {currentSegment.revenue && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-700">Revenue</h4>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {currentSegment.revenue}
                      </div>
                    </div>
                  )}
                  {currentSegment.employees && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-700">Employees</h4>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {currentSegment.employees}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits & Awareness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                    {currentSegment.benefits || 'Benefits of targeting this segment'}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Awareness Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Unaware', 'Problem', 'Solution', 'Product', 'Most Aware'].map((level, index) => (
                      <div key={level} className={`p-2 rounded ${level === (currentSegment.awarenessLevel || 'Solution') ? 'bg-blue-100 text-blue-800' : 'bg-slate-50'}`}>
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
                <CardTitle>Qualification Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Tier 1 Criteria</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    {currentSegment.tier1Criteria ? currentSegment.tier1Criteria.map((criteria: string, idx: number) => (
                      <div key={idx}>• {criteria}</div>
                    )) : 'N/A'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Lookalike Companies</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    {currentSegment.lookalikeCompanies ? currentSegment.lookalikeCompanies.map((company: string, idx: number) => (
                      <div key={idx}>• {company}</div>
                    )) : 'N/A'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Disqualifying Criteria</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    {currentSegment.disqualifyingCriteria ? currentSegment.disqualifyingCriteria.map((criteria: string, idx: number) => (
                      <div key={idx}>• {criteria}</div>
                    )) : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Related Pages */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Related Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to={`/workspace/${slug}/products`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Building2 className="w-4 h-4 mr-2" />
                      View Products
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View Personas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Segment Metrics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Segment Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Total Segments', value: segments.length.toString() },
                    { metric: 'Total Companies', value: '1,247' },
                    { metric: 'Accounts Reached', value: '324' },
                    { metric: 'Meetings Held', value: '42' }
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.metric}</p>
                        <p className="text-lg font-bold text-slate-900">{item.value}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Size */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Market Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Total Addressable Market', value: 'N/A' },
                    { metric: 'Serviceable Market', value: 'N/A' },
                    { metric: 'Market Growth', value: 'N/A' },
                    { metric: 'Market Penetration', value: 'N/A' }
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.metric}</p>
                        <p className="text-lg font-bold text-slate-900">{item.value}</p>
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