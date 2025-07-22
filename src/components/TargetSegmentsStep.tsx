import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { enhancedICPApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Enhanced Array field component with AI suggestions, with usedSuggestions filtering
const ArrayFieldWithAI = ({ values, onChange, placeholder, fieldType, domain, cumulativeData, usedSuggestions = [], onSuggestionUsed }: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  fieldType: string;
  domain: string;
  cumulativeData: any;
  usedSuggestions?: string[];
  onSuggestionUsed?: (suggestion: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { toast } = useToast();

  // Ensure values is always an array
  const safeValues = Array.isArray(values) ? values : (values ? [values] : []);

  // Reset AI suggestion state when cumulativeData changes (i.e. persona changes)
  // This ensures suggestions reload for each persona
  useEffect(() => {
    setHasFetched(false);
    setIsLoadingSuggestions(false);
    setSuggestions([]);
  }, [cumulativeData]);

  const addItem = () => {
    if (inputValue.trim() && !safeValues.includes(inputValue.trim())) {
      onChange([...safeValues, inputValue.trim()]);
      if (onSuggestionUsed) onSuggestionUsed(inputValue.trim());
      setInputValue("");
    }
  } 

  const removeItem = (index: number) => {
    onChange(safeValues.filter((_, i) => i !== index));
  } 

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
        
        // Ensure we have an array and filter out empty items and used suggestions
        const finalSuggestions = Array.isArray(processedSuggestions) 
          ? processedSuggestions.filter(s => s && s.trim() && !usedSuggestions.includes(s.trim())) 
          : [processedSuggestions].filter(s => s && s.trim() && !usedSuggestions.includes(s.trim()));
          
        setSuggestions(finalSuggestions);
      } else {
        console.warn('Failed to generate suggestions:', result.error);
      }
    } catch (error) {
      console.warn('AI suggestions error:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  } 

  const handleInputFocus = () => {
    if (domain.trim() && !hasFetched && !isLoadingSuggestions) {
      generateSuggestions();
    }
  } 

  const applySuggestion = (suggestion: string) => {
    if (!safeValues.includes(suggestion.trim())) {
      onChange([...safeValues, suggestion.trim()]);
      if (onSuggestionUsed) onSuggestionUsed(suggestion.trim());
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    }
  } 

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
        {safeValues.map((item, index) => (
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

// Enhanced Input field component with AI suggestions, with usedSuggestions filtering
const InputFieldWithAI = ({ value, onChange, placeholder, fieldType, domain, cumulativeData, label, usedSuggestions = [], onSuggestionUsed }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fieldType: string;
  domain: string;
  cumulativeData: any;
  label?: string;
  usedSuggestions?: string[];
  onSuggestionUsed?: (suggestion: string) => void;
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
        
        // Filter out used suggestions
        const finalSuggestions = Array.isArray(processedSuggestions) 
          ? processedSuggestions.filter(s => s && s.trim() && !usedSuggestions.includes(s.trim())) 
          : [processedSuggestions].filter(s => s && s.trim() && !usedSuggestions.includes(s.trim()));
          
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
    if (onSuggestionUsed) onSuggestionUsed(suggestion);
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
  title: string[];
  seniority: string;
  decisionInfluence: 'Decision Maker' | 'Champion' | 'End User';
  primaryResponsibilities: string[];
  okrs?: string[];
  challenges: string[];
  painPoints?: string[];
  goals?: string[];
  department?: string[];
  valueProp?: string[];
  cta?: string[];
}

interface Segment {
  name: string;
  industry: string;
  companySize: string;
  geography: string;
  awarenessLevel: ("Unaware" | "Problem Aware" | "Solution Aware" | "Product Aware" | "Brand Aware")[];
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
  // Track all used suggestions across segments/personas/fields
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  // Initialize with one segment if none exist
  const personaTemplate = (type: 'Decision Maker' | 'Champion' | 'End User'): Persona => ({
    title: [],
    seniority: '',
    decisionInfluence: type,
    primaryResponsibilities: [],
    okrs: [],
    challenges: [],
    painPoints: [],
    goals: [],
    department: [],
    valueProp: [],
    cta: [],
  });

  let currentSegments = segments;
  // Always show three personas by default for each segment
  if (segments.length === 0) {
    currentSegments = [{
      name: "",
      industry: "",
      companySize: "",
      geography: "",
      awarenessLevel: [],
      personas: [
        personaTemplate('Decision Maker'),
        personaTemplate('Champion'),
        personaTemplate('End User'),
      ]
    }];
    // Only call onUpdate once, on initial mount
    if (typeof window !== 'undefined' && typeof onUpdate === 'function') {
      setTimeout(() => onUpdate(currentSegments), 0);
    }
  }

  const addSegment = () => {
    const newSegment: Segment = {
      name: "",
      industry: "",
      companySize: "",
      geography: "",
      awarenessLevel: [],
      personas: [
        personaTemplate('Decision Maker'),
        personaTemplate('Champion'),
        personaTemplate('End User'),
      ]
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

  const addPersonaToSegment = (segmentIndex: number, type: 'Decision Maker' | 'Champion' | 'End User' = 'Decision Maker') => {
    const updatedSegments = [...currentSegments];
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      personas: [
        ...(updatedSegments[segmentIndex].personas || []),
        personaTemplate(type)
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

  // Helper to add used suggestion
  const handleSuggestionUsed = (suggestion: string) => {
    setUsedSuggestions(prev => prev.includes(suggestion) ? prev : [...prev, suggestion]);
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                  usedSuggestions={usedSuggestions}
                  onSuggestionUsed={handleSuggestionUsed}
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
                  usedSuggestions={usedSuggestions}
                  onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Awareness Level <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border rounded-md"
              value=""
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue && !segment.awarenessLevel.includes(selectedValue as any)) {
                  updateSegment(segmentIndex, 'awarenessLevel', [...segment.awarenessLevel, selectedValue]);
                }
              }}
            >
              <option value="">Select awareness level</option>
              <option value="Unaware">Unaware - Don't know they have a problem</option>
              <option value="Problem Aware">Problem Aware - Know they have a problem</option>
              <option value="Solution Aware">Solution Aware - Know solutions exist</option>
              <option value="Product Aware">Product Aware - Know your product exists</option>
              <option value="Brand Aware">Brand Aware - Familiar with your brand</option>
            </select>
            
            {/* Display selected options */}
            {segment.awarenessLevel.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {segment.awarenessLevel.map((level, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {level}
                    <button
                      onClick={() => {
                        const updatedLevels = segment.awarenessLevel.filter((_, i) => i !== index);
                        updateSegment(segmentIndex, 'awarenessLevel', updatedLevels);
                      }}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
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
                usedSuggestions={usedSuggestions}
                onSuggestionUsed={handleSuggestionUsed}
              />
            </div>
          </div>

          {/* Always show personas section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-medium text-lg">Personas for this segment</h5>
              <div className="flex gap-2 items-center">
                <Select
                  onValueChange={type => addPersonaToSegment(segmentIndex, type as any)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add Another Persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                    <SelectItem value="Champion">Champion</SelectItem>
                    <SelectItem value="End User">End User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(segment.personas || []).map((persona, personaIndex) => {
              // Only allow removal for personas after the first three
              const isDefaultPersona = personaIndex < 3;
              return (
                <div key={personaIndex} className="border-2 border-dashed border-gray-200 p-4 rounded-lg bg-blue-50/30">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="font-medium text-blue-900">{persona.decisionInfluence} (Segment {segmentIndex + 1})</h6>
                    {!isDefaultPersona && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removePersonaFromSegment(segmentIndex, personaIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="mb-2 p-3 bg-white rounded shadow-sm">
                  <div className="font-semibold">Department:</div>
                  <ArrayFieldWithAI
                    values={persona.department || []}
                    onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'department', values)}
                    placeholder="Department"
                    fieldType="personaDepartment"
                    domain={domain}
                    cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize}}
                    usedSuggestions={usedSuggestions}
                    onSuggestionUsed={handleSuggestionUsed}
                  />
                  <div className="font-semibold">Job Titles:</div>
                  <ArrayFieldWithAI
                    values={persona.title || []}
                    onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'title', values)}
                    placeholder="e.g., VP of Engineering, IT Director"
                    fieldType="personaTitle"
                    domain={domain}
                    cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize}}
                    usedSuggestions={usedSuggestions}
                    onSuggestionUsed={handleSuggestionUsed}
                  />
                  <div className="font-semibold mt-2">Value proposition specific to their job function:</div>
                  <ArrayFieldWithAI
                    values={persona.valueProp || []}
                    onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'valueProp', values)}
                    placeholder="Value proposition for this persona"
                    fieldType="personaValueProp"
                    domain={domain}
                    cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize}}
                    usedSuggestions={usedSuggestions}
                    onSuggestionUsed={handleSuggestionUsed}
                  />
                  <div className="font-semibold">Specific CTA:</div>
                  <ArrayFieldWithAI
                    values={persona.cta || []}
                    onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'cta', values)}
                    placeholder="Call to action for this persona"
                    fieldType="personaCTA"
                    domain={domain}
                    cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize}}
                    usedSuggestions={usedSuggestions}
                    onSuggestionUsed={handleSuggestionUsed}
                  />
                    <div className="font-semibold mt-4">Seniority Level <span className="text-red-500">*</span></div>
                    <InputFieldWithAI
                      placeholder="e.g., Senior, Director, VP, C-level"
                      value={persona.seniority}
                      onChange={(value) => updatePersonaInSegment(segmentIndex, personaIndex, 'seniority', value)}
                      fieldType="personaSeniority"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                      usedSuggestions={usedSuggestions}
                      onSuggestionUsed={handleSuggestionUsed}
                    />
                    <div className="font-semibold mt-4">Primary Responsibilities <span className="text-red-500">*</span></div>
                    <ArrayFieldWithAI
                      values={persona.primaryResponsibilities}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'primaryResponsibilities', values)}
                      placeholder="e.g., Manage IT infrastructure and security"
                      fieldType="personaResponsibilities"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                      usedSuggestions={usedSuggestions}
                      onSuggestionUsed={handleSuggestionUsed}
                    />
                    <div className="font-semibold mt-4">OKRs (Objectives & Key Results)</div>
                    <ArrayFieldWithAI
                      values={persona.okrs || []}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'okrs', values)}
                      placeholder="e.g., Increase system uptime to 99.9%"
                      fieldType="personaOKRs"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                      usedSuggestions={usedSuggestions}
                      onSuggestionUsed={handleSuggestionUsed}
                    />
                    <div className="font-semibold mt-4">Challenges/Pain Points <span className="text-red-500">*</span></div>
                    <ArrayFieldWithAI
                      values={persona.challenges}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'challenges', values)}
                      placeholder="e.g., Limited budget for new technology adoption"
                      fieldType="personaChallenges"
                      domain={domain}
                      cumulativeData={{...cumulativeData, segmentIndustry: segment.industry, segmentCompanySize: segment.companySize, personaTitle: persona.title}}
                      usedSuggestions={usedSuggestions}
                      onSuggestionUsed={handleSuggestionUsed}
                    />
                  </div>
                </div>
              );
            })}
            {/* Show message if no personas */}
            {(!segment.personas || segment.personas.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No personas added yet. Use the dropdown above to get started.</p>
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
