
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ChevronRight, Building2, Edit, Search, Plus, Lock, Target, TrendingUp } from 'lucide-react';
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

    // Redirect to product details if product exists
  useEffect(() => {
    if (icpData?.product && slug && !loading) {
      // Navigate to product details page with simplified route
      navigate(`/workspace/${slug}/product`);
    }
  }, [icpData, slug, navigate, loading]);

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
      <div className="p-6 bg-white min-h-screen">
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

  // Get product directly from MongoDB structure (single product object)
  const product = icpData?.product;
  
  // Transform single product into array for UI consistency
  const products = icpData?.product ? [{
    id: 'main-product',
    _id: 'main-product',
    name: 'Main Product',
    description: icpData.product.valueProposition || 'Product description',
    category: icpData.product.category || 'General',
    features: icpData.product.keyFeatures || [],
    benefits: icpData.product.businessOutcomes || [],
    useCases: icpData.product.useCases || [],
    competitorAnalysis: icpData.product.competitorAnalysis || [],
    pricing: icpData.offerSales?.pricingTiers || [],
    valueProposition: icpData.product.valueProposition || '',
    problemsWithRootCauses: icpData.product.problemsWithRootCauses || [],
    businessOutcomes: icpData.product.businessOutcomes || [],
    uniqueSellingPoints: icpData.product.uniqueSellingPoints || [],
    urgencyConsequences: icpData.product.urgencyConsequences || [],
    keyFeatures: icpData.product.keyFeatures || [],
    valuePropositionVariations: icpData.product.valuePropositionVariations || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }] : [];

  const filteredProducts = products.filter((product: any) => {
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

  const userRole = getUserRole();

  return (
    <div className="p-6 bg-octave-light-1 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 text-xs text-slate-400 mb-6">
          <Link 
            to={`/workspace/${slug}`} 
            className="hover:text-slate-600 transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-700">Products</span>
        </nav>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-medium text-slate-900 mb-1">
              Products & Solutions
            </h1>
            <p className="text-xs text-slate-500">
              Manage your core product offerings and value propositions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {canEdit() && (
              <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setAddProductModalOpen(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 text-xs h-8 border-slate-200"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {filteredProducts.map((product: any, idx: number) => (
            <Card
              key={product.name}
              className="bg-white shadow-sm border-0 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              onClick={() => {
                console.log('Navigating to product details');
                navigate(`/workspace/${slug}/product`);
              }}
            >
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <CardTitle className="text-sm font-medium text-slate-800">
                    {product.name}
                  </CardTitle>
                  {canEdit() && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      <Edit className="w-3 h-3 text-slate-500" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 px-4 pb-4">
                <div className="space-y-2">
                  {product.valueProposition && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {product.valueProposition}
                    </p>
                  )}
                  
                  {/* Product Stats */}
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    {product.keyFeatures?.length > 0 && (
                      <span>Features: {product.keyFeatures.length}</span>
                    )}
                    {product.uniqueSellingPoints?.length > 0 && (
                      <span>USPs: {product.uniqueSellingPoints.length}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg border p-6 max-w-sm mx-auto">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-800 mb-1">
                {searchTerm ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start building your product portfolio'
                }
              </p>
              {canEdit() && !searchTerm && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setAddProductModalOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Your First Product
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Show metrics only when there are products */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            {/* Products Overview */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2 px-4 pt-3">
                <CardTitle className="text-xs font-medium text-slate-700 flex items-center space-x-2">
                  <Building2 className="w-3 h-3" />
                  <span>Products Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { metric: 'Total Products', value: filteredProducts.length.toString(), icon: '📦' },
                    { metric: 'With Value Props', value: filteredProducts.filter(p => p.valueProposition?.length > 0).length.toString(), icon: '💡' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{item.icon}</span>
                        <span className="text-xs font-medium text-slate-700">{item.metric}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features & USPs */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2 px-4 pt-3">
                <CardTitle className="text-xs font-medium text-slate-700 flex items-center space-x-2">
                  <Target className="w-3 h-3" />
                  <span>Features & USPs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { metric: 'Total Features', value: filteredProducts.reduce((sum, p) => sum + (p.keyFeatures?.length || 0), 0).toString(), icon: '⚡' },
                    { metric: 'Total USPs', value: filteredProducts.reduce((sum, p) => sum + (p.uniqueSellingPoints?.length || 0), 0).toString(), icon: '🎯' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{item.icon}</span>
                        <span className="text-xs font-medium text-slate-700">{item.metric}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Solutions & Outcomes */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2 px-4 pt-3">
                <CardTitle className="text-xs font-medium text-slate-700 flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>Solutions & Outcomes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { metric: 'Problems Solved', value: filteredProducts.reduce((sum, p) => sum + (p.problemsWithRootCauses?.length || 0), 0).toString(), icon: '🔧' },
                    { metric: 'Business Outcomes', value: filteredProducts.reduce((sum, p) => sum + (p.businessOutcomes?.length || 0), 0).toString(), icon: '📈' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{item.icon}</span>
                        <span className="text-xs font-medium text-slate-700">{item.metric}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
