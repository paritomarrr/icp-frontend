import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/lib/auth";
import { storageService } from "@/lib/storage";
import { enhancedICPApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import LoadingPage from "@/components/LoadingPage";
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";
import SocialProofStep from "@/components/SocialProofStep";
import TargetSegmentsStep from "@/components/TargetSegmentsStep";

// Separate component for array fields to avoid hooks issues
const ArrayField = ({ label, placeholder, items, onAdd, onRemove }: {
  label: string;
  placeholder: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{label}</h4>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleAdd} disabled={!inputValue.trim()}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary">
            {item}
            <button
              onClick={() => onRemove(index)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

interface EmailSignature {
  firstName: string;
  lastName: string;
  title: string;
}

interface CompetitorAnalysis {
  domain: string;
  differentiation: string;
}

interface CaseStudy {
  url: string;
  marketSegment: string;
  title: string;
  description: string;
}

interface Testimonial {
  content: string;
  author: string;
  company: string;
  metrics: string;
  title: string;
}

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

interface EnhancedICPData {
  // 1. Admin & Access
  adminAccess: {
    emailSignatures: EmailSignature[];
    platformAccessGranted: boolean;
  };

  // 2. Domain
  domain: string;

  // 3. Product Understanding
  product: {
    valueProposition: string;
    valuePropositionVariations: string[];
    problemsWithRootCauses: string[];
    keyFeatures: string[];
    businessOutcomes: string[];
    uniqueSellingPoints: string[];
    urgencyConsequences: string[];
    competitorAnalysis: CompetitorAnalysis[];
  };

  // 4. Offer & Sales
  offerSales: {
    pricingTiers: string[];
    clientTimeline: string;
    roiRequirements: string;
    salesDeckUrl: string;
  };

  // 5. Social Proof
  socialProof: {
    caseStudies: CaseStudy[];
    testimonials: Testimonial[];
  };

  // 6. Target Account Segments
  numberOfSegments: number;
  targetAccountSegments: Segment[];
  personas: Persona[];

  // 7. Previous Outbound Experience
  outboundExperience: {
    successfulEmails: string[];
    successfulCallScripts: string[];
  };
}

const EnhancedICPWizard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [numberOfSegments, setNumberOfSegments] = useState(1);

  const [icpData, setIcpData] = useState<EnhancedICPData>({
    adminAccess: {
      emailSignatures: [{ firstName: "", lastName: "", title: "" }],
      platformAccessGranted: false,
    },
    domain: "",
    product: {
      valueProposition: "",
      valuePropositionVariations: [],
      problemsWithRootCauses: [],
      keyFeatures: [],
      businessOutcomes: [],
      uniqueSellingPoints: [],
      urgencyConsequences: [],
      competitorAnalysis: [{ domain: "", differentiation: "" }],
    },
    offerSales: {
      pricingTiers: [],
      clientTimeline: "",
      roiRequirements: "",
      salesDeckUrl: "",
    },
    socialProof: {
      caseStudies: [],
      testimonials: [],
    },
    numberOfSegments: 1,
    targetAccountSegments: [],
    personas: [],
    outboundExperience: {
      successfulEmails: [],
      successfulCallScripts: [],
    },
  });

  const steps = [
    { title: "Admin & Access", key: "adminAccess" },
    { title: "Domain", key: "domain" },
    { title: "Product Understanding", key: "product" },
    { title: "Offer & Sales", key: "offerSales" },
    { title: "Social Proof", key: "socialProof" },
    { title: "Target Segments", key: "segments" },
    { title: "Outbound Experience", key: "outboundExperience" },
  ];

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }
        setUser(currentUser);
        
        const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';
        const res = await fetch(`${API_BASE}/workspaces/slug/${slug}`, {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        });
        
        if (!res.ok) throw new Error("Workspace not found");
        const data = await res.json();
        setWorkspace(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        navigate("/login");
      }
    };

    fetchWorkspace();
  }, [slug, navigate]);

  const addEmailSignature = () => {
    setIcpData(prev => ({
      ...prev,
      adminAccess: {
        ...prev.adminAccess,
        emailSignatures: [...prev.adminAccess.emailSignatures, { firstName: "", lastName: "", title: "" }]
      }
    }));
  };

  const removeEmailSignature = (index: number) => {
    setIcpData(prev => ({
      ...prev,
      adminAccess: {
        ...prev.adminAccess,
        emailSignatures: prev.adminAccess.emailSignatures.filter((_, i) => i !== index)
      }
    }));
  };

  const updateEmailSignature = (index: number, field: keyof EmailSignature, value: string) => {
    setIcpData(prev => ({
      ...prev,
      adminAccess: {
        ...prev.adminAccess,
        emailSignatures: prev.adminAccess.emailSignatures.map((sig, i) => 
          i === index ? { ...sig, [field]: value } : sig
        )
      }
    }));
  };

  const addArrayItem = useCallback((path: string, value: string) => {
    if (!value.trim()) return;
    
    setIcpData(prev => {
      const newData = { ...prev };
      const pathParts = path.split('.');
      let current = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      const finalKey = pathParts[pathParts.length - 1];
      if (!current[finalKey]) current[finalKey] = [];
      current[finalKey] = [...current[finalKey], value];
      
      return newData;
    });
  }, []);

  const removeArrayItem = useCallback((path: string, index: number) => {
    setIcpData(prev => {
      const newData = { ...prev };
      const pathParts = path.split('.');
      let current = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      const finalKey = pathParts[pathParts.length - 1];
      current[finalKey] = current[finalKey].filter((_, i) => i !== index);
      
      return newData;
    });
  }, []);

  // Competitor analysis functions
  const addCompetitorAnalysis = useCallback(() => {
    setIcpData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        competitorAnalysis: [...prev.product.competitorAnalysis, { domain: "", differentiation: "" }]
      }
    }));
  }, []);

  const updateCompetitorAnalysis = useCallback((index: number, field: keyof CompetitorAnalysis, value: string) => {
    setIcpData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        competitorAnalysis: prev.product.competitorAnalysis.map((comp, i) => 
          i === index ? { ...comp, [field]: value } : comp
        )
      }
    }));
  }, []);

  const removeCompetitorAnalysis = useCallback((index: number) => {
    setIcpData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        competitorAnalysis: prev.product.competitorAnalysis.filter((_, i) => i !== index)
      }
    }));
  }, []);

  // Validation functions
  const validateStep = (stepIndex: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (stepIndex) {
      case 0: // Admin & Access
        if (icpData.adminAccess.emailSignatures.length === 0) {
          errors.push("At least one email signature is required");
        }
        icpData.adminAccess.emailSignatures.forEach((sig, index) => {
          if (!sig.firstName.trim()) errors.push(`Email signature ${index + 1}: First name is required`);
          if (!sig.lastName.trim()) errors.push(`Email signature ${index + 1}: Last name is required`);
          if (!sig.title.trim()) errors.push(`Email signature ${index + 1}: Title is required`);
        });
        break;
        
      case 1: // Domain
        if (!icpData.domain.trim()) {
          errors.push("Company domain is required");
        }
        break;
        
      case 2: // Product
        if (!icpData.product.valueProposition.trim()) {
          errors.push("Value proposition is required");
        }
        if (icpData.product.valuePropositionVariations.length === 0) {
          errors.push("At least one value proposition variation is required");
        }
        if (icpData.product.problemsWithRootCauses.length === 0) {
          errors.push("At least one problem with root cause is required");
        }
        if (icpData.product.keyFeatures.length === 0) {
          errors.push("At least one key feature is required");
        }
        if (icpData.product.businessOutcomes.length === 0) {
          errors.push("At least one business outcome is required");
        }
        if (icpData.product.uniqueSellingPoints.length === 0) {
          errors.push("At least one unique selling point is required");
        }
        if (icpData.product.urgencyConsequences.length === 0) {
          errors.push("At least one urgency/consequence is required");
        }
        icpData.product.competitorAnalysis.forEach((comp, index) => {
          if (!comp.domain.trim()) errors.push(`Competitor ${index + 1}: Domain is required`);
          if (!comp.differentiation.trim()) errors.push(`Competitor ${index + 1}: Differentiation is required`);
        });
        break;
        
      case 3: // Offer & Sales
        if (icpData.offerSales.pricingTiers.length === 0) {
          errors.push("At least one pricing tier is required");
        }
        if (!icpData.offerSales.clientTimeline.trim()) {
          errors.push("Client timeline is required");
        }
        if (!icpData.offerSales.roiRequirements.trim()) {
          errors.push("ROI requirements are required");
        }
        if (!icpData.offerSales.salesDeckUrl.trim()) {
          errors.push("Sales deck URL is required");
        }
        break;
        
      case 4: // Social Proof
        if (icpData.socialProof.caseStudies.length === 0) {
          errors.push("At least one case study is required");
        }
        if (icpData.socialProof.testimonials.length === 0) {
          errors.push("At least one testimonial is required");
        }
        icpData.socialProof.caseStudies.forEach((study, index) => {
          if (!study.url.trim()) errors.push(`Case study ${index + 1}: URL is required`);
          if (!study.title.trim()) errors.push(`Case study ${index + 1}: Title is required`);
          if (!study.description.trim()) errors.push(`Case study ${index + 1}: Description is required`);
        });
        icpData.socialProof.testimonials.forEach((testimonial, index) => {
          if (!testimonial.content.trim()) errors.push(`Testimonial ${index + 1}: Content is required`);
          if (!testimonial.author.trim()) errors.push(`Testimonial ${index + 1}: Author is required`);
        });
        break;
        
      case 5: // Target Segments
        if (icpData.targetAccountSegments.length === 0) {
          errors.push("At least one target segment is required");
        }
        icpData.targetAccountSegments.forEach((segment, index) => {
          if (!segment.name.trim()) errors.push(`Segment ${index + 1}: Name is required`);
          if (!segment.industry.trim()) errors.push(`Segment ${index + 1}: Industry is required`);
          if (!segment.companySize.trim()) errors.push(`Segment ${index + 1}: Company size is required`);
          if (!segment.geography.trim()) errors.push(`Segment ${index + 1}: Geography is required`);
          if (!segment.awarenessLevel) errors.push(`Segment ${index + 1}: Awareness level is required`);
          
          if (!segment.personas || segment.personas.length === 0) {
            errors.push(`Segment ${index + 1}: At least one persona is required`);
          } else {
            segment.personas.forEach((persona, pIndex) => {
              if (!persona.title.trim()) errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: Title is required`);
              if (!persona.seniority.trim()) errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: Seniority is required`);
              if (!persona.primaryResponsibilities || persona.primaryResponsibilities.filter(r => r.trim()).length === 0) {
                errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: At least one responsibility is required`);
              }
              if (!persona.challenges || persona.challenges.filter(c => c.trim()).length === 0) {
                errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: At least one challenge is required`);
              }
            });
          }
        });
        break;
        
      case 6: // Outbound Experience
        if (icpData.outboundExperience.successfulEmails.length === 0) {
          errors.push("At least one successful email is required");
        }
        if (icpData.outboundExperience.successfulCallScripts.length === 0) {
          errors.push("At least one successful call script is required");
        }
        break;
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleNextStep = () => {
    const validation = validateStep(currentStep);
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    const newStep = Math.min(steps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
  };

  const handlePrevStep = () => {
    const newStep = Math.max(0, currentStep - 1);
    setCurrentStep(newStep);
  };
  const submitICP = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate all steps before submission
      for (let i = 0; i < steps.length; i++) {
        const validation = validateStep(i);
        if (!validation.isValid) {
          toast({
            title: "Validation Error",
            description: `Step ${i + 1} (${steps[i].title}): ${validation.errors.join(", ")}`,
            variant: "destructive",
          });
          setCurrentStep(i); // Jump to the invalid step
          setIsSubmitting(false);
          return;
        }
      }
      
      // Map our data structure to match the API interface
      const apiData = {
        ...icpData,
        segments: icpData.targetAccountSegments, // Map targetAccountSegments to segments for API
      };
      
      const result = await enhancedICPApi.saveEnhancedICP(workspace._id, apiData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save ICP data');
      }

      toast({
        title: "Success!",
        description: "Your enhanced ICP has been saved successfully.",
      });

      navigate(`/workspace/${slug}/products`);
    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to save ICP data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingPage />;
  if (!workspace) return <Navigate to="/login" />;

  const renderAdminAccessStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Signatures</h3>
        <p className="text-sm text-gray-600 mb-4">
          What should be the email signatures for each sender? (Format: First Name, Last Name, Title)
        </p>
        
        {icpData.adminAccess.emailSignatures.map((signature, index) => (
          <div key={index} className="flex gap-4 mb-4 items-end">
            <Input
              placeholder="First Name"
              value={signature.firstName}
              onChange={(e) => updateEmailSignature(index, 'firstName', e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={signature.lastName}
              onChange={(e) => updateEmailSignature(index, 'lastName', e.target.value)}
            />
            <Input
              placeholder="Title"
              value={signature.title}
              onChange={(e) => updateEmailSignature(index, 'title', e.target.value)}
            />
            {icpData.adminAccess.emailSignatures.length > 1 && (
              <Button variant="destructive" size="sm" onClick={() => removeEmailSignature(index)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button variant="outline" onClick={addEmailSignature}>
          <Plus className="h-4 w-4 mr-2" />
          Add Email Signature
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Access</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="platform-access"
            checked={icpData.adminAccess.platformAccessGranted}
            onCheckedChange={(checked) => {
              setIcpData(prev => {
                const newData = {
                  ...prev,
                  adminAccess: { ...prev.adminAccess, platformAccessGranted: checked as boolean }
                };
                return newData;
              });
            }}
          />
          <label htmlFor="platform-access" className="text-sm">
            Have you invited team@workflows.io to your product platform?
          </label>
        </div>
      </div>
    </div>
  );

  const renderDomainStep = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">Company Domain <span className="text-red-500">*</span></h3>
      <p className="text-sm text-gray-600 mb-4">
        Provide the domain used by your company
      </p>
      <Input
        placeholder="example.com"
        value={icpData.domain}          onChange={(e) => {
            setIcpData(prev => {
              const newData = { ...prev, domain: e.target.value };
              return newData;
            });
          }}
        className={!icpData.domain.trim() ? "border-red-500" : ""}
      />
      <div className="mt-2 text-xs text-gray-500">
        Current value: {icpData.domain}
      </div>
    </div>
  );

  const renderProductStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Value Proposition <span className="text-red-500">*</span></h3>
        <p className="text-sm text-gray-600 mb-4">
          Write your value proposition in 50 characters or less. (You may include variations for different offerings.)
        </p>
        <Input
          placeholder="Your main value proposition..."
          value={icpData.product.valueProposition}            onChange={(e) => {
              setIcpData(prev => {
                const newData = {
                  ...prev,
                  product: { ...prev.product, valueProposition: e.target.value }
                };
                return newData;
              });
            }}
          maxLength={50}
          className={!icpData.product.valueProposition.trim() ? "border-red-500" : ""}
        />
        <p className="text-xs text-gray-500 mt-1">
          {icpData.product.valueProposition.length}/50 characters
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Current value: "{icpData.product.valueProposition}"
        </div>
      </div>

      <ArrayField
        label="Value Proposition Variations"
        placeholder="Alternative value propositions..."
        items={icpData.product.valuePropositionVariations}
        onAdd={(value) => addArrayItem("product.valuePropositionVariations", value)}
        onRemove={(index) => removeArrayItem("product.valuePropositionVariations", index)}
      />

      <ArrayField
        label="Problems Solved"
        placeholder="Problem and its root cause..."
        items={icpData.product.problemsWithRootCauses}
        onAdd={(value) => addArrayItem("product.problemsWithRootCauses", value)}
        onRemove={(index) => removeArrayItem("product.problemsWithRootCauses", index)}
      />

      <ArrayField
        label="Key Features"
        placeholder="Most noteworthy feature..."
        items={icpData.product.keyFeatures}
        onAdd={(value) => addArrayItem("product.keyFeatures", value)}
        onRemove={(index) => removeArrayItem("product.keyFeatures", index)}
      />

      <ArrayField
        label="Business Outcomes"
        placeholder="Business outcome with metrics..."
        items={icpData.product.businessOutcomes}
        onAdd={(value) => addArrayItem("product.businessOutcomes", value)}
        onRemove={(index) => removeArrayItem("product.businessOutcomes", index)}
      />

      <ArrayField
        label="Unique Selling Points"
        placeholder="What makes you unique..."
        items={icpData.product.uniqueSellingPoints}
        onAdd={(value) => addArrayItem("product.uniqueSellingPoints", value)}
        onRemove={(index) => removeArrayItem("product.uniqueSellingPoints", index)}
      />

      <ArrayField
        label="Urgency / Why Now"
        placeholder="Consequence of not solving..."
        items={icpData.product.urgencyConsequences}
        onAdd={(value) => addArrayItem("product.urgencyConsequences", value)}
        onRemove={(index) => removeArrayItem("product.urgencyConsequences", index)}
      />

      <div>
        <h4 className="font-medium mb-4">Competitor Analysis</h4>
        <p className="text-sm text-gray-600 mb-4">
          List the domains of your main competitors and briefly explain how you differentiate from them.
        </p>
        
        {icpData.product.competitorAnalysis.map((competitor, index) => (
          <div key={index} className="flex gap-4 mb-4 items-end">
            <Input
              placeholder="competitor.com"
              value={competitor.domain}
              onChange={(e) => updateCompetitorAnalysis(index, 'domain', e.target.value)}
            />
            <Input
              placeholder="How you differentiate..."
              value={competitor.differentiation}
              onChange={(e) => updateCompetitorAnalysis(index, 'differentiation', e.target.value)}
            />
            {icpData.product.competitorAnalysis.length > 1 && (
              <Button variant="destructive" size="sm" onClick={() => removeCompetitorAnalysis(index)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button variant="outline" onClick={addCompetitorAnalysis}>
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>
    </div>
  );

  const renderOfferSalesStep = () => (
    <div className="space-y-6">
      <ArrayField
        label="Pricing Packages"
        placeholder="Describe pricing tier..."
        items={icpData.offerSales.pricingTiers}
        onAdd={(value) => addArrayItem("offerSales.pricingTiers", value)}
        onRemove={(index) => removeArrayItem("offerSales.pricingTiers", index)}
      />

      <div>
        <h4 className="font-medium mb-2">Client Timeline & ROI <span className="text-red-500">*</span></h4>
        <p className="text-sm text-gray-600 mb-4">
          How soon can your clients expect ROI? What is required from their end?
        </p>
        <Textarea
          placeholder="ROI timeline and client requirements..."
          value={icpData.offerSales.clientTimeline}            onChange={(e) => {
              setIcpData(prev => {
                const newData = {
                  ...prev,
                  offerSales: { ...prev.offerSales, clientTimeline: e.target.value }
                };
                return newData;
              });
            }}
          className={!icpData.offerSales.clientTimeline.trim() ? "border-red-500" : ""}
        />
        <div className="mt-2 text-xs text-gray-500">
          Current value: "{icpData.offerSales.clientTimeline}"
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">ROI Requirements <span className="text-red-500">*</span></h4>
        <Textarea
          placeholder="What's required from the client..."
          value={icpData.offerSales.roiRequirements}            onChange={(e) => {
              setIcpData(prev => {
                const newData = {
                  ...prev,
                  offerSales: { ...prev.offerSales, roiRequirements: e.target.value }
                };
                return newData;
              });
            }}
          className={!icpData.offerSales.roiRequirements.trim() ? "border-red-500" : ""}
        />
        <div className="mt-2 text-xs text-gray-500">
          Current value: "{icpData.offerSales.roiRequirements}"
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Sales Deck URL <span className="text-red-500">*</span></h4>
        <p className="text-sm text-gray-600 mb-4">
          Include a link to your sales deck (not a pitch deck).
        </p>
        <Input
          placeholder="https://..."
          value={icpData.offerSales.salesDeckUrl}            onChange={(e) => {
              setIcpData(prev => {
                const newData = {
                  ...prev,
                  offerSales: { ...prev.offerSales, salesDeckUrl: e.target.value }
                };
                return newData;
              });
            }}
          className={!icpData.offerSales.salesDeckUrl.trim() ? "border-red-500" : ""}
        />
        <div className="mt-2 text-xs text-gray-500">
          Current value: "{icpData.offerSales.salesDeckUrl}"
        </div>
      </div>
    </div>
  );

  const renderSocialProofStep = () => (
    <SocialProofStep
      socialProof={icpData.socialProof}
      onUpdate={(socialProof) => {
        setIcpData(prev => {
          const newData = { ...prev, socialProof };
          return newData;
        });
      }}
    />
  );

  const renderSegmentsStep = () => (
    <TargetSegmentsStep
      segments={icpData.targetAccountSegments}
      onUpdate={(segments) => {
        setIcpData(prev => {
          const newData = { ...prev, targetAccountSegments: segments };
          return newData;
        });
      }}
    />
  );

  const renderOutboundStep = () => (
    <div className="space-y-6">
      <ArrayField
        label="Successful Outbound Emails/DMs"
        placeholder="Email or DM that performed well..."
        items={icpData.outboundExperience.successfulEmails}
        onAdd={(value) => addArrayItem("outboundExperience.successfulEmails", value)}
        onRemove={(index) => removeArrayItem("outboundExperience.successfulEmails", index)}
      />

      <ArrayField
        label="Successful Cold Call Scripts"
        placeholder="Call script that worked well..."
        items={icpData.outboundExperience.successfulCallScripts}
        onAdd={(value) => addArrayItem("outboundExperience.successfulCallScripts", value)}
        onRemove={(index) => removeArrayItem("outboundExperience.successfulCallScripts", index)}
      />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderAdminAccessStep();
      case 1: return renderDomainStep();
      case 2: return renderProductStep();
      case 3: return renderOfferSalesStep();
      case 4: return renderSocialProofStep();
      case 5: return renderSegmentsStep();
      case 6: return renderOutboundStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Enhanced ICP Wizard - {steps[currentStep].title}</span>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1 rounded text-sm ${
                      index === currentStep
                        ? "bg-blue-500 text-white"
                        : index < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
            </div>

            {renderCurrentStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={submitICP} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete ICP Wizard"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedICPWizard;
