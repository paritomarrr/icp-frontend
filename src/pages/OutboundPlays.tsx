import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';

const OutboundPlays = () => {
  const { slug } = useParams();  
  const user = authService.getCurrentUser();
  const workspace = slug ? storageService.getWorkspace(slug) : null;
  
  // State to manage checkbox values
  const [playRelevance, setPlayRelevance] = useState<{[key: string]: boolean}>({});
  
  // Storage key for this workspace
  const storageKey = `outbound-plays-${slug}`;
  
  // Load saved checkbox states on component mount
  useEffect(() => {
    if (slug) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          setPlayRelevance(parsedData);
        } catch (error) {
          console.error('Error loading saved checkbox states:', error);
        }
      }
    }
  }, [slug, storageKey]);

  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  // Function to handle checkbox changes
  const handleRelevanceChange = (categoryIndex: number, itemIndex: number, checked: boolean) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newState = {
      ...playRelevance,
      [key]: checked
    };
    
    setPlayRelevance(newState);
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving checkbox states:', error);
    }
  };

  // Function to get checkbox state
  const getRelevanceState = (categoryIndex: number, itemIndex: number, defaultValue: boolean) => {
    const key = `${categoryIndex}-${itemIndex}`;
    return playRelevance[key] !== undefined ? playRelevance[key] : defaultValue;
  };

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
      category: 'Technographic',
      color: 'bg-blue-100',
      items: [
        { name: 'Technographic Signals', tools: 'Tools', relevant: true, howTo: 'Monitor tech stack' },
        { name: 'Integrations overlap', tools: 'APIs', relevant: true, howTo: 'Find integration opportunities' },
        { name: 'Competitor tech stack identified', tools: 'Tools', relevant: true, howTo: 'Target similar stacks' },
        { name: 'Using specific tech', tools: 'Tech intel', relevant: false, howTo: 'Leverage tech usage' }
      ]
    },
    {
      category: 'Cold',
      color: 'bg-red-100',
      items: [
        { name: 'Research-based outreach', tools: 'Research', relevant: true, howTo: 'Deep company research' },
        { name: 'Content engagement', tools: 'Social', relevant: true, howTo: 'Engage with content first' },
        { name: 'Industry events follow-up', tools: 'Events', relevant: false, howTo: 'Reference event attendance' },
        { name: 'Direct cold outreach', tools: 'Email/LinkedIn', relevant: false, howTo: 'Personalized messaging' }
      ]
    }
  ];

  return (
    <div className="p-8 bg-octave-light-1 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-octave-dark-3">Pre-Sales Outbound Plays</h1>
          <p className="text-xs text-octave-dark-1">Strategic outbound plays categorized by warmth and signal strength</p>
        </div>
        
        <Card className="shadow-xl border border-octave-light-2 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-octave-dark-3">Outbound Strategy Playbook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {plays.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className={`${category.color} p-3 rounded-t-lg border border-slate-200`}>
                    <h3 className="font-semibold text-slate-800 text-sm">{category.category}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-octave-light-1">
                          <th className="border border-octave-light-2 p-3 text-left font-semibold text-octave-dark-2 text-xs">Play Name</th>
                          <th className="border border-octave-light-2 p-3 text-left font-semibold text-octave-dark-2 text-xs">Tools</th>
                          <th className="border border-octave-light-2 p-3 text-left font-semibold text-octave-dark-2 text-xs">Relevant</th>
                          <th className="border border-octave-light-2 p-3 text-left font-semibold text-octave-dark-2 text-xs">How-to</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="hover:bg-octave-light-1/50">
                            <td className="border border-octave-light-2 p-3 text-xs text-octave-dark-2">
                              {item.name}
                            </td>
                            <td className="border border-octave-light-2 p-3 text-xs text-octave-dark-1">
                              {item.tools}
                            </td>
                            <td className="border border-octave-light-2 p-3 text-center">
                              <Checkbox 
                                checked={getRelevanceState(categoryIndex, itemIndex, item.relevant)} 
                                onCheckedChange={(checked) => handleRelevanceChange(categoryIndex, itemIndex, checked as boolean)}
                              />
                            </td>
                            <td className="border border-octave-light-2 p-3 text-xs text-octave-dark-1">
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
