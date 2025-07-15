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
  numberOfPersonas?: number;
  personas?: Persona[];
}

interface TargetSegmentsStepProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
}

export default function TargetSegmentsStep({ segments, onUpdate }: TargetSegmentsStepProps) {
  const [numberOfSegments, setNumberOfSegments] = useState(segments.length || 1);

  const initializeSegments = (count: number) => {
    const newSegments = Array.from({ length: count }, (_, index) => {
      if (segments[index]) {
        return segments[index];
      }
      return {
        name: "",
        industry: "",
        companySize: "",
        geography: "",
        awarenessLevel: "" as const,
        numberOfPersonas: 1,
        personas: [{
          title: "",
          seniority: "",
          primaryResponsibilities: [""],
          challenges: [""]
        }]
      };
    });
    onUpdate(newSegments);
  };

  const addSegment = () => {
    const newSegment: Segment = {
      name: "",
      industry: "",
      companySize: "",
      geography: "",
      awarenessLevel: "",
      numberOfPersonas: 1,
      personas: [{
        title: "",
        seniority: "",
        primaryResponsibilities: [""],
        challenges: [""]
      }]
    };
    onUpdate([...segments, newSegment]);
  };

  const removeSegment = (index: number) => {
    onUpdate(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, field: string, value: any) => {
    const updatedSegments = segments.map((segment, i) => 
      i === index ? { ...segment, [field]: value } : segment
    );
    onUpdate(updatedSegments);
  };

  const initializePersonasForSegment = (segmentIndex: number, count: number) => {
    const updatedSegments = [...segments];
    const newPersonas = Array.from({ length: count }, (_, index) => {
      if (updatedSegments[segmentIndex].personas && updatedSegments[segmentIndex].personas![index]) {
        return updatedSegments[segmentIndex].personas![index];
      }
      return {
        title: "",
        seniority: "",
        primaryResponsibilities: [""],
        challenges: [""]
      };
    });
    
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      personas: newPersonas
    };
    
    onUpdate(updatedSegments);
  };

  const addPersonaToSegment = (segmentIndex: number) => {
    const updatedSegments = [...segments];
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      personas: [
        ...(updatedSegments[segmentIndex].personas || []),
        {
          title: "",
          seniority: "",
          primaryResponsibilities: [""],
          challenges: [""]
        }
      ]
    };
    onUpdate(updatedSegments);
  };

  const removePersonaFromSegment = (segmentIndex: number, personaIndex: number) => {
    const updatedSegments = [...segments];
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      personas: updatedSegments[segmentIndex].personas?.filter((_, i) => i !== personaIndex) || []
    };
    onUpdate(updatedSegments);
  };

  const updatePersonaInSegment = (segmentIndex: number, personaIndex: number, field: string, value: any) => {
    const updatedSegments = [...segments];
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
        <label className="block text-sm font-medium mb-2">
          How many distinct target account segments do you have?
        </label>
        <Input
          type="number"
          min="1"
          max="10"
          placeholder="e.g., 3"
          value={numberOfSegments}
          onChange={(e) => {
            const num = parseInt(e.target.value) || 0;
            setNumberOfSegments(num);
            initializeSegments(num);
          }}
        />
      </div>

      {segments.map((segment, segmentIndex) => (
        <div key={segmentIndex} className="border p-6 rounded-lg space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Segment {segmentIndex + 1}</h4>
            {segments.length > 1 && (
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
              <label className="block text-sm font-medium mb-2">Segment Name</label>
              <Input
                placeholder="e.g., Enterprise Manufacturing"
                value={segment.name}
                onChange={(e) => updateSegment(segmentIndex, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <Input
                placeholder="e.g., Manufacturing"
                value={segment.industry}
                onChange={(e) => updateSegment(segmentIndex, 'industry', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Size</label>
              <Input
                placeholder="e.g., 1000-5000 employees"
                value={segment.companySize}
                onChange={(e) => updateSegment(segmentIndex, 'companySize', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Geography</label>
              <Input
                placeholder="e.g., North America"
                value={segment.geography}
                onChange={(e) => updateSegment(segmentIndex, 'geography', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Awareness Level</label>
            <select
              className="w-full p-2 border rounded-md"
              value={segment.awarenessLevel}
              onChange={(e) => updateSegment(segmentIndex, 'awarenessLevel', e.target.value)}
            >
              <option value="">Select awareness level</option>
              <option value="Unaware">Unaware</option>
              <option value="Problem Aware">Problem Aware</option>
              <option value="Solution Aware">Solution Aware</option>
              <option value="Product Aware">Product Aware</option>
              <option value="Brand Aware">Brand Aware</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Number of personas for this segment
            </label>
            <Input
              type="number"
              min="1"
              max="5"
              placeholder="e.g., 2"
              value={segment.numberOfPersonas || 1}
              onChange={(e) => {
                const num = parseInt(e.target.value) || 1;
                updateSegment(segmentIndex, 'numberOfPersonas', num);
                initializePersonasForSegment(segmentIndex, num);
              }}
            />
          </div>

          {segment.personas && segment.personas.length > 0 && (
            <div className="space-y-4">
              <h5 className="font-medium">Personas for this segment</h5>
              {segment.personas.map((persona, personaIndex) => (
                <div key={personaIndex} className="border p-4 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="font-medium">Persona {personaIndex + 1}</h6>
                    {segment.personas!.length > 1 && (
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
                    <Input
                      placeholder="Job title/role"
                      value={persona.title}
                      onChange={(e) => updatePersonaInSegment(segmentIndex, personaIndex, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Seniority level"
                      value={persona.seniority}
                      onChange={(e) => updatePersonaInSegment(segmentIndex, personaIndex, 'seniority', e.target.value)}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      Primary Responsibilities
                    </label>
                    <ArrayField
                      values={persona.primaryResponsibilities}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'primaryResponsibilities', values)}
                      placeholder="e.g., Manage IT infrastructure"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      Challenges/Pain Points
                    </label>
                    <ArrayField
                      values={persona.challenges}
                      onChange={(values) => updatePersonaInSegment(segmentIndex, personaIndex, 'challenges', values)}
                      placeholder="e.g., Limited budget for new technology"
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addPersonaToSegment(segmentIndex)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Persona
              </Button>
            </div>
          )}
        </div>
      ))}

      {numberOfSegments > 0 && segments.length < numberOfSegments && (
        <Button variant="outline" onClick={() => addSegment()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Segment
        </Button>
      )}
    </div>
  );
}
