import React, { useState, useEffect } from "react";
import FormRow from "@/components/ui/FormRow";
import ChipList from "@/components/ui/ChipList";

interface CaseStudy {
  url: string;
  segment: string;
}

interface SocialProofData {
  caseStudies: CaseStudy[];
  testimonials: string[];
}

interface SocialProofStepProps {
  data: SocialProofData;
  onChange: (data: SocialProofData) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
}

const mockAISuggestions = {
  caseStudies: [
    "https://example.com/case-study-1 (Fintech)",
    "https://example.com/case-study-2 (Healthcare)"
  ],
  testimonials: [
    "This product changed our workflow!",
    "Best investment we've made.",
    "Testimonial: https://example.com/testimonial-1"
  ],
};

const fieldConfigs = [
  { key: "testimonials", label: "Testimonials", placeholder: "Add a testimonial or URL...", description: "Add notable testimonials for your product or service." },
];

const SocialProofStep: React.FC<SocialProofStepProps> = ({ data, onChange, onNext, onBack, isLast }) => {
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [caseStudyUrl, setCaseStudyUrl] = useState("");
  const [caseStudySegment, setCaseStudySegment] = useState("");
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

  // Case study logic
  const handleAddCaseStudy = () => {
    if (caseStudyUrl && caseStudySegment) {
      onChange({ ...data, caseStudies: [...data.caseStudies, { url: caseStudyUrl, segment: caseStudySegment }] });
      setCaseStudyUrl("");
      setCaseStudySegment("");
    }
  };
  const handleRemoveCaseStudy = (idx: number) => {
    onChange({ ...data, caseStudies: data.caseStudies.filter((_, i) => i !== idx) });
  };

  // Testimonials logic
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

  const handleAcceptSuggestion = (key: string, suggestion: string) => {
    if (key === "caseStudies") {
      // Try to parse suggestion as "url (segment)"
      const match = suggestion.match(/^(.*) \((.*)\)$/);
      if (match) {
        const url = match[1].trim();
        const segment = match[2].trim();
        onChange({ ...data, caseStudies: [...data.caseStudies, { url, segment }] });
      }
    } else {
      if (!data[key].includes(suggestion)) {
        onChange({ ...data, [key]: [...data[key], suggestion] });
      }
    }
    setAccepted((prev) => ({ ...prev, [key]: [...(prev[key] || []), suggestion] }));
  };

  const handleRefetchSuggestions = (key: string) => {
    // Remove fetchAISuggestions and mockAISuggestions
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.caseStudies.length && !data.testimonials.length) {
      setError("Please add at least one Case Study or Testimonial.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      <FormRow label="Case Studies" description="Add case studies with a URL and segment.">
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            value={caseStudyUrl}
            onChange={e => setCaseStudyUrl(e.target.value)}
            placeholder="Case Study URL"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={caseStudySegment}
            onChange={e => setCaseStudySegment(e.target.value)}
            placeholder="Segment"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={handleAddCaseStudy} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Add</button>
        </div>
        <ChipList
          items={data.caseStudies.map(cs => `${cs.segment}: ${cs.url}`)}
          onRemove={(_, idx) => handleRemoveCaseStudy(idx)}
        />
        {/* AI Suggestions */}
        {/* Remove AI Suggestions UI */}
      </FormRow>
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
          <ChipList items={data[key]} onRemove={(item, idx) => handleRemove(key, item)} />
          {/* AI Suggestions */}
          {/* Remove AI Suggestions UI */}
        </FormRow>
      ))}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex justify-between mt-8">
        {onBack && <button type="button" onClick={onBack} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Back</button>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">{isLast ? "Finish" : "Next"}</button>
      </div>
    </form>
  );
};

export default SocialProofStep; 