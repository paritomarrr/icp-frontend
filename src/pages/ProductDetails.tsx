import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Building2, Target, TrendingUp, Users, ChevronRight, Edit } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canEdit } = usePermissions();

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
        const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';
        const response = await fetch(`${API_BASE}/workspaces/slug/${slug}`, {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        });
        if (response.ok) {
          data = await response.json();
          storageService.saveICPData({ ...data, workspaceId: slug });
          setIcpData({ ...data, workspaceId: slug });
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
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">Error Loading Data</p>
            <p>{error}</p>
            <Button onClick={() => navigate(`/workspace/${slug}`)} className="mt-4">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!icpData || !icpData.product) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">No Product Data Found</p>
            <p>Please generate ICP data first.</p>
            <Button onClick={() => navigate(`/workspace/${slug}/enhanced-icp-wizard`)} className="mt-4">Generate ICP Data</Button>
          </div>
        </div>
      </div>
    );
  }

  const product = icpData.product;
  const offerSales = icpData.offerSales;

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Product</span>
        </nav>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-slate-800">Product</h1>
            <p className="text-xs text-slate-600 mt-1">Product Details & Specifications</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Product Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div className="text-xs text-gray-700 leading-relaxed">
                  {product.valueProposition || 'No value proposition available'}
                </div>
                {product.valuePropositionVariations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Value Proposition Variations</h4>
                    <div className="space-y-2">
                      {product.valuePropositionVariations.map((variation: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <p className="text-xs text-gray-700 leading-relaxed">{variation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {product.problemsWithRootCauses?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-red-600" />
                    <span>Problems We Solve</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {product.problemsWithRootCauses.map((problem: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">{problem}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.keyFeatures?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Key Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {product.keyFeatures.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.uniqueSellingPoints?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span>Unique Selling Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {product.uniqueSellingPoints.map((usp: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">{usp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.urgencyConsequences?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span>Urgency Consequences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {product.urgencyConsequences.map((consequence: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">{consequence}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
             {product.businessOutcomes?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Business Outcomes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {product.businessOutcomes.map((outcome: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.competitorAnalysis?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-sm font-medium">Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-1">
                    {product.competitorAnalysis.map((competitor: any, idx: number) => (
                      <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>{competitor.domain}:</strong> {competitor.differentiation}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.useCases?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-sm font-medium">Use Cases</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-1">
                    {product.useCases.map((useCase: string, idx: number) => (
                      <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">• {useCase}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-4">
          {icpData.offerSales?.pricingTiers?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Package & Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {icpData.offerSales.pricingTiers.map((tier: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">{tier}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          {(icpData.offerSales?.clientTimeline?.length > 0 || icpData.offerSales?.roiRequirements?.length > 0) && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {icpData.offerSales.clientTimeline?.length > 0 && (
                      <div>
                        {/* <h4 className="text-xs font-medium text-gray-900 mb-1">Client Timeline</h4> */}
                        <div className="space-y-1">
                          {icpData.offerSales.clientTimeline.map((timeline: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                              <p className="text-xs text-gray-700 leading-relaxed">{timeline}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {icpData.offerSales.roiRequirements?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-900 mb-1">ROI Requirements</h4>
                        <div className="space-y-1">
                          {icpData.offerSales.roiRequirements.map((requirement: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                              <p className="text-xs text-gray-700 leading-relaxed">{requirement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          {icpData.offerSales?.salesDeckUrl?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                    <span>Sales Deck</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {icpData.offerSales.salesDeckUrl.map((tier: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed"><Link target='_blank' to={tier}>{tier}</Link></p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {icpData.socialProof?.caseStudies?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-red-600" />
                    <span>Case Studies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {icpData.socialProof.caseStudies.map(({ url, marketSegment, title, description }: { url: string; marketSegment: string; title: string; description: string; }, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className='flex flex-col'>
                        <p className="text-md bold text-gray-700 leading-relaxed"><Link target='_blank' to={url}>{title}</Link></p>
                        <p className="text-xs text-gray-500 leading-relaxed">{marketSegment}</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Related Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs h-10 mb-2">
                      <Target className="w-3 h-3 mr-2" />
                      View Segments
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs h-10">
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

export default ProductPage;
