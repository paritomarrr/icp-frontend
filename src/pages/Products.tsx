
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles, Building2, Users, Edit, ArrowRight, Search, Filter, Download, Plus, MoreHorizontal, Eye, Copy, Trash2, TrendingUp, Target, Zap } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';

const Products = () => {
  const { slug } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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
  if (!icpData) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">No ICP Data Found</p>
            <p>Please generate ICP data first.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get enrichment from icpData.icpEnrichmentVersions (use latest version if multiple)
  let enrichment;
  if (icpData.icpEnrichmentVersions) {
    const versionKeys = Object.keys(icpData.icpEnrichmentVersions);
    const latestVersion = versionKeys[versionKeys.length - 1];
    enrichment = icpData.icpEnrichmentVersions[latestVersion];
  }

  // Defensive fallback
  if (!enrichment) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">No Product Data Available</p>
            <p>Product enrichment data not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Parse and format the products content for display
  const parseProductContent = (enrichment: any) => {
    // If enrichment.products is an array of objects, use as is
    if (Array.isArray(enrichment.products)) {
      return enrichment.products.map((p: any, idx: number) => ({
        id: idx + 1,
        name: p.name || `Product ${idx + 1}`,
        description: p.solution || '',
        problems: p.problems || [],
        features: p.features || [],
        solution: p.solution || '',
        usps: p.usp || [],
        whyNow: p.whyNow || [],
        valueProposition: enrichment.oneLiner || '',
        status: 'active',
        priority: 'high',
        marketFit: 'validated'
      }));
    }
    // If enrichment.products is an object with arrays
    return [
      {
        id: 1,
        name: workspace.name,
        description: enrichment.products?.solution || '',
        problems: enrichment.products?.problems || [],
        features: enrichment.products?.features || [],
        solution: enrichment.products?.solution || '',
        usps: enrichment.products?.usp || [],
        whyNow: enrichment.products?.whyNow || [],
        valueProposition: enrichment.oneLiner || '',
        status: 'active',
        priority: 'high',
        marketFit: 'validated'
      }
    ];
  };

  const allProducts = parseProductContent(enrichment);
  const competitorContent = (enrichment.competitorDomains || []).join(', ');
  const segmentContent = (enrichment.segments || []).map((s: any) => s.name).join(', ');

  // Filter products based on search and filter
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || product.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Products</span>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Products & Solutions
            </h1>
            <p className="text-sm text-muted-foreground">
              {enrichment.oneLiner || "Product offerings and solutions"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-border hover:bg-accent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link to={`/workspace/${slug}/icp-wizard`}>
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-accent"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit ICP
              </Button>
            </Link>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">Filter:</span>
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={selectedFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('draft')}
            >
              Draft
            </Button>
          </div>
        </div>

        {/* Products Cards */}
        <div className="space-y-8">
          {/* Horizontal Scrollable Product Cards */}
          <div className="overflow-x-auto">
            <div className="flex space-x-6 pb-4" style={{ minWidth: 'max-content' }}>
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="w-80 flex-shrink-0 shadow-lg border border-border bg-card hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-foreground">{product.name}</CardTitle>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                      <Badge className={getPriorityColor(product.priority)}>
                        {product.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {product.description || 'Product description and overview'}
                      </div>
                      
                      {/* Quick Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">Market Fit</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-muted-foreground">Growth</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Problems: {Array.isArray(product.problems) ? product.problems.length : 0}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Metrics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Competitor Analysis */}
            <Card className="shadow-lg border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <span className="text-lg">🔍</span>
                  <span>Competitor Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-foreground text-sm leading-relaxed">
                    {competitorContent || 'No competitor analysis available'}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Competitors</span>
                    <span className="font-semibold text-foreground">{(enrichment.competitorDomains || []).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Segments */}
            <Card className="shadow-lg border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <span className="text-lg">🎯</span>
                  <span>Market Segments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-foreground text-sm leading-relaxed">
                    {segmentContent || 'Segment information'}
                  </div>
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Building2 className="w-3 h-3 mr-2" />
                      View All Segments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Product Performance */}
            <Card className="shadow-lg border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <span className="text-lg">📊</span>
                  <span>Product Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Total Products', value: filteredProducts.length.toString(), icon: '📦' },
                    { metric: 'Market Size', value: enrichment.marketSize || '$2.5B', icon: '💰' },
                    { metric: 'Growth Rate', value: enrichment.growthRate || '15% YoY', icon: '📈' },
                    { metric: 'Competitors', value: (enrichment.competitorDomains || []).length.toString(), icon: '🏢' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs font-medium text-foreground">{item.metric}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
