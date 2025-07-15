
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ChevronRight, Building2, Edit, Search, Plus, Lock } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { usePermissions } from '@/hooks/use-permissions';
import { AddProductModal, EditProductModal } from '@/components/modals';
import { icpWizardApi, ProductData } from '@/lib/api';

const Products = () => {
  const { slug } = useParams();
  const navigate = useNavigate(); // <-- add this line
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
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

  const handleAddProduct = async (productData: ProductData) => {
    if (!slug) return;
    
    try {
      const result = await icpWizardApi.addProduct(slug, productData);
      
      if (result.success) {
        console.log('Product added successfully:', result.product);
        
        // Refresh the ICP data from backend to get the latest state
        try {
          const res = await axiosInstance.get(`/workspaces/slug/${slug}`);
          if (res.data) {
            const freshData = { ...res.data, workspaceId: slug };
            storageService.saveICPData(freshData);
            setIcpData(freshData);
          }
        } catch (fetchError) {
          console.error('Error fetching updated data:', fetchError);
          // Fallback: try to update local state manually
          if (icpData && result.product) {
            const updatedICPData = {
              ...icpData,
              products: [...icpData.products, result.product]
            };
            setIcpData(updatedICPData);
            storageService.saveICPData(updatedICPData);
          }
        }
        
        setAddProductModalOpen(false);
      } else {
        console.error('Failed to add product:', result.error);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = (product: any) => {
    // Ensure we pass the product with the correct structure for the modal
    const productForEdit = {
      ...product,
      // Make sure we have the MongoDB ID properly formatted
      id: product.id,
      _id: product._id || product.id,
      // Ensure all arrays are properly initialized
      valuePropositionVariations: product.valuePropositionVariations || [],
      keyFeatures: product.keyFeatures || [],
      uniqueSellingPoints: product.uniqueSellingPoints || [],
      businessOutcomes: product.businessOutcomes || [],
      competitorAnalysis: product.competitorAnalysis || [],
      pricingTiers: product.pricingTiers || [],
      urgencyConsequences: product.urgencyConsequences || [],
      problemsWithRootCauses: product.problemsWithRootCauses || [],
      useCases: product.useCases || []
    };
    
    setEditingProduct(productForEdit);
    setEditProductModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProductData: ProductData) => {
    if (!slug || !editingProduct) return;
    
    try {
      const response = await icpWizardApi.updateProduct(slug, editingProduct.id.toString(), updatedProductData);
      
      if (response.success && response.product) {
        // Update local state - need to find the product by MongoDB _id
        const updatedICPData = {
          ...icpData!,
          products: icpData!.products.map((p: any) => {
            // Handle MongoDB _id structure
            const productId = p._id?.$oid || p._id || p.id;
            const editingProductId = editingProduct.id;
            
            if (productId === editingProductId) {
              return response.product;
            }
            return p;
          })
        };
        
        setIcpData(updatedICPData);
        storageService.saveICPData(updatedICPData);
        setEditProductModalOpen(false);
        setEditingProduct(null);
        
        console.log('Product updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  if (!canView()) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
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
              <p className="text-lg text-slate-600">Loading products...</p>
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

  // Get products from the workspace data and ICP enrichment versions
  const products = Array.isArray(icpData?.products) ? icpData.products : [];
  const enrichmentData = icpData?.icpEnrichmentVersions;
  const latestVersion = enrichmentData ? Math.max(...Object.keys(enrichmentData).map(Number)) : null;
  const productEnrichment = latestVersion && enrichmentData?.[latestVersion]?.products;
  
  console.log('Products - icpData:', icpData);
  console.log('Products - Root products:', products);
  console.log('Products - Product enrichment:', productEnrichment);

  // Transform the products array into the expected format
  const transformedProducts = products.map((product: any, index: number) => {
    // Handle both old string format and new object format
    const productName = typeof product === 'string' ? product : product.name;
    const productData = typeof product === 'string' ? {} : product;
    
    // Ensure consistent ID handling - use MongoDB _id if available
    const productId = productData._id?.$oid || productData._id || productData.id || (index + 1).toString();
    
    return {
      id: productId,
      name: productName,
      // New detailed fields from the MongoDB structure
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

  const filteredProducts = transformedProducts.filter((product: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.valueProposition && product.valueProposition.toLowerCase().includes(searchLower)) ||
      (product.uniqueSellingPoints && product.uniqueSellingPoints.some((usp: string) => 
        usp.toLowerCase().includes(searchLower)
      )) ||
      (product.keyFeatures && product.keyFeatures.some((feature: string) => 
        feature.toLowerCase().includes(searchLower)
      )) ||
      (product.problemsWithRootCauses && product.problemsWithRootCauses.some((problem: string) => 
        problem.toLowerCase().includes(searchLower)
      ))
    );
  });

  console.log('Products - Transformed products:', transformedProducts);
  console.log('Products - Filtered products:', filteredProducts);

  const userRole = getUserRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
          <Link 
            to={`/workspace/${slug}`} 
            className="hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-semibold">Products & Solutions</span>
        </nav>

        {/* Enhanced Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Products & Solutions
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                Manage your core product offerings and value propositions
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{filteredProducts.length} Products</span>
                </div>
                {userRole && (
                  <Badge 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1"
                  >
                    {userRole === 'owner' ? '👑 Owner' : userRole === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                  </Badge>
                )}
              </div>
            </div>
            
            {canEdit() && (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
                onClick={() => setAddProductModalOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Product
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-md border border-white/20">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search products, features, or value propositions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200"
            />
          </div>
        </div>

        {/* Enhanced Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product: any, idx: number) => (
            <Card
              key={product.name}
              className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden"
              onClick={() => {
                console.log('Navigating to product:', product.id, 'for product:', product.name);
                navigate(`/workspace/${slug}/products/${product.id}`);
              }}
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {product.status && product.status !== 'active' && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        {product.status}
                      </Badge>
                    )}
                    {product.priority && product.priority !== 'medium' && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${
                          product.priority === 'high' 
                            ? 'bg-red-50 border-red-300 text-red-700' 
                            : 'bg-green-50 border-green-300 text-green-700'
                        }`}
                      >
                        {product.priority} priority
                      </Badge>
                    )}
                  </div>
                  {canEdit() && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                    {product.name}
                  </CardTitle>
                </div>
                
                {product.keyFeatures?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                    >
                      ⚡ {product.keyFeatures.length} Key Features
                    </Badge>
                    {product.uniqueSellingPoints?.length > 0 && (
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-medium"
                      >
                        🌟 {product.uniqueSellingPoints.length} USPs
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-4 pb-6">
                <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {product.valueProposition || 'No value proposition available'}
                </p>
                
                {/* Enhanced metrics with better visual hierarchy */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {product.competitorAnalysis?.length > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-xs text-orange-700 font-medium">
                        {product.competitorAnalysis.length} Competitors
                      </span>
                    </div>
                  )}
                  {product.pricingTiers?.length > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-700 font-medium">
                        {product.pricingTiers.length} Pricing Tiers
                      </span>
                    </div>
                  )}
                  {product.businessOutcomes?.length > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-blue-700 font-medium">
                        {product.businessOutcomes.length} Outcomes
                      </span>
                    </div>
                  )}
                  {product.urgencyConsequences?.length > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-700 font-medium">
                        {product.urgencyConsequences.length} Urgency Factors
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">
                    {product.updatedAt ? 
                      `Updated ${new Date(product.updatedAt.$date || product.updatedAt).toLocaleDateString()}` :
                      product.createdAt ? 
                        `Created ${new Date(product.createdAt.$date || product.createdAt).toLocaleDateString()}` :
                        'Recently added'
                    }
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-6">
                <Building2 className="w-12 h-12 text-slate-500 mx-auto mt-2" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {searchTerm ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {searchTerm 
                  ? 'Try adjusting your search terms or check your spelling' 
                  : 'Start building your product portfolio by adding your first core product offering'
                }
              </p>
              {canEdit() && !searchTerm && (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
                  onClick={() => setAddProductModalOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        open={addProductModalOpen}
        onOpenChange={setAddProductModalOpen}
        onSave={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editProductModalOpen}
        onOpenChange={setEditProductModalOpen}
        onSave={handleUpdateProduct}
        productData={editingProduct}
      />
    </div>
  );
};

export default Products;
