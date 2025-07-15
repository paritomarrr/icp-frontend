
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Building2, Users, ArrowRight, Target, TrendingUp, Search, Filter, Plus, MoreHorizontal, ChevronRight, BarChart3, Users2, Globe } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { AddSegmentModal } from '@/components/modals';
import { icpWizardApi, SegmentData } from '@/lib/api';
import SegmentCard from '@/components/SegmentCard';

const Segments = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [addSegmentModalOpen, setAddSegmentModalOpen] = useState(false);

  useEffect(() => {
    const fetchICPData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      // Try localStorage first
      let data = storageService.getICPData(slug);
      if (data) {
        setIcpData(data);
        setLoading(false);
        return;
      }
      // Fallback: fetch from backend
      try {
        const res = await axiosInstance.get(`/workspaces/slug/${slug}`);
        if (res.data) {
          // Save to localStorage for future use
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

  const handleAddSegment = async (segmentData: SegmentData) => {
    if (!slug) return;
    
    try {
      const result = await icpWizardApi.addSegment(slug, segmentData);
      
      if (result.success) {
        console.log('Segment added successfully:', result.segment);
        // Refresh the ICP data to show the new segment
        const data = storageService.getICPData(slug);
        if (data) {
          setIcpData({ ...data }); // Force re-render
        }
        // You might want to add a toast notification here
      } else {
        console.error('Failed to add segment:', result.error);
        // You might want to show an error message to the user
      }
    } catch (error) {
      console.error('Error adding segment:', error);
    }
  };

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
              <p className="text-lg text-slate-600">Loading segments...</p>
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

  // Get segments directly from MongoDB structure
  const segments = Array.isArray(icpData?.segments) ? icpData.segments : [];
  
  // Transform segments to match display format using only backend data
  const allSegments = segments.map((segment: any, index: number) => {
    // Build firmographics from segment data
    const firmographics = [];
    if (segment.industry) firmographics.push({ label: 'Industry', value: segment.industry });
    if (segment.companySize) firmographics.push({ label: 'Company Size', value: segment.companySize });
    if (segment.geography) firmographics.push({ label: 'Geography', value: segment.geography });
    
    return {
      _id: segment._id,
      id: segment._id?.$oid || segment._id || index + 1,
      name: segment.name || `Segment ${index + 1}`,
      industry: segment.industry || '',
      companySize: segment.companySize || '',
      geography: segment.geography || '',
      awarenessLevel: segment.awarenessLevel || '',
      priority: segment.priority || 'medium',
      status: segment.status || 'active',
      firmographics: firmographics,
      locations: segment.locations || [],
      characteristics: segment.characteristics || [],
      industries: segment.industries || [],
      companySizes: segment.companySizes || [],
      technologies: segment.technologies || [],
      qualificationCriteria: segment.qualificationCriteria || [],
      signals: segment.signals || [],
      painPoints: segment.painPoints || [],
      buyingProcesses: segment.buyingProcesses || [],
      specificBenefits: segment.specificBenefits || [],
      ctaOptions: segment.ctaOptions || [],
      qualification: segment.qualification || {
        tier1Criteria: [],
        idealCriteria: [],
        lookalikeCompanies: [],
        disqualifyingCriteria: []
      },
      personas: segment.personas || [],
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt
    };
  });

  // Filter segments based on search and filter
  const filteredSegments = allSegments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.geography.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || segment.priority.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });



  return (
    <>
      <div className="p-6 bg-octave-light-1 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
            <Link to={`/workspace/${slug}`} className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Segments</span>
          </nav>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Market Segments</h1>
              <p className="text-xs text-muted-foreground">Segment your audience and craft targeted messages</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-xs"
                onClick={() => setAddSegmentModalOpen(true)}
              >
                <Plus className="w-3 h-3 mr-2" />
                Add Segment
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
              <Input
                placeholder="Search segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-foreground">Filter:</span>
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedFilter('all')}
              >
                All Segments
              </Button>
              <Button
                variant={selectedFilter === 'high' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedFilter('high')}
              >
                High Priority
              </Button>
              <Button
                variant={selectedFilter === 'medium' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedFilter('medium')}
              >
                Medium Priority
              </Button>
              <Button
                variant={selectedFilter === 'low' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedFilter('low')}
              >
                Low Priority
              </Button>
            </div>
          </div>

          {/* Segment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSegments.map((segment) => (
              <SegmentCard key={segment._id?.$oid || segment._id || segment.id} segment={segment} />
            ))}
          </div>

          {/* Enhanced Metrics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Segment Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-xl">📊</span>
                  <span className="text-base">Segment Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Total Segments', value: filteredSegments.length.toString(), icon: '🎯' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs font-medium text-slate-700">{item.metric}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personas */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-xl">👥</span>
                  <span className="text-base">Personas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-slate-700">
                    Total personas across segments: {allSegments.reduce((total, segment) => total + (segment.personas?.length || 0), 0)}
                  </div>
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Users2 className="w-3 h-3 mr-2" />
                      View All Personas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-xl">📦</span>
                  <span className="text-base">Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-slate-700">
                    {icpData?.products?.length ? `${icpData.products.length} product(s) configured` : 'No products configured'}
                  </div>
                  <Link to={`/workspace/${slug}/products`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Building2 className="w-3 h-3 mr-2" />
                      View All Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Segment Modal */}
      <AddSegmentModal
        open={addSegmentModalOpen}
        onOpenChange={setAddSegmentModalOpen}
        onSave={handleAddSegment}
      />
    </>
  );
};

export default Segments;
