import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ArrowLeft, Building2, Target, TrendingUp, Users, ChevronRight, Sparkles, Download, Edit } from 'lucide-react';
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);
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
  
  // Parse product content to extract individual products
  const parseProducts = () => {
    return rootProducts.map((product: any, idx: number) => {
      // Handle both string and object products
      const productName = typeof product === 'string' ? product : product.name;
      const productData = typeof product === 'string' ? {} : product;
      
      return {
        id: productData._id || productData.id || (idx + 1).toString(),
        name: productName,
        description: productData.description || `Core product offering for ${icpData?.companyName || 'Your Company'}`,
        problems: productData.problems || productEnrichment?.problems || ['Skills gap in advanced manufacturing', 'Limited internal R&D capabilities'],
        features: productData.features || productEnrichment?.features || ['Custom technical training programs', 'Industry-academic research partnerships'],
        solution: productData.solution || productEnrichment?.solution || 'End-to-end technical capability development',
        usps: productData.usps || productData.uniqueSellingPoints || productEnrichment?.usp || ['Industry-validated curriculum', 'Hands-on project-based learning'],
        whyNow: productData.whyNow || productEnrichment?.whyNow || ['Industry 4.0 acceleration', 'Post-pandemic digital transformation'],
        valueProposition: productData.valueProposition || (latestVersion && enrichmentData?.[latestVersion]?.oneLiner) || `${productName} - Core offering`
      };
    });
  };

  const products = parseProducts();
  console.log('ProductDetails - Parsed products:', products);
  
  // Find product by ID (handle both string and numeric IDs)
  const currentProduct = products.find(p => {
    const productIdNum = parseInt(productId || '1');
    const productIdStr = productId || '1';
    
    return p.id === productIdNum || p.id === productIdStr || p.id === productId;
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
    if (!icpData || !currentProduct) return;
    
    setIsEnhancing(true);
    const companyData = {
      companyName: icpData.companyName || workspace?.companyName,
      products: icpData.products,
      companyUrl: icpData.companyUrl || workspace?.companyUrl
    };

    try {
      console.log(`Enhancing product: ${currentProduct.name}`);
      const result = await icpWizardApi.generateProductDetails(currentProduct.name, companyData);
      
      if (result.success && result.data) {
        setEnhancedData(result.data);
        console.log('Enhanced product data:', result.data);
      }
    } catch (error) {
      console.error('Error enhancing product:', error);
    } finally {
      setIsEnhancing(false);
    }
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
        // Update local state
        const updatedICPData = {
          ...icpData,
          products: icpData.products.map((p: any) => 
            p.id === currentProduct.id ? response.product : p
          )
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

  // Use enhanced data when available
  const displayData = {
    ...currentProduct,
    problems: enhancedData?.problems || currentProduct.problems,
    features: enhancedData?.features || currentProduct.features,
    usps: enhancedData?.usps || currentProduct.usps,
    useCases: enhancedData?.useCases || [],
    benefits: enhancedData?.benefits || []
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/workspace/${slug}/products`} className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{displayData.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{displayData.name}</h1>
            <p className="text-sm text-slate-600 mt-1">Product Details & Messaging</p>
          </div>
          <div className="flex items-center space-x-3">
            {workspace && (
              <Badge variant="outline" className="text-xs">
                {workspace.role ? workspace.role.charAt(0).toUpperCase() + workspace.role.slice(1) : 'Workspace'}
              </Badge>
            )}
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
              onClick={enhanceProductWithAI}
              disabled={isEnhancing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
            {canEdit() && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                onClick={handleEditProduct}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            )}
            {enhancedData && (
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Product Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {displayData.description || 'Product description and overview'}
                </div>
                {enhancedData && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Problems & Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Target className="w-4 h-4 text-red-600" />
                    <span>Problems We Solve</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(displayData.problems) ? (
                      displayData.problems.map((problem: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                          {problem}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                        {displayData.problems || 'Customer pain points and challenges that this product addresses'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Our Solution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                    {displayData.solution || 'How this product solves the identified problems'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features & USPs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(displayData.features) ? (
                      displayData.features.map((feature: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                          {feature}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                        {displayData.features || 'Key features and capabilities of this product'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Unique Selling Propositions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(displayData.usps) ? (
                      displayData.usps.map((usp: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
                          {usp}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                        {displayData.usps || 'What makes this product unique and compelling'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Why Now */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Why Now & Consequences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                  {Array.isArray(currentProduct.whyNow)
                    ? currentProduct.whyNow.join(', ')
                    : typeof currentProduct.whyNow === 'object' && currentProduct.whyNow !== null
                    ? JSON.stringify(currentProduct.whyNow)
                    : currentProduct.whyNow || 'Urgency and consequences of not solving the problem'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Value Proposition */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Value Proposition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                  {Array.isArray(currentProduct.valueProposition)
                    ? currentProduct.valueProposition.join(', ')
                    : typeof currentProduct.valueProposition === 'object' && currentProduct.valueProposition !== null
                    ? JSON.stringify(currentProduct.valueProposition)
                    : currentProduct.valueProposition || 'Clear value proposition for this product'}
                </div>
              </CardContent>
            </Card>

            {/* Target Segments */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Target Segments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Building2 className="w-3 h-3 mr-2" />
                      View Segments
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

            {/* Product Metrics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Product Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Market Size', value: '$2.5B', icon: '💰' },
                    { label: 'Growth Rate', value: '15% YoY', icon: '📈' },
                    { label: 'Competitors', value: '12', icon: '🏢' },
                    { label: 'Customer LTV', value: '$50K', icon: '💎' }
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{metric.icon}</span>
                        <span className="text-xs font-medium text-slate-700">{metric.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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