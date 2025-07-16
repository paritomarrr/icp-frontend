import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';

interface SegmentCardProps {
  segment: any;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment }) => {
  const navigate = useNavigate();
  const { slug } = useParams();

  return (
    <Card 
      className="border cursor-pointer hover:border-slate-300 transition-colors"
      onClick={() => navigate(`/workspace/${slug}/segments/${segment._id?.$oid || segment._id || segment.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-900">{segment.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Core segment info */}
          <div className="text-xs text-slate-600 space-y-1">
            {segment.industry && <div><span className="font-medium">Industry:</span> {segment.industry}</div>}
            {segment.companySize && <div><span className="font-medium">Size:</span> {segment.companySize}</div>}
            {segment.geography && <div><span className="font-medium">Geography:</span> {segment.geography}</div>}
          </div>
          
          {/* Simple metrics */}
          {segment.personas?.length > 0 && (
            <div className="text-xs text-slate-500">
              {segment.personas.length} persona{segment.personas.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SegmentCard;
