import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ArrowLeft, Building2, Target, TrendingUp, Users, ChevronRight, Sparkles, Download, Edit } from 'lucide-react';
import { icpWizardApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

const ProductDetails = () => {
  const { slug, productId } = useParams();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      const data = storageService.getICPData(slug);
      setIcpData(data);
    }
  }, [slug]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
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

  // Get products from the workspace data and ICP enrichment versions
  const rootProducts = Array.isArray(icpData?.products) ? icpData.products : [];
  const enrichmentData = icpData?.icpEnrichmentVersions;
  const latestVersion = enrichmentData ? Math.max(...Object.keys(enrichmentData).map(Number)) : null;
  const productEnrichment = latestVersion && enrichmentData?.[latestVersion]?.products;
  
  console.log('ProductDetails - icpData:', icpData);
  console.log('ProductDetails - Root products:', rootProducts);
  console.log('ProductDetails - Product enrichment:', productEnrichment);

  if (!rootProducts.length) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-600 bg-slate-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">No Product Data Available</p>
            <p>Product data not found.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Parse product content to extract individual products
  const parseProducts = () => {
    return rootProducts.map((productName: string, idx: number) => ({
      id: idx + 1,
      name: productName,
      description: `Core product offering for ${icpData?.companyName || 'Your Company'}`,
      problems: productEnrichment?.problems || ['Skills gap in advanced manufacturing', 'Limited internal R&D capabilities'],
      features: productEnrichment?.features || ['Custom technical training programs', 'Industry-academic research partnerships'],
      solution: productEnrichment?.solution || 'End-to-end technical capability development',
      usps: productEnrichment?.usp || ['Industry-validated curriculum', 'Hands-on project-based learning'],
      whyNow: productEnrichment?.whyNow || ['Industry 4.0 acceleration', 'Post-pandemic digital transformation'],
      valueProposition: latestVersion && enrichmentData?.[latestVersion]?.oneLiner || `${productName} - Core offering`
    }));
  };

  const products = parseProducts();
  const currentProduct = products.find(p => p.id === parseInt(productId || '1')) || products[0];

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
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={`/workspace/${slug}/products`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{displayData.name}</h1>
              <p className="text-lg text-slate-600 mt-1">{workspace.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
            {enhancedData && (
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
          
          <Link to={`/workspace/${slug}/icp-wizard`}>
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
              Edit ICP
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Product Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-slate-700 whitespace-pre-wrap">
                  {displayData.description || 'Product description and overview'}
                </div>
              </CardContent>
            </Card>

            {/* Problems & Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>Problems We Solve</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(displayData.problems) ? (
                      displayData.problems.map((problem: string, idx: number) => (
                        <div key={idx} className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                          {problem}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                        {displayData.problems || 'Customer pain points and challenges that this product addresses'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Our Solution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                    {displayData.solution || 'How this product solves the identified problems'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features & USPs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(displayData.features) ? (
                      displayData.features.map((feature: string, idx: number) => (
                        <div key={idx} className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                          {feature}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                        {displayData.features || 'Key features and capabilities of this product'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Unique Selling Propositions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(displayData.usps) ? (
                      displayData.usps.map((usp: string, idx: number) => (
                        <div key={idx} className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                          {usp}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
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
                <CardTitle>Why Now & Consequences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                  {currentProduct.whyNow || 'Urgency and consequences of not solving the problem'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Value Proposition */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Value Proposition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                  {currentProduct.valueProposition || 'Clear value proposition for this product'}
                </div>
              </CardContent>
            </Card>

            {/* Related Segments */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Target Segments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Building2 className="w-4 h-4 mr-2" />
                      View Segments
                    </Button>
                  </Link>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View Personas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Product Metrics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Product Metrics</CardTitle>
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
                        <span className="text-sm font-medium text-slate-700">{metric.label}</span>
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
    </div>
  );
};

export default ProductDetails; 