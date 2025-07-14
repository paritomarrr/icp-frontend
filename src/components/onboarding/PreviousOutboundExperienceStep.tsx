import React, { useState, useEffect } from "react";
import FormRow from "@/components/ui/FormRow";
import ChipList from "@/components/ui/ChipList";

interface PreviousOutboundExperienceData {
  successfulEmailsOrDMs: string[];
  coldCallScripts: string[];
}

interface PreviousOutboundExperienceStepProps {
  data: PreviousOutboundExperienceData;
  onChange: (data: PreviousOutboundExperienceData) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
}

const fieldConfigs = [
  { key: "successfulEmailsOrDMs", label: "Successful Emails or DMs", placeholder: "Add an email, DM, or URL...", description: "Add examples of successful outbound emails or DMs." },
  { key: "coldCallScripts", label: "Cold Call Scripts", placeholder: "Add a call script or URL...", description: "Add examples of effective cold call scripts." },
];

const PreviousOutboundExperienceStep: React.FC<PreviousOutboundExperienceStepProps> = ({ data, onChange, onNext, onBack, isLast }) => {
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");

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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.successfulEmailsOrDMs.length && !data.coldCallScripts.length) {
      setError("Please add at least one Successful Email/DM or Cold Call Script.");
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

export default PreviousOutboundExperienceStep; 