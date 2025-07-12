
import { useState, useEffect } from 'react';
import { useParams, Navigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles, Edit } from 'lucide-react';

const ICPViewer = () => {
  const { id } = useParams();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const workspace = id ? storageService.getWorkspace(id) : null;
  const [icpData, setIcpData] = useState<ICPData | null>(null);

  // Get the current section from URL params
  const urlParams = new URLSearchParams(location.search);
  const selectedSection = urlParams.get('section') || 'products';

  useEffect(() => {
    if (id) {
      const data = storageService.getICPData(id);
      setIcpData(data);
    }
  }, [id]);

  if (!user || !workspace) {
    console.log("⛔ User not authenticated or workspace not found, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (!icpData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">No ICP Data Found</h2>
        <p className="text-slate-600 mb-6">Please complete the ICP Wizard first.</p>
        <Link to={`/workspace/${id}/icp-wizard`}>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Start ICP Wizard
          </Button>
        </Link>
      </div>
    );
  }

  const sections = [
    { key: 'products', label: 'Products', icon: '🛍️' },
    { key: 'personas', label: 'Personas', icon: '👥' },
    { key: 'useCases', label: 'Use Cases', icon: '💼' },
    { key: 'differentiation', label: 'Differentiation', icon: '⚡' },
    { key: 'segments', label: 'Segments', icon: '🏢' },
    { key: 'competitors', label: 'Competitors', icon: '📈' },
  ];

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

  // Get section content, handling the key mapping
  const getSectionContent = () => {
    const sectionKey = selectedSection === 'useCases' ? 'useCases' : selectedSection;
    return currentVersionData[sectionKey as keyof typeof currentVersionData] || 'No content available';
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold capitalize text-slate-800">
            {selectedSection.replace(/([A-Z])/g, ' $1')}
          </h1>
          
          <div className="flex items-center space-x-4">
            <Link to={`/workspace/${id}/icp-wizard`}>
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

        {/* Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">
                {sections.find(s => s.key === selectedSection)?.icon}
              </span>
              <span className="capitalize">
                {selectedSection.replace(/([A-Z])/g, ' $1')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {getSectionContent()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Generated Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">AI Generated Content</p>
              <p className="text-sm text-blue-700">
                This analysis was generated by Claude AI based on your input. 
                Switch between versions to see different perspectives and approaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICPViewer;
