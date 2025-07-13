import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface AddSegmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (segmentData: any) => void;
}

export const AddSegmentModal = ({ open, onOpenChange, onSave }: AddSegmentModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    region: '',
    budget: '',
    focus: '',
    industry: '',
    revenue: '',
    employees: '',
    characteristics: [''],
    qualification: {
      idealCriteria: [''],
      lookalikeCompanies: [''],
      disqualifyingCriteria: ['']
    },
    marketSize: '',
    growthRate: '',
    awarenessLevel: 'Solution',
    priority: 'medium',
    status: 'active'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    if (field === 'characteristics') {
      setFormData(prev => ({
        ...prev,
        characteristics: prev.characteristics.map((item, i) => 
          i === index ? value : item
        )
      }));
    }
  };

  const handleQualificationArrayChange = (qualField: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        [qualField]: (prev.qualification[qualField as keyof typeof prev.qualification] as string[]).map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addArrayItem = (field: string) => {
    if (field === 'characteristics') {
      setFormData(prev => ({
        ...prev,
        characteristics: [...prev.characteristics, '']
      }));
    }
  };

  const addQualificationItem = (qualField: string) => {
    setFormData(prev => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        [qualField]: [...(prev.qualification[qualField as keyof typeof prev.qualification] as string[]), '']
      }
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    if (field === 'characteristics') {
      setFormData(prev => ({
        ...prev,
        characteristics: prev.characteristics.filter((_, i) => i !== index)
      }));
    }
  };

  const removeQualificationItem = (qualField: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        [qualField]: (prev.qualification[qualField as keyof typeof prev.qualification] as string[]).filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = () => {
    const cleanedData = {
      ...formData,
      characteristics: formData.characteristics.filter(c => c.trim() !== ''),
      qualification: {
        idealCriteria: formData.qualification.idealCriteria.filter(c => c.trim() !== ''),
        lookalikeCompanies: formData.qualification.lookalikeCompanies.filter(c => c.trim() !== ''),
        disqualifyingCriteria: formData.qualification.disqualifyingCriteria.filter(c => c.trim() !== '')
      }
    };
    
    onSave(cleanedData);
    setFormData({
      name: '',
      description: '',
      size: '',
      region: '',
      budget: '',
      focus: '',
      industry: '',
      revenue: '',
      employees: '',
      characteristics: [''],
      qualification: {
        idealCriteria: [''],
        lookalikeCompanies: [''],
        disqualifyingCriteria: ['']
      },
      marketSize: '',
      growthRate: '',
      awarenessLevel: 'Solution',
      priority: 'medium',
      status: 'active'
    });
    onOpenChange(false);
  };

  const renderArrayField = (field: string, label: string, placeholder: string) => {
    const arrayValue = field === 'characteristics' ? formData.characteristics : [];
    
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

  const renderQualificationField = (qualField: string, label: string, placeholder: string) => {
    const arrayValue = formData.qualification[qualField as keyof typeof formData.qualification] as string[];
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {arrayValue.map((item: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={item}
              onChange={(e) => handleQualificationArrayChange(qualField, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            {arrayValue.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeQualificationItem(qualField, index)}
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
          onClick={() => addQualificationItem(qualField)}
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Segment</DialogTitle>
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
                placeholder="e.g., Enterprise Manufacturing"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe this market segment..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Manufacturing, Technology"
              />
            </div>

            <div>
              <Label htmlFor="size">Company Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="e.g., 100-500 employees"
              />
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="e.g., North America, Global"
              />
            </div>

            <div>
              <Label htmlFor="revenue">Revenue Range</Label>
              <Input
                id="revenue"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
                placeholder="e.g., $10M-100M"
              />
            </div>

            <div>
              <Label htmlFor="employees">Employee Range</Label>
              <Input
                id="employees"
                value={formData.employees}
                onChange={(e) => handleInputChange('employees', e.target.value)}
                placeholder="e.g., 50-500"
              />
            </div>
          </div>

          {/* Firmographics & Market Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Market Data</h3>

            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="e.g., $200K-500K"
              />
            </div>

            <div>
              <Label htmlFor="focus">Strategic Focus</Label>
              <Input
                id="focus"
                value={formData.focus}
                onChange={(e) => handleInputChange('focus', e.target.value)}
                placeholder="e.g., Growth, Efficiency, Innovation"
              />
            </div>

            <div>
              <Label htmlFor="marketSize">Market Size</Label>
              <Input
                id="marketSize"
                value={formData.marketSize}
                onChange={(e) => handleInputChange('marketSize', e.target.value)}
                placeholder="e.g., $500M - $2B"
              />
            </div>

            <div>
              <Label htmlFor="growthRate">Growth Rate</Label>
              <Input
                id="growthRate"
                value={formData.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
                placeholder="e.g., 12% YoY"
              />
            </div>

            <div>
              <Label htmlFor="awarenessLevel">Awareness Level</Label>
              <Select value={formData.awarenessLevel} onValueChange={(value) => handleInputChange('awarenessLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select awareness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Problem">Problem Aware</SelectItem>
                  <SelectItem value="Solution">Solution Aware</SelectItem>
                  <SelectItem value="Product">Product Aware</SelectItem>
                  <SelectItem value="Brand">Brand Aware</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderArrayField('characteristics', 'Characteristics', 'Add a characteristic')}
          </div>

          {/* Qualification Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Qualification</h3>

            {renderQualificationField('idealCriteria', 'Ideal Criteria', 'Add ideal criteria')}

            {renderQualificationField('lookalikeCompanies', 'Lookalike Companies', 'Add company domain')}

            {renderQualificationField('disqualifyingCriteria', 'Disqualifying Criteria', 'Add disqualifier')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Add Segment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
