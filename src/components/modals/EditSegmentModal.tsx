import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface EditSegmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (segmentData: any) => void;
  segmentData: any;
}

export const EditSegmentModal = ({ open, onOpenChange, onSave, segmentData }: EditSegmentModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    companySize: '',
    revenue: '',
    geography: '',
    marketSize: '',
    growthRate: '',
    customerCount: '',
    competitiveIntensity: '',
    industries: [''],
    companySizes: [''],
    technologies: [''],
    qualificationCriteria: [''],
    painPoints: [''],
    buyingProcesses: ['']
  });

  // Update form data when segmentData changes
  useEffect(() => {
    if (segmentData) {
      setFormData({
        name: segmentData.name || '',
        description: segmentData.description || '',
        industry: segmentData.industry || '',
        companySize: segmentData.companySize || '',
        revenue: segmentData.revenue || '',
        geography: segmentData.geography || '',
        marketSize: segmentData.marketSize || '',
        growthRate: segmentData.growthRate || '',
        customerCount: segmentData.customerCount || '',
        competitiveIntensity: segmentData.competitiveIntensity || '',
        industries: segmentData.industries && segmentData.industries.length > 0 ? segmentData.industries : [''],
        companySizes: segmentData.companySizes && segmentData.companySizes.length > 0 ? segmentData.companySizes : [''],
        technologies: segmentData.technologies && segmentData.technologies.length > 0 ? segmentData.technologies : [''],
        qualificationCriteria: segmentData.qualificationCriteria && segmentData.qualificationCriteria.length > 0 ? segmentData.qualificationCriteria : [''],
        painPoints: segmentData.painPoints && segmentData.painPoints.length > 0 ? segmentData.painPoints : [''],
        buyingProcesses: segmentData.buyingProcesses && segmentData.buyingProcesses.length > 0 ? segmentData.buyingProcesses : ['']
      });
    }
  }, [segmentData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const arrayFields = ['industries', 'companySizes', 'technologies', 'qualificationCriteria', 'painPoints', 'buyingProcesses'];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
          i === index ? value : item
        )
      }));
    }
  };

  const addArrayItem = (field: string) => {
    const arrayFields = ['industries', 'companySizes', 'technologies', 'qualificationCriteria', 'painPoints', 'buyingProcesses'];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arrayFields = ['industries', 'companySizes', 'technologies', 'qualificationCriteria', 'painPoints', 'buyingProcesses'];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter((_: any, i: number) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    const cleanedData = {
      ...formData,
      industries: formData.industries.filter(i => i.trim() !== ''),
      companySizes: formData.companySizes.filter(c => c.trim() !== ''),
      technologies: formData.technologies.filter(t => t.trim() !== ''),
      qualificationCriteria: formData.qualificationCriteria.filter(q => q.trim() !== ''),
      painPoints: formData.painPoints.filter(p => p.trim() !== ''),
      buyingProcesses: formData.buyingProcesses.filter(b => b.trim() !== '')
    };
    
    onSave(cleanedData);
    onOpenChange(false);
  };

  const renderArrayField = (field: string, label: string, placeholder: string) => {
    const arrayValue = formData[field as keyof typeof formData] as string[];
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {arrayValue.map((item: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            {arrayValue.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem(field, index)}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {label.slice(0, -1)}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Market Segment</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Segment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Mid-Market SaaS"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe this market segment..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="industry">Primary Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology"
              />
            </div>

            <div>
              <Label htmlFor="companySize">Company Size Range</Label>
              <Input
                id="companySize"
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                placeholder="e.g., 100-500 employees"
              />
            </div>

            <div>
              <Label htmlFor="revenue">Revenue Range</Label>
              <Input
                id="revenue"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
                placeholder="e.g., $10M-$100M"
              />
            </div>

            <div>
              <Label htmlFor="geography">Geography</Label>
              <Input
                id="geography"
                value={formData.geography}
                onChange={(e) => handleInputChange('geography', e.target.value)}
                placeholder="e.g., North America"
              />
            </div>
          </div>

          {/* Market Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Market Data</h3>

            <div>
              <Label htmlFor="marketSize">Market Size</Label>
              <Input
                id="marketSize"
                value={formData.marketSize}
                onChange={(e) => handleInputChange('marketSize', e.target.value)}
                placeholder="e.g., $2.5B TAM"
              />
            </div>

            <div>
              <Label htmlFor="growthRate">Growth Rate</Label>
              <Input
                id="growthRate"
                value={formData.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
                placeholder="e.g., 15% CAGR"
              />
            </div>

            <div>
              <Label htmlFor="customerCount">Estimated Customer Count</Label>
              <Input
                id="customerCount"
                value={formData.customerCount}
                onChange={(e) => handleInputChange('customerCount', e.target.value)}
                placeholder="e.g., 50,000 companies"
              />
            </div>

            <div>
              <Label htmlFor="competitiveIntensity">Competitive Intensity</Label>
              <Select value={formData.competitiveIntensity} onValueChange={(value) => handleInputChange('competitiveIntensity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intensity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Very High">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderArrayField('industries', 'Industries', 'Add an industry')}

            {renderArrayField('companySizes', 'Company Sizes', 'Add a company size range')}

            {renderArrayField('technologies', 'Technologies Used', 'Add a technology')}
          </div>

          {/* Qualification & Behavior */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Qualification & Behavior</h3>

            {renderArrayField('qualificationCriteria', 'Qualification Criteria', 'Add qualification criteria')}

            {renderArrayField('painPoints', 'Pain Points', 'Add a pain point')}

            {renderArrayField('buyingProcesses', 'Buying Processes', 'Add a buying process')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
