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

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Product</span>
        </nav>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Product</h1>
            <p className="text-sm text-slate-600 mt-1">Product Details & Specifications</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Product Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {product.valueProposition || 'No value proposition available'}
                </div>
                {product.valuePropositionVariations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Value Proposition Variations</h4>
                    <div className="space-y-3">
                      {product.valuePropositionVariations.map((variation: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed">{variation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {product.problemsWithRootCauses?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>Problems We Solve</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.problemsWithRootCauses.map((problem: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{problem}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.businessOutcomes?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Business Outcomes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.businessOutcomes.map((outcome: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.keyFeatures?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Key Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.keyFeatures.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.uniqueSellingPoints?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Unique Selling Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.uniqueSellingPoints.map((usp: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{usp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.urgencyConsequences?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span>Urgency Consequences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.urgencyConsequences.map((consequence: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{consequence}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.competitorAnalysis?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.competitorAnalysis.map((competitor: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>{competitor.domain}:</strong> {competitor.differentiation}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {product.useCases?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.useCases.map((useCase: string, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">• {useCase}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {icpData.offerSales?.pricingTiers?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Pricing Tiers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {icpData.offerSales.pricingTiers.map((tier: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{tier}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {(icpData.offerSales?.clientTimeline?.length > 0 || icpData.offerSales?.roiRequirements?.length > 0) && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Client Timeline & ROI</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {icpData.offerSales.clientTimeline?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Client Timeline</h4>
                        <div className="space-y-2">
                          {icpData.offerSales.clientTimeline.map((timeline: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-3 p-2 bg-blue-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700 leading-relaxed">{timeline}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {icpData.offerSales.roiRequirements?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">ROI Requirements</h4>
                        <div className="space-y-2">
                          {icpData.offerSales.roiRequirements.map((requirement: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-3 p-2 bg-green-50 rounded-lg">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700 leading-relaxed">{requirement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span>Related Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to={`/workspace/${slug}/product`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Building2 className="w-4 h-4 mr-2" />
                      Product
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Target className="w-4 h-4 mr-2" />
                      View Segments
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      View Personas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.category && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Category</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                  )}
                  {product.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  )}
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
