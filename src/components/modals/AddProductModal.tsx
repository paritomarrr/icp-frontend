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
    valueProposition: '',
    valuePropositionVariations: [''],
    problems: [''],
    problemsWithRootCauses: [''],
    features: [''],
    keyFeatures: [''],
    benefits: [''],
    businessOutcomes: [''],
    useCases: [''],
    competitors: [''],
    competitorAnalysis: [{ domain: '', differentiation: '' }],
    uniqueSellingPoints: [''],
    usps: [''],
    whyNow: [''],
    urgencyConsequences: [''],
    pricingTiers: [''],
    clientTimeline: '',
    roiRequirements: '',
    salesDeckUrl: '',
    status: 'active',
    priority: 'medium'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const arrayFields = [
      'valuePropositionVariations', 'problems', 'problemsWithRootCauses', 
      'features', 'keyFeatures', 'benefits', 'businessOutcomes', 
      'useCases', 'competitors', 'uniqueSellingPoints', 'usps', 
      'whyNow', 'urgencyConsequences', 'pricingTiers'
    ];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
          i === index ? value : item
        )
      }));
    }
  };

  const handleCompetitorChange = (index: number, field: 'domain' | 'differentiation', value: string) => {
    setFormData(prev => ({
      ...prev,
      competitorAnalysis: prev.competitorAnalysis.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const addArrayItem = (field: string) => {
    const arrayFields = [
      'valuePropositionVariations', 'problems', 'problemsWithRootCauses', 
      'features', 'keyFeatures', 'benefits', 'businessOutcomes', 
      'useCases', 'competitors', 'uniqueSellingPoints', 'usps', 
      'whyNow', 'urgencyConsequences', 'pricingTiers'
    ];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    } else if (field === 'competitorAnalysis') {
      setFormData(prev => ({
        ...prev,
        competitorAnalysis: [...prev.competitorAnalysis, { domain: '', differentiation: '' }]
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arrayFields = [
      'valuePropositionVariations', 'problems', 'problemsWithRootCauses', 
      'features', 'keyFeatures', 'benefits', 'businessOutcomes', 
      'useCases', 'competitors', 'uniqueSellingPoints', 'usps', 
      'whyNow', 'urgencyConsequences', 'pricingTiers'
    ];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter((_: any, i: number) => i !== index)
      }));
    } else if (field === 'competitorAnalysis') {
      setFormData(prev => ({
        ...prev,
        competitorAnalysis: prev.competitorAnalysis.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    const cleanedData = {
      ...formData,
      valuePropositionVariations: formData.valuePropositionVariations.filter(v => v.trim() !== ''),
      problems: formData.problems.filter(p => p.trim() !== ''),
      problemsWithRootCauses: formData.problemsWithRootCauses.filter(p => p.trim() !== ''),
      features: formData.features.filter(f => f.trim() !== ''),
      keyFeatures: formData.keyFeatures.filter(f => f.trim() !== ''),
      benefits: formData.benefits.filter(b => b.trim() !== ''),
      businessOutcomes: formData.businessOutcomes.filter(b => b.trim() !== ''),
      useCases: formData.useCases.filter(u => u.trim() !== ''),
      competitors: formData.competitors.filter(c => c.trim() !== ''),
      competitorAnalysis: formData.competitorAnalysis.filter(c => c.domain.trim() !== '' || c.differentiation.trim() !== ''),
      uniqueSellingPoints: formData.uniqueSellingPoints.filter(u => u.trim() !== ''),
      usps: formData.usps.filter(u => u.trim() !== ''),
      whyNow: formData.whyNow.filter(w => w.trim() !== ''),
      urgencyConsequences: formData.urgencyConsequences.filter(u => u.trim() !== ''),
      pricingTiers: formData.pricingTiers.filter(p => p.trim() !== '')
    };
    
    onSave(cleanedData);
    setFormData({
      name: '',
      valueProposition: '',
      valuePropositionVariations: [''],
      problems: [''],
      problemsWithRootCauses: [''],
      features: [''],
      keyFeatures: [''],
      benefits: [''],
      businessOutcomes: [''],
      useCases: [''],
      competitors: [''],
      competitorAnalysis: [{ domain: '', differentiation: '' }],
      uniqueSellingPoints: [''],
      usps: [''],
      whyNow: [''],
      urgencyConsequences: [''],
      pricingTiers: [''],
      clientTimeline: '',
      roiRequirements: '',
      salesDeckUrl: '',
      status: 'active',
      priority: 'medium'
    });
    onOpenChange(false);
  };

  const addCompetitorAnalysisItem = () => {
    setFormData({
      ...formData,
      competitorAnalysis: [...formData.competitorAnalysis, { domain: '', differentiation: '' }]
    });
  };

  const removeCompetitorAnalysisItem = (index: number) => {
    const newItems = formData.competitorAnalysis.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      competitorAnalysis: newItems.length > 0 ? newItems : [{ domain: '', differentiation: '' }]
    });
  };

  const renderCompetitorAnalysisField = () => (
    <div>
      <Label>Competitor Analysis</Label>
      {formData.competitorAnalysis.map((competitor, index) => (
        <div key={index} className="space-y-2 border p-3 rounded-md">
          <div className="flex gap-2">
            <Input
              placeholder="Competitor domain"
              value={competitor.domain}
              onChange={(e) => {
                const newCompetitors = [...formData.competitorAnalysis];
                newCompetitors[index] = { ...competitor, domain: e.target.value };
                setFormData({ ...formData, competitorAnalysis: newCompetitors });
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeCompetitorAnalysisItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            placeholder="Differentiation strategy"
            value={competitor.differentiation}
            onChange={(e) => {
              const newCompetitors = [...formData.competitorAnalysis];
              newCompetitors[index] = { ...competitor, differentiation: e.target.value };
              setFormData({ ...formData, competitorAnalysis: newCompetitors });
            }}
            rows={2}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCompetitorAnalysisItem}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Competitor Analysis
      </Button>
    </div>
  );

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
              <Label htmlFor="clientTimeline">Client Timeline</Label>
              <Input
                id="clientTimeline"
                value={formData.clientTimeline}
                onChange={(e) => handleInputChange('clientTimeline', e.target.value)}
                placeholder="e.g., Q1 2024, 6 months"
              />
            </div>

            <div>
              <Label htmlFor="roiRequirements">ROI Requirements</Label>
              <Textarea
                id="roiRequirements"
                value={formData.roiRequirements}
                onChange={(e) => handleInputChange('roiRequirements', e.target.value)}
                placeholder="ROI expectations and requirements..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="salesDeckUrl">Sales Deck URL</Label>
              <Input
                id="salesDeckUrl"
                value={formData.salesDeckUrl}
                onChange={(e) => handleInputChange('salesDeckUrl', e.target.value)}
                placeholder="https://..."
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

            {renderArrayField('valuePropositionVariations', 'Value Proposition Variations', 'Add a value proposition variation')}

            {renderArrayField('problems', 'Problems Solved', 'What problem does this solve?')}

            {renderArrayField('problemsWithRootCauses', 'Problems with Root Causes', 'Add problem with root cause')}

            {renderArrayField('features', 'Features', 'Add a feature')}

            {renderArrayField('keyFeatures', 'Key Features', 'Add a key feature')}

            {renderArrayField('benefits', 'Benefits', 'Add a benefit')}

            {renderArrayField('businessOutcomes', 'Business Outcomes', 'Add a business outcome')}

            {renderArrayField('useCases', 'Use Cases', 'Add a use case')}

            {renderArrayField('competitors', 'Competitors', 'Add a competitor')}

            {renderCompetitorAnalysisField()}

            {renderArrayField('uniqueSellingPoints', 'Unique Selling Points', 'Add a unique selling point')}

            {renderArrayField('usps', 'USPs', 'Add a USP')}

            {renderArrayField('whyNow', 'Why Now', 'Add a timing factor')}

            {renderArrayField('urgencyConsequences', 'Urgency Consequences', 'Add urgency consequence')}

            {renderArrayField('pricingTiers', 'Pricing Tiers', 'Add a pricing tier')}
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
