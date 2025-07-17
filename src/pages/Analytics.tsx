import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Globe, Building, Target, Users, TrendingUp, Activity } from 'lucide-react';

const Analytics = () => {
  const { slug } = useParams();  
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  const domain = workspace?.domain || 'URL Not Available';
  const [icpData, setIcpData] = useState<ICPData | null>(null);

  useEffect(() => {
    if (slug) {
      const data = storageService.getICPData(slug);
      setIcpData(data);
    }
  }, [slug]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  // Get the latest enrichment version
  const enrichment = icpData?.icpEnrichmentVersions;
  
  // Find the latest version by getting the last key
  const latestVersionKey = enrichment ? Object.keys(enrichment).sort().pop() : null;
  const latestVersion = latestVersionKey ? enrichment[latestVersionKey] : null;

  const segmentCount = workspace?.segments?.length || 0;
  const personaCount = workspace?.segments?.reduce((total, segment) => total + (segment.personas?.length || 0), 0);

  return (
    <div className="p-8 bg-octave-light-1 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Company Banner */}
        <Card className="shadow-xl border-0 bg-octave-dark-1">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white">{workspace.name || 'Company Name Not Available'}</h1>
              <div className="flex items-center space-x-2 text-white/90">
                <Globe className="w-3 h-3" />
                <span className="text-xs">{domain}</span>
              </div>
              <p className="text-white/95 text-xs max-w-3xl leading-relaxed">
                {workspace.companyDescription || 'Company description not available'}
              </p>
              <p className="text-white/85 text-xs max-w-4xl leading-relaxed">
                {workspace.companyValueAndMissionSummary || 'Company value and mission summary not available'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <Card className="shadow-lg border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-octave-dark-1">
                <Target className="w-3 h-3" />
                <span>ICP Segments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-octave-dark-3">
                {segmentCount}
              </div>
              <p className="text-xs text-octave-dark-1">Active segments</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-octave-dark-1">
                <Users className="w-3 h-3" />
                <span>Personas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-octave-dark-3">
                {personaCount}
              </div>
              <p className="text-xs text-octave-dark-1">Mapped personas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-octave-dark-1">
                <Building className="w-3 h-3" />
                <span>Target Accounts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-octave-dark-3">1,247</div>
              <p className="text-xs text-octave-dark-1">Qualified accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-octave-dark-1">
                <TrendingUp className="w-3 h-3" />
                <span>Conversion Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-octave-dark-3">12.4%</div>
              <p className="text-xs text-octave-dark-1">Outbound to meeting</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-octave-dark-2" />
                <span className="text-base text-octave-dark-3">Outreach Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-octave-light-1 rounded-lg">
                <p className="text-xs text-octave-dark-1">Performance charts coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-octave-dark-2" />
                <span className="text-base text-octave-dark-3">Segment Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-octave-light-1 rounded-lg">
                <p className="text-xs text-octave-dark-1">Segment analysis coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-xl border border-octave-light-2 bg-white hover:border-octave-light-3 transition-colors">
          <CardHeader>
            <CardTitle className="text-base text-octave-dark-3">Recent ICP Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-octave-light-1 rounded-lg">
                <div className="w-2 h-2 bg-octave-accent rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-octave-dark-3">ICP analysis generated</p>
                  <p className="text-xs text-octave-dark-1">4 variants created by Claude AI</p>
                </div>
                <div className="ml-auto text-xs text-octave-dark-1">Just now</div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-octave-light-1 rounded-lg">
                <div className="w-2 h-2 bg-octave-dark-2 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-octave-dark-3">Workspace created</p>
                  <p className="text-xs text-octave-dark-1">New ICP project initialized</p>
                </div>
                <div className="ml-auto text-xs text-octave-dark-1">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
