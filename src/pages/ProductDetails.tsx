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
    <div className="min-h-screen bg-octave-light-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 text-xs text-slate-400 mb-6">
          <Link 
            to={`/workspace/${slug}`} 
            className="hover:text-slate-600 transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link 
            to={`/workspace/${slug}/products`} 
            className="hover:text-slate-600 transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-700">{displayData.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/30 p-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  {displayData.name}
                </h1>
                <Badge 
                  variant={displayData.status === 'active' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {displayData.status}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-xs border-blue-300 text-blue-700"
                >
                  {displayData.priority} priority
                </Badge>
              </div>
              {displayData.updatedAt && (
                <p className="text-xs text-slate-500">
                  Last updated: {new Date((displayData.updatedAt as any)?.$date || displayData.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {canEdit() && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEditProduct}
                  className="border-blue-300 hover:bg-blue-50"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <Card className="border hover:border-blue-300 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-900">
                  Product Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {displayData.valueProposition || 'No value proposition available'}
                </div>
                {displayData.valuePropositionVariations?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-slate-600 mb-2">Value Proposition Variations:</h4>
                    <div className="space-y-2">
                      {displayData.valuePropositionVariations.map((variation: string, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded border">
                          <p className="text-slate-700 text-xs">{variation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problems & Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Problems We Solve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.problemsWithRootCauses?.length > 0 ? (
                      displayData.problemsWithRootCauses.map((problem: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{problem}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-xs">No problems with root causes specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Business Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.businessOutcomes?.length > 0 ? (
                      displayData.businessOutcomes.map((outcome: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{outcome}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-xs">No business outcomes specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features & USPs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.keyFeatures?.length > 0 ? (
                      displayData.keyFeatures.map((feature: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{feature}</p>
                        </div>
                      ))
                    ) : displayData.features?.length > 0 ? (
                      displayData.features.map((feature: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{feature}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-xs">No features specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Unique Selling Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.uniqueSellingPoints?.length > 0 ? (
                      displayData.uniqueSellingPoints.map((usp: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{usp}</p>
                        </div>
                      ))
                    ) : displayData.usps?.length > 0 ? (
                      displayData.usps.map((usp: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{usp}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-xs">No USPs specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing & Timeline Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Pricing Tiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.pricingTiers?.length > 0 ? (
                      displayData.pricingTiers.map((tier: string, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded border">
                          <p className="text-slate-700 text-xs">{tier}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-xs">No pricing tiers specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Client Timeline & ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.clientTimeline && (
                      <div className="p-3 bg-slate-50 rounded border">
                        <h4 className="text-xs font-medium text-slate-600 mb-1">Client Timeline:</h4>
                        <p className="text-slate-700 text-xs">{displayData.clientTimeline}</p>
                      </div>
                    )}
                    {displayData.roiRequirements && (
                      <div className="p-3 bg-slate-50 rounded border">
                        <h4 className="text-xs font-medium text-slate-600 mb-1">ROI Requirements:</h4>
                        <p className="text-slate-700 text-xs">{displayData.roiRequirements}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Urgency Consequences */}
            {displayData.urgencyConsequences?.length > 0 && (
              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Urgency Consequences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.urgencyConsequences.map((consequence: string, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border">
                        <p className="text-slate-700 text-xs">{consequence}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Competitor Analysis */}
            <Card className="border hover:border-blue-300 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-900">
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayData.competitorAnalysis?.length > 0 ? (
                    displayData.competitorAnalysis.map((competitor: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border">
                        <h4 className="font-medium text-slate-700 text-xs mb-1">{competitor.domain}</h4>
                        <p className="text-slate-600 text-xs">{competitor.differentiation}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs">No competitor analysis available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Resources */}
            {displayData.salesDeckUrl && (
              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Sales Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-slate-50 rounded border">
                    <h4 className="text-xs font-medium text-slate-600 mb-1">Sales Deck URL:</h4>
                    <a 
                      href={displayData.salesDeckUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs break-all"
                    >
                      {displayData.salesDeckUrl}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Use Cases */}
            {displayData.useCases?.length > 0 && (
              <Card className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayData.useCases.map((useCase: string, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border">
                        <p className="text-slate-700 text-xs">{useCase}</p>
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