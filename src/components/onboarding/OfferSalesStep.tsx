import React, { useState, useEffect } from "react";
import FormRow from "@/components/ui/FormRow";
import ChipList from "@/components/ui/ChipList";

interface OfferSalesData {
  pricingPackages: string[];
  clientTimelineROI: string;
  salesDeckUrl: string;
}

interface OfferSalesStepProps {
  data: OfferSalesData;
  onChange: (data: OfferSalesData) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
}

const OfferSalesStep: React.FC<OfferSalesStepProps> = ({ data, onChange, onNext, onBack, isLast }) => {
  const [pricingInput, setPricingInput] = useState("");
  const [clientTimelineROI, setClientTimelineROI] = useState(data.clientTimelineROI || "");
  const [salesDeckUrl, setSalesDeckUrl] = useState(data.salesDeckUrl || "");
  const [error, setError] = useState("");

  useEffect(() => {
    onChange({
      pricingPackages: data.pricingPackages,
      clientTimelineROI,
      salesDeckUrl,
    });
    // eslint-disable-next-line
  }, [data.pricingPackages, clientTimelineROI, salesDeckUrl]);

  const handleAddPricing = () => {
    const value = pricingInput.trim();
    if (value && !data.pricingPackages.includes(value)) {
      onChange({
        pricingPackages: [...data.pricingPackages, value],
        clientTimelineROI,
        salesDeckUrl,
      });
      setPricingInput("");
    }
  };

  const handleRemovePricing = (item: string) => {
    onChange({
      pricingPackages: data.pricingPackages.filter((p) => p !== item),
      clientTimelineROI,
      salesDeckUrl,
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.pricingPackages.length) {
      setError("Please add at least one Pricing Package.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      <FormRow label="Pricing Packages" description="List your pricing packages or tiers.">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={pricingInput}
            onChange={e => setPricingInput(e.target.value)}
            placeholder="Add a pricing package..."
            className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={handleAddPricing} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Add</button>
        </div>
        <ChipList items={data.pricingPackages} onRemove={handleRemovePricing} />
      </FormRow>
      <FormRow label="Client Timeline / ROI" description="Describe the typical client timeline or ROI.">
        <input
          type="text"
          value={clientTimelineROI}
          onChange={e => setClientTimelineROI(e.target.value)}
          placeholder="Describe client timeline or ROI..."
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
      </FormRow>
      <FormRow label="Sales Deck URL" description="Paste a link to your sales deck (optional)">
        <input
          type="text"
          value={salesDeckUrl}
          onChange={e => setSalesDeckUrl(e.target.value)}
          placeholder="Paste sales deck URL..."
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

export default OfferSalesStep; 