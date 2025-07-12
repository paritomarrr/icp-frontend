
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { ICPData } from '@/types';
import { Users, Download } from 'lucide-react';

const Personas = () => {
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

  const personaRows = [
    'Segment',
    'Department', 
    'Job Title',
    'Value Proposition',
    'Primary Responsibilities',
    'OKRs',
    'Pain Points'
  ];

  const personaColumns = ['Decision Maker', 'Champion', 'End User'];

  // Parse persona data for each segment
  const parsePersonaData = (personaContent: string, segmentName: string) => {
    const sampleData = {
      'Decision Maker': {
        'Segment': segmentName,
        'Department': 'Executive Leadership',
        'Job Title': 'CEO / CTO',
        'Value Proposition': 'Strategic competitive advantage through technology',
        'Primary Responsibilities': 'Strategic planning, budget allocation, technology roadmap',
        'OKRs': 'Increase market share by 20%, reduce operational costs by 15%',
        'Pain Points': 'Scaling challenges, technology debt, competitive pressure'
      },
      'Champion': {
        'Segment': segmentName,
        'Department': 'Sales / Marketing',
        'Job Title': 'VP Sales / CMO',
        'Value Proposition': 'Improved sales efficiency and customer acquisition',
        'Primary Responsibilities': 'Revenue growth, team management, process optimization',
        'OKRs': 'Increase conversion rates by 25%, reduce customer acquisition cost',
        'Pain Points': 'Manual processes, data silos, attribution challenges'
      },
      'End User': {
        'Segment': segmentName,
        'Department': 'Operations / IT',
        'Job Title': 'Sales Manager / Marketing Manager',
        'Value Proposition': 'Daily workflow efficiency and data insights',
        'Primary Responsibilities': 'Campaign execution, lead management, reporting',
        'OKRs': 'Improve lead quality, increase team productivity by 30%',
        'Pain Points': 'Tool fragmentation, manual reporting, data accuracy'
      }
    };

    return sampleData;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Personas by Segment
          </h1>
        </div>

        <Tabs defaultValue="segment-0" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {segmentNames.slice(0, 3).map((segment, index) => (
              <TabsTrigger key={index} value={`segment-${index}`}>
                {segment.length > 30 ? `${segment.substring(0, 30)}...` : segment}
              </TabsTrigger>
            ))}
          </TabsList>

          {segmentNames.slice(0, 3).map((segment, segmentIndex) => {
            const personaData = parsePersonaData(currentVersionData?.personas || '', segment);
            
            return (
              <TabsContent key={segmentIndex} value={`segment-${segmentIndex}`} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Side - 3/4 */}
                  <div className="lg:col-span-3">
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="text-2xl">🧾</span>
                          <span>Persona Matrix - {segment}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border border-slate-200 p-3 bg-slate-50 text-left font-semibold text-slate-700">
                                  Criteria
                                </th>
                                {personaColumns.map((column) => (
                                  <th key={column} className="border border-slate-200 p-3 bg-slate-50 text-left font-semibold text-slate-700">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {personaRows.map((row) => (
                                <tr key={row}>
                                  <td className="border border-slate-200 p-3 font-medium text-slate-700 bg-slate-25">
                                    {row}
                                  </td>
                                  {personaColumns.map((column) => (
                                    <td key={`${row}-${column}`} className="border border-slate-200 p-3 text-sm text-slate-600">
                                      {personaData[column as keyof typeof personaData][row as keyof typeof personaData.Champion] || 'Content'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Side - 1/4 */}
                  <div>
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="text-2xl">📊</span>
                          <span>Total Contacts</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { metric: 'Total Contacts Number', value: `${3847 - segmentIndex * 500}` },
                            { metric: 'Contacts Reached', value: `${892 - segmentIndex * 150}` },
                            { metric: 'Meetings Held', value: `${127 - segmentIndex * 20}` },
                            { metric: 'Deals Open', value: `${23 - segmentIndex * 3}` }
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
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Personas;
