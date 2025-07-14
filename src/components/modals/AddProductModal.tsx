import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (productData: any) => void;
}

export const AddProductModal = ({ open, onOpenChange, onSave }: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    targetAudience: '',
    valueProposition: '',
    problems: [''],
    features: [''],
    benefits: [''],
    useCases: [''],
    usps: [''],
    pricing: '',
    status: 'active',
    priority: 'medium'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const arrayFields = ['problems', 'features', 'benefits', 'useCases', 'usps'];
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
    const arrayFields = ['problems', 'features', 'benefits', 'useCases', 'usps'];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arrayFields = ['problems', 'features', 'benefits', 'useCases', 'usps'];
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
      problems: formData.problems.filter(p => p.trim() !== ''),
      features: formData.features.filter(f => f.trim() !== ''),
      benefits: formData.benefits.filter(b => b.trim() !== ''),
      useCases: formData.useCases.filter(u => u.trim() !== ''),
      usps: formData.usps.filter(u => u.trim() !== '')
    };
    
    onSave(cleanedData);
    setFormData({
      name: '',
      description: '',
      category: '',
      targetAudience: '',
      valueProposition: '',
      problems: [''],
      features: [''],
      benefits: [''],
      useCases: [''],
      usps: [''],
      pricing: '',
      status: 'active',
      priority: 'medium'
    });
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Enterprise Training Platform"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the product..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Software, Service, Platform"
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="e.g., B2B, Enterprise, SMB"
              />
            </div>

            <div>
              <Label htmlFor="valueProposition">Value Proposition</Label>
              <Textarea
                id="valueProposition"
                value={formData.valueProposition}
                onChange={(e) => handleInputChange('valueProposition', e.target.value)}
                placeholder="What value does this product provide?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="pricing">Pricing Model</Label>
              <Input
                id="pricing"
                value={formData.pricing}
                onChange={(e) => handleInputChange('pricing', e.target.value)}
                placeholder="e.g., Subscription, One-time, Usage-based"
              />
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
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Details</h3>

            {renderArrayField('problems', 'Problems Solved', 'What problem does this solve?')}

            {renderArrayField('features', 'Key Features', 'Add a key feature')}

            {renderArrayField('benefits', 'Benefits', 'Add a benefit')}

            {renderArrayField('useCases', 'Use Cases', 'Add a use case')}

            {renderArrayField('usps', 'Unique Selling Points', 'Add a USP')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
