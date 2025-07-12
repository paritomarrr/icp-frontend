
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Building2, Users, Download, ArrowRight, Target, TrendingUp, Search, Filter, Plus, MoreHorizontal, Eye, Copy, Trash2, ChevronRight, BarChart3, Users2, Globe } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';

const Segments = () => {
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

  // Parse segments from the ICP data structure
  const parseSegments = (segmentsData: any) => {
    if (!segmentsData || !Array.isArray(segmentsData)) {
      console.log('parseSegments: segmentsData is not an array:', segmentsData);
      return [];
    }
    
    console.log('parseSegments: Processing segments:', segmentsData);
    
    return segmentsData.map((segment, index) => {
      try {
        console.log(`parseSegments: Processing segment ${index}:`, segment);
        const segmentName = segment.name || segment.title || `Segment ${index + 1}`;
        const revenue = segment.revenue || segment.criteria || '';
        // Ensure characteristics is an array and handle different data types
        let characteristics = segment.characteristics || [];
        if (!Array.isArray(characteristics)) {
          // If characteristics is a string, split it into an array
          if (typeof characteristics === 'string') {
            characteristics = characteristics.split(',').map(c => c.trim());
          } else if (characteristics && typeof characteristics === 'object') {
            // If it's an object, try to extract values
            characteristics = Object.values(characteristics).filter(v => typeof v === 'string');
          } else {
            characteristics = [];
          }
        }
        
        const priority = segment.priority || 'Medium';
        const firmographics = [];
        if (revenue) {
          firmographics.push({ label: 'Revenue', value: revenue });
        }
        if (segment.employees) {
          firmographics.push({ label: 'Employees', value: segment.employees });
        }
        if (characteristics.length > 0) {
          characteristics.forEach((char: string) => {
            firmographics.push({ label: 'Characteristic', value: char });
          });
        }
        if (firmographics.length === 0) {
          firmographics.push(
            { label: 'Revenue', value: '$10M - $100M ARR' },
            { label: 'Industry', value: 'B2B Technology' },
            { label: 'Employees', value: '50 - 500 employees' }
          );
        }
        return {
          id: index + 1,
          name: segmentName,
          description: `Target segment for ${workspace.name}`,
          firmographics: firmographics,
          benefits: `High-value customers with proven need for ${workspace.name} solutions`,
          awarenessLevel: 'Solution',
          priority: priority,
          status: 'active',
          marketSize: '$500M - $2B',
          growthRate: '12% YoY',
          qualification: {
            tier1Criteria: ['Revenue > $10M', 'Technology adoption', 'Growth stage'],
            lookalikeCompanies: ['salesforce.com', 'hubspot.com', 'slack.com'],
            disqualifyingCriteria: ['Less than 50 employees', 'Pre-revenue stage', 'Legacy systems only']
          }
        };
      } catch (error) {
        console.error(`Error processing segment ${index}:`, error, segment);
        // Return a fallback segment object
        return {
          id: index + 1,
          name: `Segment ${index + 1}`,
          description: `Target segment for ${workspace.name}`,
          firmographics: [
            { label: 'Revenue', value: '$10M - $100M ARR' },
            { label: 'Industry', value: 'B2B Technology' },
            { label: 'Employees', value: '50 - 500 employees' }
          ],
          benefits: `High-value customers with proven need for ${workspace.name} solutions`,
          awarenessLevel: 'Solution',
          priority: 'Medium',
          status: 'active',
          marketSize: '$500M - $2B',
          growthRate: '12% YoY',
          qualification: {
            tier1Criteria: ['Revenue > $10M', 'Technology adoption', 'Growth stage'],
            lookalikeCompanies: ['salesforce.com', 'hubspot.com', 'slack.com'],
            disqualifyingCriteria: ['Less than 50 employees', 'Pre-revenue stage', 'Legacy systems only']
          }
        };
      }
    });
  };

  // Get segments from the workspace data and ICP enrichment versions
  const rootSegments = Array.isArray(icpData?.segments) ? icpData.segments : [];
  const enrichmentData = icpData?.icpEnrichmentVersions;
  const latestVersion = enrichmentData ? Math.max(...Object.keys(enrichmentData).map(Number)) : null;
  const segmentsEnrichment = latestVersion && enrichmentData?.[latestVersion]?.segments || [];
  
  console.log('Segments - Root segments:', rootSegments);
  console.log('Segments - Enrichment data:', segmentsEnrichment);
  
  // Transform the segments array into the expected format
  const allSegments = rootSegments.map((segmentDesc: string, index: number) => {
    // Extract meaningful segment name from description
    // Try to extract company type/industry from the description
    let segmentName = `Segment ${index + 1}`;
    
    // Look for key patterns to extract segment names
    if (segmentDesc.includes('manufacturing')) {
      segmentName = 'Enterprise Manufacturing';
    } else if (segmentDesc.includes('engineering firms')) {
      segmentName = 'Mid-size Engineering Firms';
    } else if (segmentDesc.includes('construction')) {
      segmentName = 'Construction & Infrastructure';
    } else if (segmentDesc.includes('technology startups') || segmentDesc.includes('startups')) {
      segmentName = 'Technology Startups';
    } else {
      // Extract the first part before any size/region descriptors
      const match = segmentDesc.match(/^([^(]+)/);
      if (match) {
        segmentName = match[1].trim();
        // Clean up common prefixes
        segmentName = segmentName.replace(/^(Large|Mid-sized|Small)\s+/, '');
      }
    }
    
    // Try to find matching enrichment data
    const enrichmentMatch = segmentsEnrichment.find((s: any) => 
      s.name && (segmentDesc.toLowerCase().includes(s.name.toLowerCase()) ||
                 s.name.toLowerCase().includes(segmentName.toLowerCase()))
    );
    
    return {
      id: index + 1,
      name: enrichmentMatch?.name || segmentName,
      description: segmentDesc,
      firmographics: [
        { label: 'Size', value: enrichmentMatch?.size || '100-500 employees' },
        { label: 'Region', value: enrichmentMatch?.region || 'Global' },
        { label: 'Budget', value: enrichmentMatch?.budget || '$200K-500K' },
        { label: 'Focus', value: enrichmentMatch?.focus || 'Growth' }
      ],
      benefits: `High-value customers with proven need for ${icpData?.companyName || 'Your Company'} solutions`,
      awarenessLevel: 'Solution',
      priority: 'High',
      status: 'active',
      marketSize: '$500M - $2B',
      growthRate: '12% YoY',
      qualification: {
        tier1Criteria: enrichmentMatch?.criteria?.split(',') || ['Revenue > $10M', 'Technology adoption', 'Growth stage'],
        lookalikeCompanies: ['salesforce.com', 'hubspot.com', 'slack.com'],
        disqualifyingCriteria: ['Less than 50 employees', 'Pre-revenue stage', 'Legacy systems only']
      }
    };
  });

  // Filter segments based on search and filter
  const filteredSegments = allSegments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || segment.priority.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Debug: Log the actual segment data to see what we're working with
  console.log('icpData:', icpData);
  console.log('Root segments:', rootSegments);
  console.log('Transformed segments:', allSegments);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
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
            <Button variant="outline" size="sm" className="border-border hover:bg-accent text-xs">
              <Download className="w-3 h-3 mr-2" />
              Export
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-xs"
              onClick={() => {
                // For now, just show an alert. In a real app, this would open a modal or go to a specific wizard step
                alert('Add Segment functionality - This would typically open a modal or go to a specific step in the ICP Wizard');
              }}
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

        {/* Segments Cards */}
        <div className="space-y-6">
          {/* Horizontal Scrollable Segment Cards */}
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4" style={{ minWidth: 'max-content' }}>
              {filteredSegments.map((segment) => (
                <Card 
                  key={segment.id} 
                  className="w-96 flex-shrink-0 shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => window.location.href = `/workspace/${slug}/segments/${segment.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <CardTitle className="text-base font-semibold text-slate-800">{segment.name}</CardTitle>
                      </div>
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
                      <Badge className={`${getPriorityColor(segment.priority)} text-xs`}>
                        {segment.priority} Priority
                      </Badge>
                      <Badge className={`${getStatusColor(segment.status)} text-xs`}>
                        {segment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-xs text-slate-600 line-clamp-2">
                        {segment.description || 'Segment description and overview'}
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500 mb-1">Market Size</div>
                          <div className="text-xs font-semibold text-slate-800">{segment.marketSize}</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500 mb-1">Growth Rate</div>
                          <div className="text-xs font-semibold text-slate-800">{segment.growthRate}</div>
                        </div>
                      </div>

                      {/* Firmographics */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-slate-700">Key Characteristics</div>
                        <div className="flex flex-wrap gap-1">
                          {segment.firmographics.slice(0, 3).map((firmo: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {firmo.value}
                            </Badge>
                          ))}
                          {segment.firmographics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.firmographics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Qualification Criteria: {segment.qualification.tier1Criteria.length}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Metrics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    { metric: 'Total Segments', value: filteredSegments.length.toString(), icon: '🎯' },
                    { metric: 'High Priority', value: filteredSegments.filter(s => s.priority.toLowerCase() === 'high').length.toString(), icon: '🔥' },
                    { metric: 'Market Coverage', value: '85%', icon: '🌍' },
                    { metric: 'Avg. Market Size', value: '$1.2B', icon: '💰' }
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
                    Chief Marketing Officer, Vice President of Marketing, Head of Content Strategy
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
                    {workspace.name} - Main product offering
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
    </div>
  );
};

export default Segments;
