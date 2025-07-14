import React, { useState, useEffect } from "react";
import FormRow from "@/components/ui/FormRow";
import ChipList from "@/components/ui/ChipList";

interface Segment {
  name: string;
  firmographics: {
    industry: string;
    employeeCount: string;
    locations: string[];
  };
  signals: string[];
  qualification: {
    tier1Criteria: string[];
    lookalikeCompanyUrls: string[];
    disqualifyingCriteria: string[];
  };
  messaging: {
    specificBenefits: string[];
    awarenessLevel: string;
    ctaOptions: string[];
  };
  personas: any[]; // Placeholder for now
}

interface TargetSegmentsStepProps {
  data: Segment[];
  onChange: (data: Segment[]) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
}

const arrayFields = [
  { key: "locations", label: "Locations", placeholder: "Add a location...", description: "Where are these companies located?", parent: "firmographics" },
  { key: "signals", label: "Signals", placeholder: "Add a signal...", description: "What signals indicate this is a good segment?" },
  { key: "tier1Criteria", label: "Tier 1 Criteria", placeholder: "Add a tier 1 criteria...", description: "What makes a company a top fit?", parent: "qualification" },
  { key: "lookalikeCompanyUrls", label: "Lookalike Company URLs", placeholder: "Add a lookalike company URL...", description: "Companies that are similar to your ideal segment.", parent: "qualification" },
  { key: "disqualifyingCriteria", label: "Disqualifying Criteria", placeholder: "Add a disqualifying criteria...", description: "What would disqualify a company from this segment?", parent: "qualification" },
  { key: "specificBenefits", label: "Specific Benefits", placeholder: "Add a specific benefit...", description: "What benefits do you offer this segment?", parent: "messaging" },
  { key: "ctaOptions", label: "CTA Options", placeholder: "Add a CTA option...", description: "What call-to-action works best for this segment?", parent: "messaging" },
];

