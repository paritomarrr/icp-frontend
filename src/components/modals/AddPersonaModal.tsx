import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface AddPersonaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personaData: any) => void;
}

export const AddPersonaModal = ({ open, onOpenChange, onSave }: AddPersonaModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    jobTitles: [''],
    department: '',
    seniority: '',
    industry: '',
    company: '',
    location: '',
    description: '',
    primaryResponsibilities: [''],
    okrs: [''],
    painPoints: [''],
    goals: [''],
    responsibilities: [''],
    challenges: [''],
    decisionInfluence: 'Decision Maker',
    budget: '',
    teamSize: '',
    channels: [''],
    objections: ['']
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const arrayFields = ['jobTitles', 'primaryResponsibilities', 'okrs', 'painPoints', 'goals', 'responsibilities', 'challenges', 'channels', 'objections'];
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
    const arrayFields = ['painPoints', 'goals', 'responsibilities', 'challenges', 'channels', 'objections'];
    if (arrayFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arrayFields = ['painPoints', 'goals', 'responsibilities', 'challenges', 'channels', 'objections'];
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
      jobTitles: formData.jobTitles.filter(j => j.trim() !== ''),
      primaryResponsibilities: formData.primaryResponsibilities.filter(p => p.trim() !== ''),
      okrs: formData.okrs.filter(o => o.trim() !== ''),
      painPoints: formData.painPoints.filter(p => p.trim() !== ''),
      goals: formData.goals.filter(g => g.trim() !== ''),
      responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
      challenges: formData.challenges.filter(c => c.trim() !== ''),
      channels: formData.channels.filter(c => c.trim() !== ''),
      objections: formData.objections.filter(o => o.trim() !== '')
    };
    
    onSave(cleanedData);
    setFormData({
      name: '',
      title: '',
      jobTitles: [''],
      department: '',
      seniority: '',
      industry: '',
      company: '',
      location: '',
      description: '',
      primaryResponsibilities: [''],
      okrs: [''],
      painPoints: [''],
      goals: [''],
      responsibilities: [''],
      challenges: [''],
      decisionInfluence: 'Decision Maker',
      budget: '',
      teamSize: '',
      channels: [''],
      objections: ['']
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
          <DialogTitle>Add New Persona</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Persona Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Marketing Director"
              />
            </div>

            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Senior Marketing Director"
              />
            </div>

            {renderArrayField('jobTitles', 'Alternative Job Titles', 'Add alternative job title')}

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Marketing"
              />
            </div>

            <div>
              <Label htmlFor="seniority">Seniority Level</Label>
              <Select value={formData.seniority} onValueChange={(value) => handleInputChange('seniority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                  <SelectItem value="C-Level">C-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology"
              />
            </div>

            <div>
              <Label htmlFor="company">Company Size</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., 100-500 employees"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., North America"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this persona..."
                rows={3}
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Details</h3>

            <div>
              <Label htmlFor="decisionInfluence">Decision Influence</Label>
              <Select value={formData.decisionInfluence} onValueChange={(value) => handleInputChange('decisionInfluence', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select influence level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                  <SelectItem value="Champion">Champion</SelectItem>
                  <SelectItem value="End User">End User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="e.g., $100K-500K"
              />
            </div>

            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                value={formData.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                placeholder="e.g., 5-20 people"
              />
            </div>

            {renderArrayField('primaryResponsibilities', 'Primary Responsibilities', 'Add a primary responsibility')}

            {renderArrayField('okrs', 'OKRs (Objectives & Key Results)', 'Add an OKR')}

            {renderArrayField('painPoints', 'Pain Points', 'Add a pain point')}

            {renderArrayField('responsibilities', 'Other Responsibilities', 'Add a responsibility')}

            {renderArrayField('goals', 'Goals', 'Add a goal')}

            {renderArrayField('challenges', 'Challenges', 'Add a challenge')}

            {renderArrayField('channels', 'Preferred Channels', 'Add a channel')}

            {renderArrayField('objections', 'Common Objections', 'Add an objection')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Add Persona
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
