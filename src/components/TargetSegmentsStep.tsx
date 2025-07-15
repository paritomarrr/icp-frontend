import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

// Array field component for managing lists
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
        />
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4" />
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
  primaryResponsibilities: string[];
  challenges: string[];
}

interface Segment {
  name: string;
  industry: string;
  companySize: string;
  geography: string;
  awarenessLevel: "Unaware" | "Problem Aware" | "Solution Aware" | "Product Aware" | "Brand Aware" | "";
  personas?: Persona[];
}

interface TargetSegmentsStepProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
}

export default function TargetSegmentsStep({ segments, onUpdate }: TargetSegmentsStepProps) {
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
      primaryResponsibilities: [],
      challenges: []
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
        primaryResponsibilities: [],
        challenges: []
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
          primaryResponsibilities: [],
          challenges: []
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
              <Input
                placeholder="e.g., Enterprise Manufacturing Companies"
                value={segment.name}
                onChange={(e) => updateSegment(segmentIndex, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g., Manufacturing, Healthcare, SaaS"
                value={segment.industry}
                onChange={(e) => updateSegment(segmentIndex, 'industry', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Size <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g., 500-2000 employees, $50M-$200M revenue"
                value={segment.companySize}
                onChange={(e) => updateSegment(segmentIndex, 'companySize', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Geography <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g., North America, EMEA, Global"
                value={segment.geography}
                onChange={(e) => updateSegment(segmentIndex, 'geography', e.target.value)}
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

          {/* Always show personas section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-medium text-lg">Personas for this segment</h5>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addPersonaToSegment(segmentIndex)}
              >
                <Plus className="h-4 w-4 mr-2" />
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
                      <Input
                        placeholder="e.g., VP of Engineering, IT Director"
                        value={persona.title}
                        onChange={(e) => updatePersonaInSegment(segmentIndex, personaIndex, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Seniority Level <span className="text-red-500">*</span></label>
                      <Input
                        placeholder="e.g., Senior, Director, VP, C-level"
                        value={persona.seniority}
                        onChange={(e) => updatePersonaInSegment(segmentIndex, personaIndex, 'seniority', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      Primary Responsibilities <span className="text-red-500">*</span>
                    </label>
                    <ArrayField
                      values={persona.primaryResponsibilities}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'primaryResponsibilities', values)}
                      placeholder="e.g., Manage IT infrastructure and security"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      Challenges/Pain Points <span className="text-red-500">*</span>
                    </label>
                    <ArrayField
                      values={persona.challenges}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'challenges', values)}
                      placeholder="e.g., Limited budget for new technology adoption"
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

      <Button variant="outline" onClick={addSegment}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Segment
      </Button>
    </div>
  );
}
