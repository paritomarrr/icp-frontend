
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

  const currentVersionData = icpData?.versions[icpData.currentVersion || 1];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Company Banner */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold">{workspace.companyName}</h1>
              <div className="flex items-center space-x-2 text-blue-100">
                <Globe className="w-5 h-5" />
                <span className="text-lg">{workspace.companyUrl}</span>
              </div>
              <p className="text-blue-100 text-lg max-w-3xl">
                {currentVersionData?.products?.split('.')[0] || 'Company description from Claude analysis'}
              </p>
              <p className="text-white/90 text-base max-w-4xl">
                {currentVersionData?.differentiation?.split('.').slice(0, 2).join('.') || 'Company value and mission summary'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                <Target className="w-4 h-4" />
                <span>ICP Segments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">3</div>
              <p className="text-xs text-slate-500">Active segments</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                <Users className="w-4 h-4" />
                <span>Personas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">9</div>
              <p className="text-xs text-slate-500">Mapped personas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                <Building className="w-4 h-4" />
                <span>Target Accounts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">1,247</div>
              <p className="text-xs text-slate-500">Qualified accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                <TrendingUp className="w-4 h-4" />
                <span>Conversion Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">12.4%</div>
              <p className="text-xs text-slate-500">Outbound to meeting</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Outreach Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-slate-500">Performance charts coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Segment Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-slate-500">Segment analysis coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent ICP Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">ICP analysis generated</p>
                  <p className="text-xs text-slate-500">4 variants created by Claude AI</p>
                </div>
                <div className="ml-auto text-xs text-slate-400">Just now</div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Workspace created</p>
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
