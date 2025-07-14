import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (productData: any) => void;
  productData: any;
}

export const EditProductModal = ({ open, onOpenChange, onSave, productData }: EditProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    targetAudience: '',
    valueProposition: '',
    pricing: '',
    features: [''],
    benefits: [''],
    useCases: [''],
    competitors: [''],
    uniqueSellingPoints: ['']
  });

  // Update form data when productData changes
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || '',
        category: productData.category || '',
        description: productData.description || '',
        targetAudience: productData.targetAudience || '',
        valueProposition: productData.valueProposition || '',
        pricing: productData.pricing || '',
        features: productData.features && productData.features.length > 0 ? productData.features : [''],
        benefits: productData.benefits && productData.benefits.length > 0 ? productData.benefits : [''],
        useCases: productData.useCases && productData.useCases.length > 0 ? productData.useCases : [''],
        competitors: productData.competitors && productData.competitors.length > 0 ? productData.competitors : [''],
        uniqueSellingPoints: productData.uniqueSellingPoints && productData.uniqueSellingPoints.length > 0 ? productData.uniqueSellingPoints : ['']
      });
    }
  }, [productData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const arrayFields = ['features', 'benefits', 'useCases', 'competitors', 'uniqueSellingPoints'];
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
    const arrayFields = ['features', 'benefits', 'useCases', 'competitors', 'uniqueSellingPoints'];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arrayFields = ['features', 'benefits', 'useCases', 'competitors', 'uniqueSellingPoints'];
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
      features: formData.features.filter(f => f.trim() !== ''),
      benefits: formData.benefits.filter(b => b.trim() !== ''),
      useCases: formData.useCases.filter(u => u.trim() !== ''),
      competitors: formData.competitors.filter(c => c.trim() !== ''),
      uniqueSellingPoints: formData.uniqueSellingPoints.filter(u => u.trim() !== '')
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
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
                placeholder="e.g., Enterprise CRM Platform"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Platform">Platform</SelectItem>
                  <SelectItem value="Tool">Tool</SelectItem>
                  <SelectItem value="Solution">Solution</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the product..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="e.g., Mid-market B2B companies"
              />
            </div>

            <div>
              <Label htmlFor="valueProposition">Value Proposition</Label>
              <Textarea
                id="valueProposition"
                value={formData.valueProposition}
                onChange={(e) => handleInputChange('valueProposition', e.target.value)}
                placeholder="What value does this product provide..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pricing">Pricing Model</Label>
              <Input
                id="pricing"
                value={formData.pricing}
                onChange={(e) => handleInputChange('pricing', e.target.value)}
                placeholder="e.g., $99/month per user"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Details</h3>

            {renderArrayField('features', 'Key Features', 'Add a feature')}

            {renderArrayField('benefits', 'Benefits', 'Add a benefit')}

            {renderArrayField('useCases', 'Use Cases', 'Add a use case')}

            {renderArrayField('uniqueSellingPoints', 'Unique Selling Points', 'Add a USP')}

            {renderArrayField('competitors', 'Competitors', 'Add a competitor')}
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
