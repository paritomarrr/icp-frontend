import { useState } from "react";
import AdminStep from "@/components/onboarding/AdminStep";
import ProductUnderstandingStep from "@/components/onboarding/ProductUnderstandingStep";
import OfferSalesStep from "@/components/onboarding/OfferSalesStep";
import SocialProofStep from "@/components/onboarding/SocialProofStep";
import TargetSegmentsStep from "@/components/onboarding/TargetSegmentsStep";
import PreviousOutboundExperienceStep from "@/components/onboarding/PreviousOutboundExperienceStep";
import FormCard from "@/components/ui/FormCard";
import WizardStepper from "@/components/ui/WizardStepper";

const steps = [
  { key: "admin", label: "Admin", component: AdminStep },
  { key: "productUnderstanding", label: "Product Understanding", component: ProductUnderstandingStep },
  { key: "offerSales", label: "Offer & Sales", component: OfferSalesStep },
  { key: "socialProof", label: "Social Proof", component: SocialProofStep },
  { key: "targetSegments", label: "Target Segments", component: TargetSegmentsStep },
  { key: "previousOutboundExperience", label: "Previous Outbound Experience", component: PreviousOutboundExperienceStep },
];

const initialFormState = {
  admin: {
    emailSignatures: [],
    platformAccess: false,
    domain: '',
  },
  productUnderstanding: {
    valueProposition: [],
    problemsSolved: [],
    keyFeatures: [],
    solutionsOutcomes: [],
    usps: [],
    urgency: [],
    competitorAnalysis: [],
  },
  offerSales: {
    pricingPackages: [],
    clientTimelineROI: '',
    salesDeckUrl: '',
  },
  socialProof: {
    caseStudies: [],
    testimonials: [],
  },
  targetSegments: [],
  previousOutboundExperience: {
    successfulEmailsOrDMs: [],
    coldCallScripts: [],
  },
};

export default function ICPWizard() {
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState(initialFormState);

  const StepComponent = steps[stepIdx].component;
  const stepKey = steps[stepIdx].key;

  const handleStepChange = (data: any) => {
    setForm((prev) => ({
      ...prev,
      [stepKey]: data,
    }));
  };

  const handleNext = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  const handleBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const handleSubmit = () => {
    // TODO: Submit the full form data to your backend
    console.log("Submitting full form:", form);
  };

  // Real AI suggestion API integration
  const fetchAISuggestions = async (step: string, field: string, context: any) => {
    try {
      const res = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, field, context }),
      });
      const data = await res.json();
      if (res.ok && data.suggestions) {
        return data.suggestions;
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <FormCard>
        <WizardStepper steps={steps} current={stepIdx} />
        <StepComponent
          data={form[stepKey]}
          onChange={handleStepChange}
          onNext={stepIdx === steps.length - 1 ? handleSubmit : handleNext}
          onBack={stepIdx > 0 ? handleBack : undefined}
          isLast={stepIdx === steps.length - 1}
          fetchAISuggestions={fetchAISuggestions}
        />
      </FormCard>
    </div>
  );
}