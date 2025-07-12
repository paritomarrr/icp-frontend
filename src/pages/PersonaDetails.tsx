import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const personaSummaries = [
  {
    title: 'Chief Marketing Officer',
    summary: 'The Chief Marketing Officer drives revenue growth by orchestrating demand generation, brand strategy, and cross-functional alignment.',
    created: 'Jun 18, 2025',
  },
  {
    title: 'Vice President of Marketing',
    summary: 'A senior marketing executive who owns the strategic direction and operational effectiveness of the marketing team.',
    created: 'Jun 18, 2025',
  },
  {
    title: 'Head of Content Strategy',
    summary: 'This executive owns the strategic direction and operational effectiveness of an organization’s content marketing efforts.',
    created: 'Jun 18, 2025',
  },
];

const personaRows = [
  'Segment',
  'Department',
  'Job Title',
  'Value Proposition',
  'Primary Responsibilities',
  'OKRs',
  'Pain Points',
];

const personaColumns = ['Decision Maker', 'Champion', 'End User'];

const parsePersonaData = (segmentName: string) => {
  const sampleData = {
    'Decision Maker': {
      'Segment': segmentName,
      'Department': 'Executive Leadership',
      'Job Title': 'CEO / CTO',
      'Value Proposition': 'Strategic competitive advantage through technology',
      'Primary Responsibilities': 'Strategic planning, budget allocation, technology roadmap',
      'OKRs': 'Increase market share by 20%, reduce operational costs by 15%',
      'Pain Points': 'Scaling challenges, technology debt, competitive pressure',
    },
    'Champion': {
      'Segment': segmentName,
      'Department': 'Sales / Marketing',
      'Job Title': 'VP Sales / CMO',
      'Value Proposition': 'Improved sales efficiency and customer acquisition',
      'Primary Responsibilities': 'Revenue growth, team management, process optimization',
      'OKRs': 'Increase conversion rates by 25%, reduce customer acquisition cost',
      'Pain Points': 'Manual processes, data silos, attribution challenges',
    },
    'End User': {
      'Segment': segmentName,
      'Department': 'Operations / IT',
      'Job Title': 'Sales Manager / Marketing Manager',
      'Value Proposition': 'Daily workflow efficiency and data insights',
      'Primary Responsibilities': 'Campaign execution, lead management, reporting',
      'OKRs': 'Improve lead quality, increase team productivity by 30%',
      'Pain Points': 'Tool fragmentation, manual reporting, data accuracy',
    },
  };
  return sampleData;
};

const PersonaDetails = () => {
  const navigate = useNavigate();
  const { personaIndex } = useParams();
  const idx = Number(personaIndex) || 0;
  const persona = personaSummaries[idx];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
          &larr; Back to Personas
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700 text-2xl">
                  {persona.title}
                </CardTitle>
                <div className="text-slate-600 text-base mt-2 mb-1">{persona.summary}</div>
                <div className="text-xs text-slate-400">Created: {persona.created}</div>
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
                      {personaRows.map((row) => {
                        const personaData = parsePersonaData(persona.title);
                        return (
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    { metric: 'Total Contacts Number', value: `${3847 - idx * 500}` },
                    { metric: 'Contacts Reached', value: `${892 - idx * 150}` },
                    { metric: 'Meetings Held', value: `${127 - idx * 20}` },
                    { metric: 'Deals Open', value: `${23 - idx * 3}` }
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

export default PersonaDetails; 