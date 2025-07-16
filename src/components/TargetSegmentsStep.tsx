import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { enhancedICPApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Enhanced Array field component with AI suggestions
const ArrayFieldWithAI = ({ values, onChange, placeholder, fieldType, domain, cumulativeData }: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  fieldType: string;
  domain: string;
  cumulativeData: any;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const generateSuggestions = async () => {
    if (!domain.trim() || hasFetched || isLoadingSuggestions) return;

    setIsLoadingSuggestions(true);
    setHasFetched(true);
    try {
      const result = await enhancedICPApi.generateProductFieldSuggestions(fieldType, domain, cumulativeData);
      
      if (result.success) {
        let processedSuggestions = result.suggestions;
        
        // If suggestions is a string that looks like a JSON array, parse it
        if (typeof processedSuggestions === 'string') {
          try {
            // First try to parse as JSON
            const parsed = JSON.parse(processedSuggestions);
            processedSuggestions = Array.isArray(parsed) ? parsed : [processedSuggestions];
          } catch (parseError) {
            // If it's not valid JSON, check if it looks like an array string
            if (processedSuggestions.startsWith('[') && processedSuggestions.endsWith(']')) {
              try {
                // Try to fix common JSON issues and parse again
                const fixedJson = processedSuggestions
                  .replace(/'/g, '"') // Replace single quotes with double quotes
                  .replace(/"/g, '"') // Replace smart quotes
                  .replace(/"/g, '"');
                const parsed = JSON.parse(fixedJson);
                processedSuggestions = Array.isArray(parsed) ? parsed : [processedSuggestions];
              } catch (secondParseError) {
                // If still fails, treat as single suggestion
                processedSuggestions = [processedSuggestions];
              }
            } else {
              // If it's not an array-like string, treat as single suggestion
              processedSuggestions = [processedSuggestions];
            }
          }
        }
        
        // Ensure we have an array and filter out empty items
        const finalSuggestions = Array.isArray(processedSuggestions) 
          ? processedSuggestions.filter(s => s && s.trim()) 
          : [processedSuggestions].filter(s => s && s.trim());
          
        setSuggestions(finalSuggestions);
      } else {
        console.warn('Failed to generate suggestions:', result.error);
      }
    } catch (error) {
      console.warn('AI suggestions error:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (domain.trim() && !hasFetched && !isLoadingSuggestions) {
      generateSuggestions();
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!values.includes(suggestion.trim())) {
      onChange([...values, suggestion.trim()]);
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    }
  };

  return (
    <div className="space-y-2">
      {/* AI Suggestions */}
      {isLoadingSuggestions && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Generating AI suggestions...
          </div>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2">AI Suggestions:</div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm text-gray-700 flex-1">{suggestion}</span>
                <Button
                  onClick={() => applySuggestion(suggestion)}
                  size="sm"
                  variant="outline"
                  className="ml-2 text-xs"
                >
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          onFocus={handleInputFocus}
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={addItem} 
          disabled={!inputValue.trim()}
          className="bg-black text-white hover:bg-gray-800"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((item, index) => (
          <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {item}
            <button
              onClick={() => removeItem(index)}
              className="ml-1 text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// Enhanced Input field component with AI suggestions
const InputFieldWithAI = ({ value, onChange, placeholder, fieldType, domain, cumulativeData, label }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fieldType: string;
  domain: string;
  cumulativeData: any;
  label?: string;
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!domain.trim() || hasFetched || isLoadingSuggestions) return;

    setIsLoadingSuggestions(true);
    setHasFetched(true);
    try {
      const result = await enhancedICPApi.generateProductFieldSuggestions(fieldType, domain, cumulativeData);
      
      if (result.success) {
        let processedSuggestions = result.suggestions;
        
        // If suggestions is a string that looks like a JSON array, parse it
        if (typeof processedSuggestions === 'string') {
          try {
            const parsed = JSON.parse(processedSuggestions);
            processedSuggestions = Array.isArray(parsed) ? parsed : [processedSuggestions];
          } catch (parseError) {
            processedSuggestions = [processedSuggestions];
          }
        }
        
        const finalSuggestions = Array.isArray(processedSuggestions) 
          ? processedSuggestions.filter(s => s && s.trim()) 
          : [processedSuggestions].filter(s => s && s.trim());
          
        setSuggestions(finalSuggestions);
      } else {
        console.warn('Failed to generate suggestions:', result.error);
      }
    } catch (error) {
      console.warn('AI suggestions error:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (domain.trim() && !hasFetched && !isLoadingSuggestions) {
      generateSuggestions();
    }
  };

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      {/* AI Suggestions */}
      {isLoadingSuggestions && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Generating AI suggestions...
          </div>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2">AI Suggestions:</div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm text-gray-700 flex-1">{suggestion}</span>
                <Button
                  onClick={() => applySuggestion(suggestion)}
                  size="sm"
                  variant="outline"
                  className="ml-2 text-xs"
                >
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={handleInputFocus}
      />
    </div>
  );
};

// Array field component for managing lists (without AI)
const ArrayField = ({ values, onChange, placeholder }: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={addItem} 
          disabled={!inputValue.trim()}
          className="bg-black text-white hover:bg-gray-800"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((item, index) => (
          <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
            <span>{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => removeItem(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Persona {
  title: string;
  seniority: string;
  decisionInfluence: 'Decision Maker' | 'Champion' | 'End User';
  primaryResponsibilities: string[];
  okrs?: string[]; // Objectives and key results they're responsible for
  challenges: string[];
  painPoints?: string[];
  goals?: string[];
}

interface Segment {
  name: string;
  industry: string;
  companySize: string;
  geography: string;
  awarenessLevel: "Unaware" | "Problem Aware" | "Solution Aware" | "Product Aware" | "Brand Aware" | "";
  // Firmographics
  employees?: string;
  locations?: string[];
  signals?: string[];
  // Benefits and CTAs
  specificBenefits?: string[];
  ctaOptions?: string[];
  // Qualification
  qualification?: {
    tier1Criteria?: string[];
    lookalikeCompaniesUrl?: string;
    disqualifyingCriteria?: string[];
  };
  personas?: Persona[];
}

interface TargetSegmentsStepProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
  domain: string;
  cumulativeData: any;
}

export default function TargetSegmentsStep({ segments, onUpdate, domain, cumulativeData }: TargetSegmentsStepProps) {
  // Initialize with one segment if none exist
  const currentSegments = segments.length > 0 ? segments : [{
    name: "",
    industry: "",
    companySize: "",
    geography: "",
    awarenessLevel: "" as const,
    personas: [{
      title: "",
      seniority: "",
      decisionInfluence: "Decision Maker" as const,
      primaryResponsibilities: [],
      okrs: [],
      challenges: [],
      painPoints: [],
      goals: []
    }]
  }];

  // Update segments whenever currentSegments changes
  if (segments.length === 0 && currentSegments.length > 0) {
    onUpdate(currentSegments);
  }

  const addSegment = () => {
    const newSegment: Segment = {
      name: "",
      industry: "",
      companySize: "",
      geography: "",
      awarenessLevel: "",
      personas: [{
        title: "",
        seniority: "",
        decisionInfluence: "Decision Maker" as const,
        primaryResponsibilities: [],
        okrs: [],
        challenges: [],
        painPoints: [],
        goals: []
      }]
    };
    onUpdate([...currentSegments, newSegment]);
  };

  const removeSegment = (index: number) => {
    const updatedSegments = currentSegments.filter((_, i) => i !== index);
    onUpdate(updatedSegments);
  };

  const updateSegment = (index: number, field: string, value: any) => {
    const updatedSegments = currentSegments.map((segment, i) => 
      i === index ? { ...segment, [field]: value } : segment
    );
    onUpdate(updatedSegments);
  };

  const addPersonaToSegment = (segmentIndex: number) => {
    const updatedSegments = [...currentSegments];
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      personas: [
        ...(updatedSegments[segmentIndex].personas || []),
        {
          title: "",
          seniority: "",
          decisionInfluence: "Decision Maker" as const,
          primaryResponsibilities: [],
          okrs: [],
          challenges: [],
          painPoints: [],
          goals: []
        }
      ]
    };
    onUpdate(updatedSegments);
  };

  const removePersonaFromSegment = (segmentIndex: number, personaIndex: number) => {
    const updatedSegments = [...currentSegments];
    const currentPersonas = updatedSegments[segmentIndex].personas || [];
    
    // Don't allow removing the last persona
    if (currentPersonas.length <= 1) {
      return;
    }
    
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      personas: currentPersonas.filter((_, i) => i !== personaIndex)
    };
    onUpdate(updatedSegments);
  };

  const updatePersonaInSegment = (segmentIndex: number, personaIndex: number, field: string, value: any) => {
    const updatedSegments = [...currentSegments];
    if (updatedSegments[segmentIndex].personas) {
      updatedSegments[segmentIndex].personas![personaIndex] = {
        ...updatedSegments[segmentIndex].personas![personaIndex],
        [field]: value
      };
    }
    onUpdate(updatedSegments);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Target Account Segments</h3>
        <p className="text-sm text-gray-600 mb-6">
          Define your target market segments and the key personas within each segment. Start with one segment and add more as needed. Each segment should have at least one persona defined.
        </p>
      </div>

      {currentSegments.map((segment, segmentIndex) => (
        <div key={segmentIndex} className="border p-6 rounded-lg space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Segment {segmentIndex + 1}</h4>
            {currentSegments.length > 1 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => removeSegment(segmentIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Segment Name <span className="text-red-500">*</span></label>
              <InputFieldWithAI
                placeholder="e.g., Enterprise Manufacturing Companies"
                value={segment.name}
                onChange={(value) => updateSegment(segmentIndex, 'name', value)}
                fieldType="segmentName"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry <span className="text-red-500">*</span></label>
              <InputFieldWithAI
                placeholder="e.g., Manufacturing, Healthcare, SaaS"
                value={segment.industry}
                onChange={(value) => updateSegment(segmentIndex, 'industry', value)}
                fieldType="segmentIndustry"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Size <span className="text-red-500">*</span></label>
              <InputFieldWithAI
                placeholder="e.g., 500-2000 employees, $50M-$200M revenue"
                value={segment.companySize}
                onChange={(value) => updateSegment(segmentIndex, 'companySize', value)}
                fieldType="segmentCompanySize"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Geography <span className="text-red-500">*</span></label>
              <InputFieldWithAI
                placeholder="e.g., North America, EMEA, Global"
                value={segment.geography}
                onChange={(value) => updateSegment(segmentIndex, 'geography', value)}
                fieldType="segmentGeography"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
          </div>

          {/* Firmographics Section */}
          <div className="space-y-4 border-t pt-4">
            <h5 className="font-medium text-lg">Firmographics</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employee Count</label>
                <InputFieldWithAI
                  placeholder="e.g., 500-1000, 1000-5000"
                  value={segment.employees || ''}
                  onChange={(value) => updateSegment(segmentIndex, 'employees', value)}
                  fieldType="segmentEmployees"
                  domain={domain}
                  cumulativeData={cumulativeData}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Locations</label>
                <ArrayFieldWithAI
                  values={segment.locations || []}
                  onChange={(values) => updateSegment(segmentIndex, 'locations', values)}
                  placeholder="e.g., New York, London, Singapore"
                  fieldType="segmentLocations"
                  domain={domain}
                  cumulativeData={cumulativeData}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Signals (Qualifying/Outreach-relevant)</label>
              <ArrayFieldWithAI
                values={segment.signals || []}
                onChange={(values) => updateSegment(segmentIndex, 'signals', values)}
                placeholder="e.g., Recent funding, Tech stack changes, Job postings"
                fieldType="segmentSignals"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
          </div>

          {/* Specific Benefits Section */}
          <div className="space-y-4 border-t pt-4">
            <h5 className="font-medium text-lg">Specific Benefits for Segment</h5>
            <div>
              <label className="block text-sm font-medium mb-2">Specific Benefits/USPs</label>
              <ArrayFieldWithAI
                values={segment.specificBenefits || []}
                onChange={(values) => updateSegment(segmentIndex, 'specificBenefits', values)}
                placeholder="e.g., 30% faster deployment, Industry-specific compliance"
                fieldType="segmentBenefits"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Awareness Level <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border rounded-md"
              value={segment.awarenessLevel}
              onChange={(e) => updateSegment(segmentIndex, 'awarenessLevel', e.target.value)}
            >
              <option value="">Select awareness level</option>
              <option value="Unaware">Unaware - Don't know they have a problem</option>
              <option value="Problem Aware">Problem Aware - Know they have a problem</option>
              <option value="Solution Aware">Solution Aware - Know solutions exist</option>
              <option value="Product Aware">Product Aware - Know your product exists</option>
              <option value="Brand Aware">Brand Aware - Familiar with your brand</option>
            </select>
          </div>

          {/* CTA Options Section */}
          <div className="space-y-4 border-t pt-4">
            <h5 className="font-medium text-lg">CTA Options</h5>
            <div>
              <label className="block text-sm font-medium mb-2">Call-to-Action Options (ranked by priority)</label>
              <ArrayFieldWithAI
                values={segment.ctaOptions || []}
                onChange={(values) => updateSegment(segmentIndex, 'ctaOptions', values)}
                placeholder="e.g., Book a demo, Free trial, Consultation call"
                fieldType="segmentCTA"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
          </div>

          {/* Qualification Section */}
          <div className="space-y-4 border-t pt-4">
            <h5 className="font-medium text-lg">Qualification</h5>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tier 1 Criteria</label>
              <ArrayFieldWithAI
                values={segment.qualification?.tier1Criteria || []}
                onChange={(values) => updateSegment(segmentIndex, 'qualification', { 
                  ...segment.qualification, 
                  tier1Criteria: values 
                })}
                placeholder="e.g., Budget above $100K, Decision maker access"
                fieldType="segmentTier1Criteria"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lookalike Companies URL</label>
              <InputFieldWithAI
                placeholder="e.g., URL to list of similar companies"
                value={segment.qualification?.lookalikeCompaniesUrl || ''}
                onChange={(value) => updateSegment(segmentIndex, 'qualification', { 
                  ...segment.qualification, 
                  lookalikeCompaniesUrl: value 
                })}
                fieldType="segmentLookalikeURL"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Disqualifying Criteria</label>
              <ArrayFieldWithAI
                values={segment.qualification?.disqualifyingCriteria || []}
                onChange={(values) => updateSegment(segmentIndex, 'qualification', { 
                  ...segment.qualification, 
                  disqualifyingCriteria: values 
                })}
                placeholder="e.g., Budget below $50K, No decision authority"
                fieldType="segmentDisqualifying"
                domain={domain}
                cumulativeData={cumulativeData}
              />
            </div>
          </div>

          {/* Always show personas section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-medium text-lg">Personas for this segment</h5>
              <Button 
                onClick={() => addPersonaToSegment(segmentIndex)}
                className="bg-black text-white hover:bg-gray-800"
              >
                Add Persona
              </Button>
            </div>
            {(segment.personas || []).map((persona, personaIndex) => (
                <div key={personaIndex} className="border-2 border-dashed border-gray-200 p-4 rounded-lg bg-blue-50/30">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="font-medium text-blue-900">Persona {personaIndex + 1}</h6>
                    {(segment.personas || []).length > 1 && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removePersonaFromSegment(segmentIndex, personaIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Job Title/Role <span className="text-red-500">*</span></label>
                      <InputFieldWithAI
                        placeholder="e.g., VP of Engineering, IT Director"
                        value={persona.title}
                        onChange={(value) => updatePersonaInSegment(segmentIndex, personaIndex, 'title', value)}
                        fieldType="personaTitle"
                        domain={domain}
                        cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize}}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Seniority Level <span className="text-red-500">*</span></label>
                      <InputFieldWithAI
                        placeholder="e.g., Senior, Director, VP, C-level"
                        value={persona.seniority}
                        onChange={(value) => updatePersonaInSegment(segmentIndex, personaIndex, 'seniority', value)}
                        fieldType="personaSeniority"
                        domain={domain}
                        cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Decision Influence <span className="text-red-500">*</span></label>
                      <Select 
                        value={persona.decisionInfluence} 
                        onValueChange={(value) => updatePersonaInSegment(segmentIndex, personaIndex, 'decisionInfluence', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select decision influence level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                          <SelectItem value="Champion">Champion</SelectItem>
                          <SelectItem value="End User">End User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      Primary Responsibilities <span className="text-red-500">*</span>
                    </label>
                    <ArrayFieldWithAI
                      values={persona.primaryResponsibilities}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'primaryResponsibilities', values)}
                      placeholder="e.g., Manage IT infrastructure and security"
                      fieldType="personaResponsibilities"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      OKRs (Objectives & Key Results)
                    </label>
                    <ArrayFieldWithAI
                      values={persona.okrs || []}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'okrs', values)}
                      placeholder="e.g., Increase system uptime to 99.9%"
                      fieldType="personaOKRs"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      Challenges/Pain Points <span className="text-red-500">*</span>
                    </label>
                    <ArrayFieldWithAI
                      values={persona.challenges}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'challenges', values)}
                      placeholder="e.g., Limited budget for new technology adoption"
                      fieldType="personaChallenges"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                    />
                  </div>
                </div>
              ))}
              
              {/* Show message if no personas */}
              {(!segment.personas || segment.personas.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No personas added yet. Click "Add Persona" to get started.</p>
                </div>
              )}
            </div>
        </div>
      ))}

      <Button onClick={addSegment} className="bg-black text-white hover:bg-gray-800">
        Add Another Segment
      </Button>
    </div>
  );
}
