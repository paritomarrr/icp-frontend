
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ChevronLeft, ChevronRight, Building2, Users, Edit, ArrowRight, Search, Filter, Download, Plus, MoreHorizontal, Eye, Copy, Trash2, TrendingUp, Target, Zap, Lock } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { usePermissions } from '@/hooks/use-permissions';

const Products = () => {
  const { slug } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
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
  const transformedProducts = products.map((product: string, index: number) => {
    return {
      id: index + 1,
      name: product,
      description: `Core product offering for ${icpData?.companyName || 'Your Company'}`,
      category: 'Product',
      targetAudience: 'B2B',
      company: icpData?.companyName || 'Your Company',
      problems: [],
      features: [],
      usp: [],
      useCases: [],
      benefits: [],
      status: 'active',
      priority: 'high'
    };
  });

  const filteredProducts = transformedProducts.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userRole = getUserRole();

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Products</span>
        </nav>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">
              Products & Solutions
            </h1>
            <p className="text-xs text-muted-foreground">
              Your core offerings and value propositions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {userRole && (
              <Badge variant="outline" className="text-xs">
                {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
              </Badge>
            )}
            <Button variant="outline" size="sm" className="border-border hover:bg-accent text-xs">
              <Download className="w-3 h-3 mr-2" />
              Export
            </Button>
            {canEdit() && (
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
                <Plus className="w-3 h-3 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="border-border hover:bg-accent text-xs">
            <Filter className="w-3 h-3 mr-2" />
            Filter
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {filteredProducts.map((product: any, idx: number) => (
            <Card
              key={product.name}
              className="cursor-pointer border-0 transition-all duration-200 group shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-t-md rounded-b mb-1 tracking-wide">
                    Product
                  </span>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                    {canEdit() && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mb-1 truncate">
                  {product.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Target className="w-3 h-3 mr-1" />
                    {product.targetAudience || 'B2B'}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {product.category || 'Solution'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-slate-600 line-clamp-3 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Building2 className="w-3 h-3" />
                    <span>{product.company || 'Your Company'}</span>
                  </div>
                  {canEdit() && (
                    <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your core products and solutions'}
            </p>
            {canEdit() && (
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add First Product
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
