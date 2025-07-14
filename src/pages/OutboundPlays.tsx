
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';

const OutboundPlays = () => {
  const { slug } = useParams();  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  const plays = [
    {
      category: 'Warm',
      color: 'bg-green-100',
      items: [
        { name: 'Referrals from C-Suite/Advisors/VC/Customers/Employees', tools: 'LinkedIn, Network', relevant: true, howTo: 'Use warm introductions' },
        { name: 'Mutual LinkedIn connections with your company/customers', tools: 'LinkedIn', relevant: true, howTo: 'Find connections' },
        { name: 'Referrals from C-Suite/Advisors/VC/Customers/Influencers/Friends', tools: 'Network', relevant: false, howTo: 'Direct ask' },
        { name: 'Networking events/conference attendees', tools: 'Events', relevant: true, howTo: 'Follow up post-event' },
        { name: 'Vendors who just sold you their product', tools: 'CRM', relevant: false, howTo: 'Leverage relationship' }
      ]
    },
    {
      category: 'Signal-based',
      color: 'bg-yellow-100',
      items: [
        { name: 'LinkedIn Signals', tools: 'LinkedIn', relevant: true, howTo: 'Use triggers' },
        { name: 'Special influencer guest engagement', tools: 'Social', relevant: true, howTo: 'Engage with content' },
        { name: 'Keyword monitoring LinkedIn posts', tools: 'LinkedIn', relevant: true, howTo: 'Monitor keywords' },
        { name: 'Your company\'s followers', tools: 'Social', relevant: false, howTo: 'Engage followers' },
        { name: 'Competitor company\'s followers', tools: 'Social', relevant: true, howTo: 'Target competitor audience' },
        { name: 'Competitor personal followers', tools: 'Social', relevant: true, howTo: 'Engage with competitor followers' },
        { name: 'LinkedIn Event Attendees', tools: 'LinkedIn', relevant: false, howTo: 'Connect post-event' },
        { name: 'LinkedIn Group Members', tools: 'LinkedIn', relevant: false, howTo: 'Engage in groups' }
      ]
    },
    {
      category: 'Signal-based',
      color: 'bg-yellow-100',
      items: [
        { name: 'Technographic Signals', tools: 'Tools', relevant: true, howTo: 'Monitor tech stack' },
        { name: 'Integrations overlap', tools: 'APIs', relevant: true, howTo: 'Find integration opportunities' },
        { name: 'Competitor tech stack identified', tools: 'Tools', relevant: true, howTo: 'Target similar stacks' },
        { name: 'Using specific tech', tools: 'Tech intel', relevant: false, howTo: 'Leverage tech usage' }
      ]
    },
    {
      category: 'Signal-based',
      color: 'bg-yellow-100',
      items: [
        { name: 'Employment Signals', tools: 'LinkedIn', relevant: true, howTo: 'Target job changes' },
        { name: 'Champions that changed jobs', tools: 'LinkedIn', relevant: true, howTo: 'Follow champions' },
        { name: 'Previous companies of champions from', tools: 'LinkedIn', relevant: false, howTo: 'Target previous companies' },
        { name: 'Alumni from your best Won Account', tools: 'LinkedIn', relevant: true, howTo: 'Leverage alumni network' },
        { name: 'New hires', tools: 'LinkedIn', relevant: false, howTo: 'Target new hires' },
        { name: 'Promoted', tools: 'LinkedIn', relevant: true, howTo: 'Congratulate promotions' },
        { name: 'Open jobs', tools: 'Job boards', relevant: true, howTo: 'Target hiring companies' },
        { name: 'No specific department', tools: 'General', relevant: false, howTo: 'Broad targeting' }
      ]
    },
    {
      category: 'Signal-based',
      color: 'bg-yellow-100',
      items: [
        { name: 'Funding & News', tools: 'News', relevant: true, howTo: 'Target funded companies' },
        { name: 'Fundraise Announcements posts /press', tools: 'Press', relevant: true, howTo: 'Leverage funding news' },
        { name: 'Last series funding', tools: 'Funding data', relevant: false, howTo: 'Target by funding stage' },
        { name: 'News', tools: 'News alerts', relevant: true, howTo: 'Use news triggers' },
        { name: 'M&A Events', tools: 'M&A data', relevant: false, howTo: 'Target M&A activity' },
        { name: '10K Reports Mention', tools: 'SEC filings', relevant: false, howTo: 'Monitor filings' }
      ]
    },
    {
      category: 'Signal-based',
      color: 'bg-yellow-100',
      items: [
        { name: 'Review Signals', tools: 'Review sites', relevant: true, howTo: 'Monitor reviews' },
        { name: 'G2 Profile Visits', tools: 'G2', relevant: true, howTo: 'Track profile visits' },
        { name: 'Bad reviews on G2 against competitors', tools: 'G2', relevant: true, howTo: 'Target unhappy customers' },
        { name: 'Bad reviews on google my business', tools: 'Google', relevant: false, howTo: 'Local review targeting' },
        { name: 'Glassdoor reviews', tools: 'Glassdoor', relevant: false, howTo: 'Employee satisfaction intel' }
      ]
    },
    {
      category: 'Cold',
      color: 'bg-blue-100',
      items: [
        { name: 'ICP Fit', tools: 'CRM', relevant: true, howTo: 'Target ICP matches' }
      ]
    }
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">Pre-Sales Outbound Plays</h1>
          <p className="text-xs text-slate-600">Strategic outbound plays categorized by warmth and signal strength</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Outbound Strategy Playbook</CardTitle>
            <p className="text-xs text-slate-600">
              The list is the strategy. Each play has specific tools, relevance scoring, and how-to guidance.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {plays.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className={`${category.color} px-4 py-2 rounded-lg mb-3`}>
                    <h3 className="font-bold text-slate-800 text-sm">{category.category}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 text-xs">Play Name</th>
                          <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 text-xs">Tools</th>
                          <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 text-xs">Relevant</th>
                          <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 text-xs">How-to</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="hover:bg-slate-25">
                            <td className="border border-slate-200 p-3 text-xs text-slate-700">
                              {item.name}
                            </td>
                            <td className="border border-slate-200 p-3 text-xs text-slate-600">
                              {item.tools}
                            </td>
                            <td className="border border-slate-200 p-3 text-center">
                              <Checkbox checked={item.relevant} disabled />
                            </td>
                            <td className="border border-slate-200 p-3 text-xs text-slate-600">
                              {item.howTo}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutboundPlays;
