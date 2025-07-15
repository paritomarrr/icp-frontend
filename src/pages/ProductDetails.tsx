import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ArrowLeft, Building2, Target, TrendingUp, Users, ChevronRight, Download, Edit, AlertTriangle, CheckCircle, Star, Zap, Clock } from 'lucide-react';
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

  // Get products from the workspace data and ICP enrichment versions
  const rootProducts = Array.isArray(icpData?.products) ? icpData.products : [];
  const enrichmentData = icpData?.icpEnrichmentVersions;
  const latestVersion = enrichmentData ? Math.max(...Object.keys(enrichmentData).map(Number)) : null;
  const productEnrichment = latestVersion && enrichmentData?.[latestVersion]?.products;
  
  console.log('ProductDetails - icpData:', icpData);
  console.log('ProductDetails - Root products:', rootProducts);
  console.log('ProductDetails - Product enrichment:', productEnrichment);
  console.log('ProductDetails - productId:', productId);

  if (!rootProducts.length) {
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
  
  // Parse product content to extract individual products with MongoDB structure
  const parseProducts = () => {
    return rootProducts.map((product: any, idx: number) => {
      // Handle both string and object products
      const productName = typeof product === 'string' ? product : product.name;
      const productData = typeof product === 'string' ? {} : product;
      
      // Ensure consistent ID handling - use MongoDB _id if available
      let productId;
      if (productData._id) {
        // Handle MongoDB ObjectId format
        productId = productData._id.$oid || productData._id;
      } else {
        productId = productData.id || (idx + 1).toString();
      }
      
      return {
        id: productId,
        name: productName,
        // All the detailed fields from the new MongoDB structure
        valueProposition: productData.valueProposition || '',
        valuePropositionVariations: productData.valuePropositionVariations || [],
        problems: productData.problems || [],
        problemsWithRootCauses: productData.problemsWithRootCauses || [],
        features: productData.features || [],
        keyFeatures: productData.keyFeatures || [],
        benefits: productData.benefits || [],
        businessOutcomes: productData.businessOutcomes || [],
        useCases: productData.useCases || [],
        competitors: productData.competitors || [],
        competitorAnalysis: productData.competitorAnalysis || [],
        uniqueSellingPoints: productData.uniqueSellingPoints || [],
        usps: productData.usps || [],
        whyNow: productData.whyNow || [],
        urgencyConsequences: productData.urgencyConsequences || [],
        pricingTiers: productData.pricingTiers || [],
        clientTimeline: productData.clientTimeline || '',
        roiRequirements: productData.roiRequirements || '',
        salesDeckUrl: productData.salesDeckUrl || '',
        status: productData.status || 'active',
        priority: productData.priority || 'medium',
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt
      };
    });
  };

  const products = parseProducts();
  console.log('ProductDetails - Parsed products:', products);
  
  // Find product by ID (handle MongoDB ObjectIds and various ID formats)
  const currentProduct = products.find(p => {
    // Direct string match for MongoDB ObjectIds
    if (p.id === productId) return true;
    
    // Try numeric comparison for legacy IDs
    const productIdNum = parseInt(productId || '1');
    if (!isNaN(productIdNum) && (p.id === productIdNum || p.id === productIdNum.toString())) return true;
    
    // Fallback to index-based lookup
    const productIndex = parseInt(productId || '1') - 1;
    return products.indexOf(p) === productIndex;
  }) || products[0];

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
      const response = await icpWizardApi.updateProduct(slug, currentProduct.id.toString(), updatedProductData);
      
      if (response.success && response.product) {
        // Update local state - handle MongoDB ObjectId matching
        const updatedICPData = {
          ...icpData,
          products: icpData.products.map((p: any) => {
            const productId = p._id?.$oid || p._id || p.id;
            const currentProductId = currentProduct.id;
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
  const displayData = currentProduct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
          <Link 
            to={`/workspace/${slug}`} 
            className="hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link 
            to={`/workspace/${slug}/products`} 
            className="hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            Products
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-semibold">{displayData.name}</span>
        </nav>

        {/* Enhanced Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {displayData.name}
                  </h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge 
                      variant={displayData.status === 'active' ? 'default' : 'secondary'} 
                      className={`text-sm font-medium ${
                        displayData.status === 'active' 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}
                    >
                      {displayData.status}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-sm font-medium ${
                        displayData.priority === 'high' ? 'bg-red-50 border-red-300 text-red-700' :
                        displayData.priority === 'medium' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                        'bg-green-50 border-green-300 text-green-700'
                      }`}
                    >
                      {displayData.priority} priority
                    </Badge>
                  </div>
                </div>
              </div>
              {displayData.updatedAt && (
                <p className="text-sm text-slate-500">
                  Last updated: {new Date(displayData.updatedAt.$date || displayData.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              {canEdit() && (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleEditProduct}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - 2/3 - Enhanced */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Overview - Enhanced */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Building2 className="w-6 h-6 text-blue-600 mr-3" />
                  Product Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {displayData.valueProposition || 'No value proposition available'}
                </div>
                {displayData.valuePropositionVariations?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Value Proposition Variations:</h4>
                    <div className="space-y-2">
                      {displayData.valuePropositionVariations.map((variation: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-blue-200/30">
                          <p className="text-slate-700 text-sm">{variation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problems & Solutions - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <Target className="w-5 h-5 text-red-600 mr-3" />
                    Problems We Solve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.problemsWithRootCauses?.length > 0 ? (
                      displayData.problemsWithRootCauses.map((problem: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-red-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{problem}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">No problems with root causes specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                    Business Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.businessOutcomes?.length > 0 ? (
                      displayData.businessOutcomes.map((outcome: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{outcome}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">No business outcomes specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features & USPs - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <Star className="w-5 h-5 text-purple-600 mr-3" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.keyFeatures?.length > 0 ? (
                      displayData.keyFeatures.map((feature: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                              <Star className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{feature}</p>
                          </div>
                        </div>
                      ))
                    ) : displayData.features?.length > 0 ? (
                      displayData.features.map((feature: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                              <Star className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{feature}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">No features specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <Zap className="w-5 h-5 text-orange-600 mr-3" />
                    Unique Selling Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.uniqueSellingPoints?.length > 0 ? (
                      displayData.uniqueSellingPoints.map((usp: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-orange-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                              <Zap className="w-4 h-4 text-orange-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{usp}</p>
                          </div>
                        </div>
                      ))
                    ) : displayData.usps?.length > 0 ? (
                      displayData.usps.map((usp: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-orange-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                              <Zap className="w-4 h-4 text-orange-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{usp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">No USPs specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing & Timeline Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                    Pricing Tiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.pricingTiers?.length > 0 ? (
                      displayData.pricingTiers.map((tier: string, idx: number) => (
                        <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200/30 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-slate-700 text-sm">{tier}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm">No pricing tiers specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    Client Timeline & ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayData.clientTimeline && (
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200/30">
                        <h4 className="text-sm font-semibold text-slate-600 mb-2">Client Timeline:</h4>
                        <p className="text-slate-700 text-sm">{displayData.clientTimeline}</p>
                      </div>
                    )}
                    {displayData.roiRequirements && (
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200/30">
                        <h4 className="text-sm font-semibold text-slate-600 mb-2">ROI Requirements:</h4>
                        <p className="text-slate-700 text-sm">{displayData.roiRequirements}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Urgency Consequences */}
            {displayData.urgencyConsequences?.length > 0 && (
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                    Urgency Consequences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.urgencyConsequences.map((consequence: string, idx: number) => (
                      <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-yellow-200/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-1.5 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          </div>
                          <p className="text-slate-700 text-sm">{consequence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Right Side - 1/3 */}
          <div className="space-y-8">
            {/* Competitor Analysis */}
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                  <Building2 className="w-5 h-5 text-red-600 mr-3" />
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayData.competitorAnalysis?.length > 0 ? (
                    displayData.competitorAnalysis.map((competitor: any, idx: number) => (
                      <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-red-200/30 hover:shadow-md transition-all duration-200">
                        <h4 className="font-semibold text-slate-700 text-sm mb-2">{competitor.domain}</h4>
                        <p className="text-slate-600 text-sm">{competitor.differentiation}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic text-sm">No competitor analysis available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Resources */}
            {displayData.salesDeckUrl && (
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                    Sales Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-200/30">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Sales Deck URL:</h4>
                    <a 
                      href={displayData.salesDeckUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-sm break-all"
                    >
                      {displayData.salesDeckUrl}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Use Cases */}
            {displayData.useCases?.length > 0 && (
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/50 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                    <Target className="w-5 h-5 text-indigo-600 mr-3" />
                    Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.useCases.map((useCase: string, idx: number) => (
                      <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-indigo-200/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Target className="w-4 h-4 text-indigo-600" />
                          </div>
                          <p className="text-slate-700 text-sm">{useCase}</p>
                        </div>
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