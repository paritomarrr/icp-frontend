import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Copy, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';

interface SegmentCardProps {
  segment: any;
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-orange-100 text-orange-800';
    case 'low': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    case 'archived': return 'bg-gray-100 text-gray-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

const SegmentCard: React.FC<SegmentCardProps> = ({ segment }) => {
  const navigate = useNavigate();
  const { slug } = useParams();

  return (
    <Card 
      className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/workspace/${slug}/segments/${segment._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <CardTitle className="text-base font-semibold text-slate-800">{segment.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Eye className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Badge className={`${getPriorityColor(segment.priority)} text-xs`}>
            {segment.priority} Priority
          </Badge>
          <Badge className={`${getStatusColor(segment.status)} text-xs`}>
            {segment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-xs text-slate-600 line-clamp-2">
            {segment.description || 'Segment description and overview'}
          </div>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-slate-50 rounded">
              <div className="text-xs text-slate-500 mb-1">Market Size</div>
              <div className="text-xs font-semibold text-slate-800">{segment.marketSize}</div>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded">
              <div className="text-xs text-slate-500 mb-1">Growth Rate</div>
              <div className="text-xs font-semibold text-slate-800">{segment.growthRate}</div>
            </div>
          </div>
          {/* Firmographics */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700">Key Characteristics</div>
            <div className="flex flex-wrap gap-1">
              {(segment.firmographics || []).slice(0, 3).map((firmo: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {firmo.value}
                </Badge>
              ))}
              {(segment.firmographics || []).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(segment.firmographics || []).length - 3} more
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Qualification Criteria: {segment.qualification?.idealCriteria?.length || 0}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SegmentCard; 