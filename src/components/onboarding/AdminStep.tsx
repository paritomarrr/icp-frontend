import React, { useState, useEffect } from "react";
import FormRow from "@/components/ui/FormRow";
import ChipList from "@/components/ui/ChipList";

interface EmailSignature {
  firstName: string;
  lastName: string;
  title: string;
}

interface AdminStepProps {
  data: {
    emailSignatures: EmailSignature[];
    platformAccess: boolean;
    domain: string;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
}

const AdminStep: React.FC<AdminStepProps> = ({ data, onChange, onNext, onBack, isLast }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(data.domain || "");
  const [platformAccess, setPlatformAccess] = useState(data.platformAccess || false);
  const [emailSignatures, setEmailSignatures] = useState<EmailSignature[]>(data.emailSignatures || []);
  const [error, setError] = useState("");

  useEffect(() => {
    onChange({ emailSignatures, platformAccess, domain });
    // eslint-disable-next-line
  }, [emailSignatures, platformAccess, domain]);

  const handleAddEmail = () => {
    if (firstName && lastName && title) {
      setEmailSignatures([...emailSignatures, { firstName, lastName, title }]);
      setFirstName("");
      setLastName("");
      setTitle("");
    }
  };

  const handleRemoveEmail = (sig: EmailSignature) => {
    setEmailSignatures(emailSignatures.filter(e => e !== sig));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) {
      setError("Domain is required.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      <FormRow label="Email Signatures" description="Add all email signatures you want to use for admin access.">
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First Name"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last Name"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={handleAddEmail} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Add</button>
        </div>
        <ChipList
          items={emailSignatures.map(sig => `${sig.firstName} ${sig.lastName} (${sig.title})`)}
          onRemove={(_, idx) => handleRemoveEmail(emailSignatures[idx])}
        />
      </FormRow>
      <FormRow label="Platform Access" description="Grant this admin access to the platform.">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={platformAccess}
            onChange={e => setPlatformAccess(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Grant platform access</span>
        </label>
      </FormRow>
      <FormRow label="Domain" description="Enter your company domain (e.g. company.com)">
        <input
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="Enter company domain"
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
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

export default AdminStep; 