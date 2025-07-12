
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Building2, Users, Download } from 'lucide-react';

const Segments = () => {
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

  // Parse segment data to extract meaningful segment names
  const parseSegmentNames = (segmentContent: string) => {
    const lines = segmentContent?.split('\n') || [];
    const segments = [];
    
    for (const line of lines) {
      if (line.includes('Segment') && !line.includes('analysis')) {
        segments.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    }
    
    return segments.length > 0 ? segments : ['Enterprise SaaS Companies', 'Mid-Market Technology Firms', 'SMB Digital Agencies'];
  };

  const segmentNames = parseSegmentNames(currentVersionData?.segments || '');
  const currentSegmentName = segmentNames[0] || 'Account Segment 1';

  // Parse firmographics from Claude output
  const parseFirmographics = (content: string) => {
    const defaultFirmographics = [
      { label: 'Revenue', value: '$10M - $100M ARR' },
      { label: 'Industry', value: 'B2B SaaS Technology' },
      { label: 'Employees', value: '50 - 500 employees' },
      { label: 'Location', value: 'North America, Europe' },
      { label: 'Business Model', value: 'Subscription-based' },
      { label: 'Tools', value: 'Salesforce, HubSpot, Slack' }
    ];

    if (!content) return defaultFirmographics;

    // Try to extract structured data from Claude output
    const lines = content.split('\n');
    const firmographics = [];
    
    for (const line of lines) {
      if (line.includes('Revenue:') || line.includes('revenue')) {
        firmographics.push({ label: 'Revenue', value: line.split(':')[1]?.trim() || '$10M - $100M ARR' });
      }
      if (line.includes('Industry:') || line.includes('industry')) {
        firmographics.push({ label: 'Industry', value: line.split(':')[1]?.trim() || 'B2B SaaS Technology' });
      }
      if (line.includes('Employees:') || line.includes('employees')) {
        firmographics.push({ label: 'Employees', value: line.split(':')[1]?.trim() || '50 - 500 employees' });
      }
    }

    return firmographics.length > 0 ? firmographics : defaultFirmographics;
  };

  const firmographics = parseFirmographics(currentVersionData?.segments || '');

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">{currentSegmentName}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side - 3/4 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Firmographics */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🧩</span>
                  <span>Firmographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {firmographics.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <h4 className="font-semibold text-slate-700">{item.label}</h4>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Benefits of this segment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {currentVersionData?.segments?.split('.').slice(0, 2).join('. ') || 'High-value customers with proven need for scalable solutions. Strong budget allocation for growth-enabling tools.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Awareness Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Unaware', 'Problem', 'Solution', 'Product', 'Most Aware'].map((level, index) => (
                      <div key={level} className={`p-2 rounded ${index === 2 ? 'bg-blue-100 text-blue-800' : 'bg-slate-50'}`}>
                        {level}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>CTA Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Link to={`/workspace/${slug}/personas`}>
                    <Button className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>View Personas</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - 1/4 */}
          <div className="space-y-6">
            {/* Qualification */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span>Qualification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Tier 1 Criteria</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    • Revenue &gt; $10M
                    <br />
                    • Technology stack complexity
                    <br />
                    • Growth stage indicators
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Lookalike Companies</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    • salesforce.com
                    <br />
                    • hubspot.com
                    <br />
                    • slack.com
                    <br />
                    • zoom.us
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Disqualifying Criteria</h4>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    • Less than 50 employees
                    <br />
                    • Pre-revenue stage
                    <br />
                    • B2C focus only
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Companies */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🗂️</span>
                  <span>Total Companies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Total Account Number', value: '1,247' },
                    { metric: 'Accounts Reached', value: '324' },
                    { metric: 'Meetings Held', value: '42' },
                    { metric: 'Deals Open', value: '8' }
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.metric}</p>
                        <p className="text-lg font-bold text-slate-900">{item.value}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </Button>
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

export default Segments;