const TargetSegmentsStep: React.FC<TargetSegmentsStepProps> = ({ data, onChange, onNext, onBack, isLast }) => {
  const [numSegments, setNumSegments] = useState(data.length || 1);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: segment details, 2: persona counts, 3: persona details
  // For Step 2: persona counts per segment
  const [personaCounts, setPersonaCounts] = useState<number[]>(() => data.map(seg => seg.personas?.length || 1));

  // Initialize segments if not present
  useEffect(() => {
    if (data.length < numSegments) {
      const newSegments = [...data];
      for (let i = data.length; i < numSegments; i++) {
        newSegments.push({
          name: "",
          firmographics: { industry: "", employeeCount: "", locations: [] },
          signals: [],
          qualification: { tier1Criteria: [], lookalikeCompanyUrls: [], disqualifyingCriteria: [] },
          messaging: { specificBenefits: [], awarenessLevel: "", ctaOptions: [] },
          personas: [],
        });
      }
      onChange(newSegments);
    } else if (data.length > numSegments) {
      onChange(data.slice(0, numSegments));
    }
    // eslint-disable-next-line
  }, [numSegments]);

  const handleSegmentChange = (idx: number, updated: Partial<Segment>) => {
    const newSegments = [...data];
    newSegments[idx] = { ...newSegments[idx], ...updated };
    onChange(newSegments);
  };

  const handleNestedChange = (idx: number, parent: keyof Segment, updated: any) => {
    const newSegments = [...data];
    newSegments[idx] = { ...newSegments[idx], [parent]: { ...newSegments[idx][parent], ...updated } };
    onChange(newSegments);
  };

  type ParentKey = 'firmographics' | 'qualification' | 'messaging' | null;

  const handleArrayChange = (idx: number, parent: ParentKey, key: string, arr: string[]) => {
    const newSegments = [...data];
    if (parent === "firmographics" || parent === "qualification" || parent === "messaging") {
      (newSegments[idx][parent as keyof Segment] as any)[key] = arr;
    } else {
      (newSegments[idx] as any)[key] = arr;
    }
    onChange(newSegments);
  };

  const handleAddToArray = (idx: number, parent: ParentKey, key: string, value: string) => {
    if (!value) return;
    const arr = parent
      ? [...((data[idx][parent as keyof Segment] as any)[key]), value]
      : [...((data[idx] as any)[key]), value];
    handleArrayChange(idx, parent, key, arr);
  };

  const handleRemoveFromArray = (idx: number, parent: ParentKey, key: string, i: number) => {
    const arr = parent
      ? (data[idx][parent as keyof Segment] as any)[key].filter((_: any, j: number) => j !== i)
      : (data[idx] as any)[key].filter((_: any, j: number) => j !== i);
    handleArrayChange(idx, parent, key, arr);
  };

  // Step 1: handle Next to move to persona count step
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.length || !data.some(seg => seg.name.trim())) {
      setError("Please add at least one segment with a name.");
      return;
    }
    setError("");
    // Initialize personaCounts if not set
    setPersonaCounts(data.map(seg => seg.personas?.length || 1));
    setStep(2);
  };

  // Step 2: handle Next to initialize personas and move to Step 3
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (personaCounts.some(count => isNaN(count) || count < 1 || count > 10)) {
      setError("Please enter 1-10 personas for each segment.");
      return;
    }
    setError("");
    const defaultSegment: Segment = {
      name: "",
      firmographics: { industry: "", employeeCount: "", locations: [] },
      signals: [],
      qualification: { tier1Criteria: [], lookalikeCompanyUrls: [], disqualifyingCriteria: [] },
      messaging: { specificBenefits: [], awarenessLevel: "", ctaOptions: [] },
      personas: [],
    };
    function safeMergeSegment(seg: any): Segment {
      if (typeof seg === 'object' && seg !== null) {
        return { ...defaultSegment, ...seg };
      }
      return { ...defaultSegment };
    }
    const newSegments = data.map((seg, idx) => {
      const merged = safeMergeSegment(seg);
      const personasArr = Array.isArray(merged.personas) ? merged.personas : [];
      return {
        ...merged,
        personas: Array.from({ length: personaCounts[idx] }, (_, i) => personasArr[i] || {
          mappedSegment: merged.name,
          department: "",
          jobTitles: [],
          valueProposition: "",
          specificCTA: "",
          responsibilities: [],
          okrs: [],
          painPoints: [],
        })
      };
    });
    onChange(newSegments);
    setStep(3);
  };

  // Step 3: Persona details handlers
  const personaFields = [
    { key: "department", label: "Department", type: "text" },
    { key: "jobTitles", label: "Job Titles", type: "array", placeholder: "Add a job title..." },
    { key: "valueProposition", label: "Value Proposition", type: "text" },
    { key: "specificCTA", label: "Specific CTA", type: "text" },
    { key: "responsibilities", label: "Responsibilities", type: "array", placeholder: "Add a responsibility..." },
    { key: "okrs", label: "OKRs", type: "array", placeholder: "Add an OKR..." },
    { key: "painPoints", label: "Pain Points", type: "array", placeholder: "Add a pain point..." },
  ];

  // Local state for persona array field inputs
  const [personaArrayInputs, setPersonaArrayInputs] = useState<{ [segIdx: number]: { [personaIdx: number]: { [key: string]: string } } }>({});
  const handlePersonaArrayInputChange = (segIdx: number, personaIdx: number, key: string, value: string) => {
    setPersonaArrayInputs(prev => ({
      ...prev,
      [segIdx]: {
        ...(prev[segIdx] || {}),
        [personaIdx]: {
          ...((prev[segIdx] || {})[personaIdx] || {}),
          [key]: value
        }
      }
    }));
  };
  const getPersonaArrayInput = (segIdx: number, personaIdx: number, key: string) =>
    personaArrayInputs[segIdx]?.[personaIdx]?.[key] || "";

  const handlePersonaChange = (segIdx: number, personaIdx: number, key: string, value: any) => {
    const newSegments = [...data];
    const personas = [...newSegments[segIdx].personas];
    personas[personaIdx] = { ...personas[personaIdx], [key]: value };
    newSegments[segIdx] = { ...newSegments[segIdx], personas };
    onChange(newSegments);
  };

  const handlePersonaArrayAdd = (segIdx: number, personaIdx: number, key: string, value: string) => {
    if (!value) return;
    const arr = [...(data[segIdx].personas[personaIdx][key] || []), value];
    handlePersonaChange(segIdx, personaIdx, key, arr);
    handlePersonaArrayInputChange(segIdx, personaIdx, key, "");
  };

  const handlePersonaArrayRemove = (segIdx: number, personaIdx: number, key: string, i: number) => {
    const arr = (data[segIdx].personas[personaIdx][key] || []).filter((_: any, j: number) => j !== i);
    handlePersonaChange(segIdx, personaIdx, key, arr);
  };

  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all personas have required fields
    for (let segIdx = 0; segIdx < data.length; segIdx++) {
      for (let personaIdx = 0; personaIdx < data[segIdx].personas.length; personaIdx++) {
        const p = data[segIdx].personas[personaIdx];
        if (!p.department || !p.valueProposition || !p.specificCTA) {
          setError(`Please fill all required fields for every persona (segment ${segIdx + 1}, persona ${personaIdx + 1}).`);
          return;
        }
      }
    }
    setError("");
    onNext();
  };

  const handleNumSegmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 10) setNumSegments(val);
  };

  // Local state for array field inputs per segment/field
  const [arrayInputs, setArrayInputs] = useState<{ [segIdx: number]: { [key: string]: string } }>({});
  const handleArrayInputChange = (segIdx: number, key: string, value: string) => {
    setArrayInputs(prev => ({ ...prev, [segIdx]: { ...prev[segIdx], [key]: value } }));
  };
  const getArrayInput = (segIdx: number, key: string) => arrayInputs[segIdx]?.[key] || "";

  // --- RENDER ---
  if (step === 2) {
    // Step 2: Persona counts per segment
    return (
      <form onSubmit={handleNextStep2} className="space-y-8">
        <h2 className="text-xl font-bold mb-4">How many personas for each segment?</h2>
        {data.map((segment, idx) => (
          <FormRow
            key={idx}
            label={`Personas for "${segment.name || `Segment ${idx + 1}`}"`}
            description="How many personas do you want to define for this segment?"
          >
            <input
              type="number"
              min={1}
              max={10}
              value={personaCounts[idx]}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setPersonaCounts(counts => counts.map((c, i) => i === idx ? (isNaN(val) ? 1 : val) : c));
              }}
              className="border rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-blue-500"
            />
          </FormRow>
        ))}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-between mt-8">
          <button type="button" onClick={() => setStep(1)} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Back</button>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Next</button>
        </div>
      </form>
    );
  }

  if (step === 3) {
    return (
      <form onSubmit={handleNextStep3} className="space-y-8">
        <h2 className="text-xl font-bold mb-4">Define Personas for Each Segment</h2>
        {data.map((segment, segIdx) => (
          <div key={segIdx} className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Segment: {segment.name || `Segment ${segIdx + 1}`}</h3>
            <div className="space-y-6">
              {segment.personas.map((persona: any, personaIdx: number) => (
                <div key={personaIdx} className="border rounded-xl p-4 bg-white shadow-sm">
                  <div className="font-semibold mb-2">Persona {personaIdx + 1}</div>
                  <FormRow label="Department" required>
                    <input
                      type="text"
                      value={persona.department || ""}
                      onChange={e => handlePersonaChange(segIdx, personaIdx, "department", e.target.value)}
                      placeholder="Department"
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </FormRow>
                  <FormRow label="Job Titles" description="Add job titles for this persona.">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={getPersonaArrayInput(segIdx, personaIdx, "jobTitles")}
                        onChange={e => handlePersonaArrayInputChange(segIdx, personaIdx, "jobTitles", e.target.value)}
                        placeholder="Add a job title..."
                        className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePersonaArrayAdd(segIdx, personaIdx, "jobTitles", getPersonaArrayInput(segIdx, personaIdx, "jobTitles"))}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <ChipList
                      items={persona.jobTitles || []}
                      onRemove={(_, i) => handlePersonaArrayRemove(segIdx, personaIdx, "jobTitles", i)}
                    />
                  </FormRow>
                  <FormRow label="Value Proposition" required>
                    <input
                      type="text"
                      value={persona.valueProposition || ""}
                      onChange={e => handlePersonaChange(segIdx, personaIdx, "valueProposition", e.target.value)}
                      placeholder="Value Proposition"
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </FormRow>
                  <FormRow label="Specific CTA" required>
                    <input
                      type="text"
                      value={persona.specificCTA || ""}
                      onChange={e => handlePersonaChange(segIdx, personaIdx, "specificCTA", e.target.value)}
                      placeholder="Specific CTA"
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </FormRow>
                  <FormRow label="Responsibilities" description="Add responsibilities for this persona.">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={getPersonaArrayInput(segIdx, personaIdx, "responsibilities")}
                        onChange={e => handlePersonaArrayInputChange(segIdx, personaIdx, "responsibilities", e.target.value)}
                        placeholder="Add a responsibility..."
                        className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePersonaArrayAdd(segIdx, personaIdx, "responsibilities", getPersonaArrayInput(segIdx, personaIdx, "responsibilities"))}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <ChipList
                      items={persona.responsibilities || []}
                      onRemove={(_, i) => handlePersonaArrayRemove(segIdx, personaIdx, "responsibilities", i)}
                    />
                  </FormRow>
                  <FormRow label="OKRs" description="Add OKRs for this persona.">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={getPersonaArrayInput(segIdx, personaIdx, "okrs")}
                        onChange={e => handlePersonaArrayInputChange(segIdx, personaIdx, "okrs", e.target.value)}
                        placeholder="Add an OKR..."
                        className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePersonaArrayAdd(segIdx, personaIdx, "okrs", getPersonaArrayInput(segIdx, personaIdx, "okrs"))}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <ChipList
                      items={persona.okrs || []}
                      onRemove={(_, i) => handlePersonaArrayRemove(segIdx, personaIdx, "okrs", i)}
                    />
                  </FormRow>
                  <FormRow label="Pain Points" description="Add pain points for this persona.">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={getPersonaArrayInput(segIdx, personaIdx, "painPoints")}
                        onChange={e => handlePersonaArrayInputChange(segIdx, personaIdx, "painPoints", e.target.value)}
                        placeholder="Add a pain point..."
                        className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePersonaArrayAdd(segIdx, personaIdx, "painPoints", getPersonaArrayInput(segIdx, personaIdx, "painPoints"))}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <ChipList
                      items={persona.painPoints || []}
                      onRemove={(_, i) => handlePersonaArrayRemove(segIdx, personaIdx, "painPoints", i)}
                    />
                  </FormRow>
                </div>
              ))}
            </div>
          </div>
        ))}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-between mt-8">
          <button type="button" onClick={() => setStep(2)} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Back</button>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Next</button>
        </div>
      </form>
    );
  }

  // Step 1: Segment details
  return (
    <form onSubmit={handleNextStep1} className="space-y-8">
      <FormRow label="How many segments do you want to define?">
        <input
          type="number"
          min={1}
          max={10}
          value={numSegments}
          onChange={handleNumSegmentsChange}
          className="border rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-blue-500"
        />
      </FormRow>
      {data.slice(0, numSegments).map((segment, idx) => (
        <div key={idx} className="border rounded-xl p-6 mb-8 bg-gray-50 shadow-sm">
          <FormRow label="Segment Name" description="Give this segment a descriptive name.">
            <input
              type="text"
              value={segment.name}
              onChange={e => handleSegmentChange(idx, { name: e.target.value })}
              placeholder="Enter segment name..."
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            />
          </FormRow>
          <FormRow label="Industry" description="Industry for this segment.">
            <input
              type="text"
              value={segment.firmographics.industry}
              onChange={e => handleNestedChange(idx, "firmographics", { industry: e.target.value })}
              placeholder="Industry"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            />
          </FormRow>
          <FormRow label="Employee Count" description="Typical employee count for this segment.">
            <input
              type="text"
              value={segment.firmographics.employeeCount}
              onChange={e => handleNestedChange(idx, "firmographics", { employeeCount: e.target.value })}
              placeholder="Employee Count"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            />
          </FormRow>
          {arrayFields.map(({ key, label, placeholder, description, parent }) => (
            <FormRow key={key} label={label} description={description}>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={getArrayInput(idx, key)}
                  onChange={e => handleArrayInputChange(idx, key, e.target.value)}
                  placeholder={placeholder}
                  className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleAddToArray(idx, (parent || null) as ParentKey, key, getArrayInput(idx, key));
                    handleArrayInputChange(idx, key, "");
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <ChipList
                items={parent ? segment[parent][key] : segment[key]}
                onRemove={(_, i) => handleRemoveFromArray(idx, (parent || null) as ParentKey, key, i)}
              />
            </FormRow>
          ))}
          <FormRow label="Awareness Level" description="Awareness level for this segment.">
            <input
              type="text"
              value={segment.messaging.awarenessLevel}
              onChange={e => handleNestedChange(idx, "messaging", { awarenessLevel: e.target.value })}
              placeholder="Awareness Level"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            />
          </FormRow>
        </div>
      ))}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex justify-between mt-8">
        {onBack && <button type="button" onClick={onBack} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Back</button>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Next</button>
      </div>
    </form>
  );
};

export default TargetSegmentsStep; 