
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
  console.log('Analytics - icpData:', icpData);
  console.log('Analytics - Enrichment:', enrichment);
  
  // Find the latest version by getting the last key
  const latestVersionKey = enrichment ? Object.keys(enrichment).sort().pop() : null;
  const latestVersion = latestVersionKey ? enrichment[latestVersionKey] : null;
  
  console.log('Analytics - Latest version key:', latestVersionKey);
  console.log('Analytics - Latest version data:', latestVersion);

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Company Banner */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold">{workspace.companyName}</h1>
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Globe className="w-3 h-3" />
                <span className="text-xs">{workspace.companyUrl}</span>
              </div>
              <p className="text-primary-foreground/90 text-xs max-w-3xl leading-relaxed">
                {latestVersion?.products?.solution?.split('.')[0] || 'Company description from Claude analysis'}
              </p>
              <p className="text-primary-foreground/80 text-xs max-w-4xl leading-relaxed">
                {latestVersion?.differentiation?.split('.').slice(0, 2).join('.') || 'Company value and mission summary'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <Card className="shadow-lg border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                <Target className="w-3 h-3" />
                <span>ICP Segments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {latestVersion?.segments?.length || 3}
              </div>
              <p className="text-xs text-muted-foreground">Active segments</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>Personas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">9</div>
              <p className="text-xs text-muted-foreground">Mapped personas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                <Building className="w-3 h-3" />
                <span>Target Accounts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">1,247</div>
              <p className="text-xs text-muted-foreground">Qualified accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>Conversion Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">12.4%</div>
              <p className="text-xs text-muted-foreground">Outbound to meeting</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-base">Outreach Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Performance charts coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="text-base">Segment Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Segment analysis coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent ICP Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-slate-900">ICP analysis generated</p>
                  <p className="text-xs text-slate-500">4 variants created by Claude AI</p>
                </div>
                <div className="ml-auto text-xs text-slate-400">Just now</div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-slate-900">Workspace created</p>
                  <p className="text-xs text-slate-500">New ICP project initialized</p>
                </div>
                <div className="ml-auto text-xs text-slate-400">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
