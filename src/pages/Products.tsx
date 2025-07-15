
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

  // Get products directly from MongoDB structure
  const products = Array.isArray(icpData?.products) ? icpData.products : [];
  
  // Transform products using only MongoDB data
  const transformedProducts = products.map((product: any, index: number) => {
    // Ensure consistent ID handling - use MongoDB _id if available
    const productId = product._id?.$oid || product._id || (index + 1).toString();
    
    return {
      _id: product._id,
      id: productId,
      name: product.name || `Product ${index + 1}`,
      valueProposition: product.valueProposition || '',
      valuePropositionVariations: product.valuePropositionVariations || [],
      problems: product.problems || [],
      problemsWithRootCauses: product.problemsWithRootCauses || [],
      features: product.features || [],
      keyFeatures: product.keyFeatures || [],
      benefits: product.benefits || [],
      businessOutcomes: product.businessOutcomes || [],
      useCases: product.useCases || [],
      competitors: product.competitors || [],
      competitorAnalysis: product.competitorAnalysis || [],
      uniqueSellingPoints: product.uniqueSellingPoints || [],
      usps: product.usps || [],
      whyNow: product.whyNow || [],
      urgencyConsequences: product.urgencyConsequences || [],
      pricingTiers: product.pricingTiers || [],
      clientTimeline: product.clientTimeline || '',
      roiRequirements: product.roiRequirements || '',
      salesDeckUrl: product.salesDeckUrl || '',
      status: product.status || 'active',
      priority: product.priority || 'medium',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
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

  const userRole = getUserRole();

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
          <span className="text-slate-700">Products</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-slate-900 mb-1">
                Products & Solutions
              </h1>
              <p className="text-xs text-slate-600 mb-2">
                Manage your core product offerings and value propositions
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{filteredProducts.length} Products</span>
                </div>
                {userRole && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-blue-200 text-blue-700"
                  >
                    {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
                  </Badge>
                )}
              </div>
            </div>
            
            {canEdit() && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setAddProductModalOpen(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs border-slate-300"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredProducts.map((product: any, idx: number) => (
            <Card
              key={product.name}
              className="bg-white border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              onClick={() => {
                console.log('Navigating to product:', product.id, 'for product:', product.name);
                navigate(`/workspace/${slug}/products/${product.id}`);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-sm font-medium text-slate-900">
                    {product.name}
                  </CardTitle>
                  {canEdit() && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      <Edit className="w-3 h-3 text-slate-500" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {product.status && product.status !== 'active' && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {product.status}
                    </Badge>
                  )}
                  {product.priority && product.priority !== 'medium' && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {product.priority} priority
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {product.valueProposition && (
                    <div className="text-xs text-slate-600 line-clamp-2">
                      {product.valueProposition}
                    </div>
                  )}
                  
                  {/* Simple metrics */}
                  <div className="text-xs text-slate-500 space-y-1">
                    {product.keyFeatures?.length > 0 && (
                      <div>Features: {product.keyFeatures.length}</div>
                    )}
                    {product.uniqueSellingPoints?.length > 0 && (
                      <div>USPs: {product.uniqueSellingPoints.length}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg border p-8 max-w-md mx-auto">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                {searchTerm ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start building your product portfolio'
                }
              </p>
              {canEdit() && !searchTerm && (
                <Button 
                  variant="outline"
                  onClick={() => setAddProductModalOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
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
