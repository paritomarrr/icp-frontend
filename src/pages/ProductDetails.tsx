import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ArrowLeft, Building2, Target, TrendingUp, Users, ChevronRight, Download, Edit } from 'lucide-react';
import { icpWizardApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import { EditProductModal } from '@/components/modals';

const ProductDetails = () => {
  const { slug, productId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
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
        // Try to fetch from backend if not in local storage
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
        console.error('Error fetching ICP data:', err);
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
            <Button 
              onClick={() => navigate(`/workspace/${slug}/products`)}
              className="mt-4"
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!icpData) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">No ICP Data Found</p>
            <p>Please generate ICP data first.</p>
            <Button 
              onClick={() => navigate(`/workspace/${slug}/enhanced-icp-wizard`)}
              className="mt-4"
            >
              Generate ICP Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get products directly from MongoDB structure
  const products = Array.isArray(icpData?.products) ? icpData.products : [];

  if (!products.length) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">No Product Data Available</p>
            <p>Product data not found.</p>
            <Button 
              onClick={() => navigate(`/workspace/${slug}/products`)}
              className="mt-4"
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Find the specific product using MongoDB structure
  const currentProduct = products.find((product: any) => {
    const productIdToMatch = product._id?.$oid || product._id;
    return productIdToMatch === productId;
  });

  console.log('ProductDetails - Current product:', currentProduct);

  if (!currentProduct) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">Product Not Found</p>
            <p>The requested product could not be found.</p>
            <Button 
              onClick={() => navigate(`/workspace/${slug}/products`)}
              className="mt-4"
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Function to enhance product with Claude AI
  const enhanceProductWithAI = async () => {
    // Removed AI enhancement functionality
    console.log('AI enhancement feature removed');
  };

  const handleEditProduct = () => {
    setEditingProduct(currentProduct);
    setEditModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProductData: any) => {
    if (!icpData || !currentProduct || !slug) return;
    
    try {
      const currentProductId = (currentProduct as any)._id?.$oid || (currentProduct as any)._id;
      const response = await icpWizardApi.updateProduct(slug, currentProductId.toString(), updatedProductData);
      
      if (response.success && response.product) {
        // Update local state - handle MongoDB ObjectId matching
        const updatedICPData = {
          ...icpData,
          products: icpData.products.map((p: any) => {
            const productId = p._id?.$oid || p._id || p.id;
            return productId === currentProductId ? response.product : p;
          })
        };
        
        setIcpData(updatedICPData);
        storageService.saveICPData(updatedICPData);
        setEditModalOpen(false);
        setEditingProduct(null);
        
        console.log('Product updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Use only the current product data from MongoDB
  const displayData = currentProduct as any;

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link 
            to={`/workspace/${slug}`} 
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link 
            to={`/workspace/${slug}/products`} 
            className="hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{displayData.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{displayData.name}</h1>
            <p className="text-sm text-slate-600 mt-1">Product Details & Specifications</p>
          </div>
          <div className="flex items-center space-x-3">
            {canEdit() && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleEditProduct}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Product Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {displayData.valueProposition || 'No value proposition available'}
                </div>
                {displayData.valuePropositionVariations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Value Proposition Variations</h4>
                    <div className="space-y-3">
                      {displayData.valuePropositionVariations.map((variation: string, idx: number) => (
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

            {/* Why Now */}
            {displayData.whyNow?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>Why Now</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.whyNow.map((reason: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Problems We Solve */}
            {displayData.problemsWithRootCauses?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>Problems We Solve</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.problemsWithRootCauses.map((problem: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{problem}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Outcomes */}
            {displayData.businessOutcomes?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Business Outcomes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.businessOutcomes.map((outcome: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {displayData.benefits?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.benefits.map((benefit: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Features */}
            {(displayData.keyFeatures?.length > 0 || displayData.features?.length > 0) && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Key Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(displayData.keyFeatures?.length > 0 ? displayData.keyFeatures : displayData.features || []).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unique Selling Points */}
            {(displayData.uniqueSellingPoints?.length > 0 || displayData.usps?.length > 0) && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Unique Selling Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(displayData.uniqueSellingPoints?.length > 0 ? displayData.uniqueSellingPoints : displayData.usps || []).map((usp: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{usp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Tiers */}
            {displayData.pricingTiers?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Pricing Tiers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.pricingTiers.map((tier: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{tier}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Timeline & ROI */}
            {(displayData.clientTimeline?.length > 0 || displayData.roiRequirements?.length > 0) && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Client Timeline & ROI</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayData.clientTimeline?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Client Timeline</h4>
                        <div className="space-y-3">
                          {displayData.clientTimeline.map((timeline: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700 leading-relaxed">{timeline}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {displayData.roiRequirements?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">ROI Requirements</h4>
                        <div className="space-y-3">
                          {displayData.roiRequirements.map((requirement: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
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

            {/* Competitors */}
            {displayData.competitors?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Users className="w-5 h-5 text-red-600" />
                    <span>Competitors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.competitors.map((competitor: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{competitor}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Target Audience */}
            {displayData.targetAudience && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Target Audience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">{displayData.targetAudience}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Urgency Consequences */}
            {displayData.urgencyConsequences?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span>Urgency Consequences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.urgencyConsequences.map((consequence: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{consequence}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Related Pages */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span>Related Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                  <Link to={`/workspace/${slug}/products`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      <Building2 className="w-4 h-4 mr-2" />
                      All Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Product Summary */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.category && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Category</h4>
                      <p className="text-sm text-gray-600">{displayData.category}</p>
                    </div>
                  )}
                  {displayData.targetAudience && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Target Audience</h4>
                      <p className="text-sm text-gray-600">{displayData.targetAudience}</p>
                    </div>
                  )}
                  {displayData.createdAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Created</h4>
                      <p className="text-sm text-gray-600">
                        {new Date((displayData.createdAt as any)?.$date || displayData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            {displayData.competitorAnalysis?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.competitorAnalysis.map((competitor: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>{competitor.domain}:</strong> {competitor.differentiation}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Use Cases */}
            {displayData.useCases?.length > 0 && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.useCases.map((useCase: string, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        • {useCase}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleUpdateProduct}
        productData={editingProduct}
      />
    </div>
  );
};

export default ProductDetails; 