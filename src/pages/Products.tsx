
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles, Building2, Users, Edit } from 'lucide-react';

const Products = () => {
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

  console.log("workspace:", workspace);

  if (!workspace) {
    console.log("⛔ User not authenticated or workspace not found, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (!icpData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">No ICP Data Found</h2>
        {/* <p className="text-slate-600 mb-6">Please complete the ICP Wizard first.</p> */}
        <Link to={`/workspace/${slug}/icp-wizard`}>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Start ICP Wizard
          </Button>
        </Link>
      </div>
    );
  }

  const changeVersion = (direction: 'prev' | 'next') => {
    const totalVersions = Object.keys(icpData.versions).length;
    let newVersion = icpData.currentVersion;
    
    if (direction === 'prev') {
      newVersion = newVersion > 1 ? newVersion - 1 : totalVersions;
    } else {
      newVersion = newVersion < totalVersions ? newVersion + 1 : 1;
    }
    
    const updatedData = { ...icpData, currentVersion: newVersion };
    setIcpData(updatedData);
    storageService.saveICPData(updatedData);
  };

  const currentVersionData = icpData.versions[icpData.currentVersion];
  const totalVersions = Object.keys(icpData.versions).length;

  // Parse and format the products content
  const parseProductContent = (content: string) => {
    const sections = content.split('\n\n');
    const parsed = {
      problems: '',
      features: '',
      solution: '',
      usps: '',
      whyNow: '',
      valueProposition: ''
    };

    sections.forEach(section => {
      if (section.toLowerCase().includes('problem')) {
        parsed.problems = section.replace(/^.*?problem.*?:?\s*/i, '').trim();
      } else if (section.toLowerCase().includes('feature')) {
        parsed.features = section.replace(/^.*?feature.*?:?\s*/i, '').trim();
      } else if (section.toLowerCase().includes('solution')) {
        parsed.solution = section.replace(/^.*?solution.*?:?\s*/i, '').trim();
      } else if (section.toLowerCase().includes('usp') || section.toLowerCase().includes('unique')) {
        parsed.usps = section.replace(/^.*?usp.*?:?\s*/i, '').trim();
      } else if (section.toLowerCase().includes('why now')) {
        parsed.whyNow = section.replace(/^.*?why now.*?:?\s*/i, '').trim();
      } else if (section.toLowerCase().includes('value proposition')) {
        parsed.valueProposition = section.replace(/^.*?value proposition.*?:?\s*/i, '').trim();
      }
    });

    return parsed;
  };

  const productContent = parseProductContent(currentVersionData.products || '');
  const competitorContent = currentVersionData.competitors || '';
  const segmentContent = currentVersionData.segments || '';

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {workspace.name} - Product Analysis
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              {productContent.valueProposition || "We help X do Y by doing Z"}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to={`/workspace/${slug}/icp-wizard`}>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 hover:bg-slate-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit ICP
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeVersion('prev')}
              className="border-slate-200 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                Version {icpData.currentVersion} of {totalVersions}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeVersion('next')}
              className="border-slate-200 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Quo */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🧱</span>
                  <span>Status Quo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700">Problems</h4>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                      {productContent.problems || 'No problems identified'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700">Features</h4>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                      {productContent.features || 'Key features from product analysis'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700">Solution</h4>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                      {productContent.solution || 'Solution approach'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700">USPs (Why you)</h4>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                      {productContent.usps || 'Unique selling propositions'}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-700">Why now & consequences of not solving</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                    {productContent.whyNow || currentVersionData.useCases?.split('.')[0] || 'Urgency and consequences'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Domains */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🔍</span>
                  <span>Competitor Domains</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-700 whitespace-pre-wrap">
                  {competitorContent || 'No competitor analysis available'}
                </div>
              </CardContent>
            </Card>

            {/* Segments */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🔀</span>
                  <span>Segments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-slate-700 flex-1 pr-4">
                    <div className="whitespace-pre-wrap">
                      {segmentContent?.split('.')[0] || 'Segment information'}
                    </div>
                  </div>
                  <Link to={`/workspace/${slug}/segments`}>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>View Segments</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - 1/3 */}
          <div className="space-y-6">
            {/* Offer */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🎁</span>
                  <span>Offer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-700">Packages & Pricing</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    Pricing structure and packages
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-700">Timeline</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    Implementation timeline
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-700">Sales Deck</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    Key sales materials
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Studies */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📚</span>
                  <span>Case Studies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Mapped to segments
                </p>
                <div className="space-y-2">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <p className="text-xs text-yellow-700 font-medium">Note</p>
                    <p className="text-xs text-yellow-600">
                      Mapped to segments
                    </p>
                  </div>
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
