import React, { useState, useEffect } from "react";
import FormRow from "@/components/ui/FormRow";
import ChipList from "@/components/ui/ChipList";

interface Competitor {
  domain: string;
  differentiation: string;
}

interface ProductUnderstandingData {
  valueProposition: string[];
  problemsSolved: string[];
  keyFeatures: string[];
  solutionsOutcomes: string[];
  usps: string[];
  urgency: string[];
  competitorAnalysis: Competitor[];
}

interface ProductUnderstandingStepProps {
  data: ProductUnderstandingData;
  onChange: (data: ProductUnderstandingData) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
}

const fieldConfigs = [
  { key: "valueProposition", label: "Value Proposition", placeholder: "Add a value proposition...", description: "What is the core value your product provides?" },
  { key: "problemsSolved", label: "Problems Solved", placeholder: "Add a problem solved...", description: "What problems does your product solve?" },
  { key: "keyFeatures", label: "Key Features", placeholder: "Add a key feature...", description: "List the main features of your product." },
  { key: "solutionsOutcomes", label: "Solutions/Outcomes", placeholder: "Add a solution or outcome...", description: "What outcomes do customers achieve?" },
  { key: "usps", label: "USPs (Unique Selling Propositions)", placeholder: "Add a USP...", description: "What makes your product unique?" },
  { key: "urgency", label: "Urgency", placeholder: "Add an urgency factor...", description: "Why should customers act now?" },
];

const mockAISuggestions = {
  valueProposition: ["Save time for busy professionals", "Automate manual tasks"],
  problemsSolved: ["Manual data entry", "Lack of integration"],
  keyFeatures: ["One-click export", "Real-time sync"],
  solutionsOutcomes: ["Faster onboarding", "Reduced errors"],
  usps: ["Only tool with X integration", "Best-in-class support"],
  urgency: ["Limited-time offer", "Industry compliance deadline"],
};

const ProductUnderstandingStep: React.FC<ProductUnderstandingStepProps> = ({ data, onChange, onNext, onBack, isLast }) => {
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [competitorDiff, setCompetitorDiff] = useState("");
  const [suggestions, setSuggestions] = useState<{ [key: string]: string[] }>({});
  const [accepted, setAccepted] = useState<{ [key: string]: string[] }>({});
  const [error, setError] = useState("");

  useEffect(() => {
    // Remove fetchAllSuggestions and mockAISuggestions
  }, [data]);

  useEffect(() => {
    onChange({ ...data });
    // eslint-disable-next-line
  }, [data]);

  const handleInputChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = (key: string) => {
    const value = (inputs[key] || "").trim();
    if (value && !data[key].includes(value)) {
      onChange({ ...data, [key]: [...data[key], value] });
      setInputs((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleRemove = (key: string, value: string) => {
    onChange({ ...data, [key]: data[key].filter((item: string) => item !== value) });
  };

  // Competitor logic
  const handleAddCompetitor = () => {
    if (competitorDomain && competitorDiff) {
      onChange({ ...data, competitorAnalysis: [...data.competitorAnalysis, { domain: competitorDomain, differentiation: competitorDiff }] });
      setCompetitorDomain("");
      setCompetitorDiff("");
    }
  };
  const handleRemoveCompetitor = (idx: number) => {
    onChange({ ...data, competitorAnalysis: data.competitorAnalysis.filter((_, i) => i !== idx) });
  };

  const handleAcceptSuggestion = (key: string, suggestion: string) => {
    if (!data[key].includes(suggestion)) {
      onChange({ ...data, [key]: [...data[key], suggestion] });
    }
    setAccepted((prev) => ({ ...prev, [key]: [...(prev[key] || []), suggestion] }));
  };

  const handleRefetchSuggestions = (key: string) => {
    // Remove handleRefetchSuggestions
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.valueProposition.length || !data.problemsSolved.length) {
      setError("Please add at least one Value Proposition and one Problem Solved.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      {fieldConfigs.map(({ key, label, placeholder, description }) => (
        <FormRow key={key} label={label} description={description}>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputs[key] || ""}
              onChange={e => handleInputChange(key, e.target.value)}
              placeholder={placeholder}
              className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={() => handleAdd(key)} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Add</button>
          </div>
          <ChipList items={data[key]} onRemove={item => handleRemove(key, item)} />
          {/* AI Suggestions */}
          {/* Remove AI Suggestions UI */}
        </FormRow>
      ))}
      <FormRow label="Competitor Analysis" description="Add competitors with their domain and your differentiation.">
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            value={competitorDomain}
            onChange={e => setCompetitorDomain(e.target.value)}
            placeholder="Competitor Domain"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={competitorDiff}
            onChange={e => setCompetitorDiff(e.target.value)}
            placeholder="Your Differentiation"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={handleAddCompetitor} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Add</button>
        </div>
        <ChipList
          items={data.competitorAnalysis.map(c => `${c.domain}: ${c.differentiation}`)}
          onRemove={(_, idx) => handleRemoveCompetitor(idx)}
        />
      </FormRow>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex justify-between mt-8">
        {onBack && <button type="button" onClick={onBack} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Back</button>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">{isLast ? "Finish" : "Next"}</button>
      </div>
    </form>
  );
};

export default ProductUnderstandingStep; 