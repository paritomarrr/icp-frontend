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
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
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
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={!inputValue.trim()} className="bg-black text-white hover:bg-gray-800">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            {item}
            <button
              onClick={() => onRemove(index)}
              className="ml-1 text-red-500 hover:text-red-700 text-sm"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Enhanced component with auto AI suggestions
const ArrayFieldWithAI = ({ label, placeholder, items, onAdd, onRemove, fieldType, domain, cumulativeData }: {
  label: string;
  placeholder: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  fieldType: string;
  domain: string;
  cumulativeData: any;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { toast } = useToast();

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

  const generateSuggestions = async () => {
    if (!domain.trim() || hasFetched || isLoadingSuggestions) return;

    setIsLoadingSuggestions(true);
    setHasFetched(true);
    try {
      const result = await enhancedICPApi.generateProductFieldSuggestions(fieldType, domain, cumulativeData);
      
      if (result.success) {
        let processedSuggestions = result.suggestions;
        
        // If suggestions is a string that looks like a JSON array, parse it
        if (typeof processedSuggestions === 'string') {
          try {
            // First try to parse as JSON
            const parsed = JSON.parse(processedSuggestions);
            processedSuggestions = Array.isArray(parsed) ? parsed : [processedSuggestions];
          } catch (parseError) {
            // If it's not valid JSON, check if it looks like an array string
            if (processedSuggestions.startsWith('[') && processedSuggestions.endsWith(']')) {
              try {
                // Try to fix common JSON issues and parse again
                const fixedJson = processedSuggestions
                  .replace(/'/g, '"') // Replace single quotes with double quotes
                  .replace(/"/g, '"') // Replace smart quotes
                  .replace(/"/g, '"');
                const parsed = JSON.parse(fixedJson);
                processedSuggestions = Array.isArray(parsed) ? parsed : [processedSuggestions];
              } catch (secondParseError) {
                // If still fails, treat as single suggestion
                processedSuggestions = [processedSuggestions];
              }
            } else {
              // If it's not an array-like string, treat as single suggestion
              processedSuggestions = [processedSuggestions];
            }
          }
        }
        
        // Ensure we have an array and filter out empty items
        const finalSuggestions = Array.isArray(processedSuggestions) 
          ? processedSuggestions.filter(s => s && s.trim()) 
          : [processedSuggestions].filter(s => s && s.trim());
          
        setSuggestions(finalSuggestions);
      } else {
        console.warn('Failed to generate suggestions:', result.error);
      }
    } catch (error) {
      console.warn('AI suggestions error:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (domain.trim() && !hasFetched && !isLoadingSuggestions) {
      generateSuggestions();
    }
  };

  const applySuggestion = (suggestion: string) => {
    onAdd(suggestion);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{label}</h4>
      
      {/* AI Suggestions */}
      {isLoadingSuggestions && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Generating AI suggestions...
          </div>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2">AI Suggestions:</div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm text-gray-700 flex-1">{suggestion}</span>
                <Button
                  onClick={() => applySuggestion(suggestion)}
                  size="sm"
                  variant="outline"
                  className="ml-2 text-xs"
                >
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={handleInputFocus}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={!inputValue.trim()} className="bg-black text-white hover:bg-gray-800">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            {item}
            <button
              onClick={() => onRemove(index)}
              className="ml-1 text-red-500 hover:text-red-700 text-sm"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Enhanced input field with auto AI suggestions for single values
  const InputFieldWithAI = ({ label, placeholder, value, onChange, fieldType, domain, cumulativeData, maxLength, isTextarea = false }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    fieldType: string;
    domain: string;
    cumulativeData: any;
    maxLength?: number;
    isTextarea?: boolean;
  }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const { toast } = useToast();

    const generateSuggestions = async () => {
      if (!domain.trim() || hasFetched || isLoadingSuggestions) return;

      setIsLoadingSuggestions(true);
      setHasFetched(true);
      try {
        const result = await enhancedICPApi.generateProductFieldSuggestions(fieldType, domain, cumulativeData);
        if (result.success) {
          let suggestion = result.suggestions;
          // If suggestion is a string with surrounding quotes, strip them
          if (typeof suggestion === 'string' && suggestion.length > 1 && ((suggestion.startsWith('"') && suggestion.endsWith('"')) || (suggestion.startsWith("'") && suggestion.endsWith("'")))) {
            suggestion = suggestion.slice(1, -1);
          }
          setSuggestions([suggestion]);
        } else {
          console.warn('Failed to generate suggestions:', result.error);
        }
      } catch (error) {
        console.warn('AI suggestions error:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const handleInputFocus = () => {
      if (domain.trim() && !hasFetched && !isLoadingSuggestions) {
        generateSuggestions();
      }
    };

    const applySuggestion = (suggestion: string) => {
      // Remove surrounding quotes if present
      let clean = suggestion;
      if (typeof clean === 'string' && clean.length > 1 && ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'")))) {
        clean = clean.slice(1, -1);
      }
      onChange(clean);
      setSuggestions([]);
    };

    const InputComponent = isTextarea ? Textarea : Input;

    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{label}</h3>
        {/* AI Suggestions */}
        {isLoadingSuggestions && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-800">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Generating AI suggestions...
            </div>
          </div>
        )}
        {suggestions.length > 0 && suggestions[0] && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-2">AI Suggestion:</div>
            <div className="flex items-center justify-between bg-white p-2 rounded border">
              <span className="text-sm text-gray-700 flex-1">{suggestions[0]}</span>
              <Button
                onClick={() => applySuggestion(suggestions[0])}
                size="sm"
                variant="outline"
                className="ml-2 text-xs"
              >
                Use This
              </Button>
            </div>
          </div>
        )}
        <InputComponent
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          maxLength={maxLength}
          className={isTextarea ? "min-h-[100px]" : ""}
        />
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
  title: string[];
  jobTitles?: string[]; // Multiple job titles for the persona (deprecated, use title)
  seniority: string;
  department?: string;
  decisionInfluence: 'Decision Maker' | 'Champion' | 'End User';
  primaryResponsibilities: string[];
  okrs?: string[]; // Objectives and key results they're responsible for
  challenges: string[];
  painPoints?: string[];
  goals?: string[];
}

interface Segment {
  name: string;
  industry: string;
  companySize: string;
  geography: string;
  awarenessLevel: "Unaware" | "Problem Aware" | "Solution Aware" | "Product Aware" | "Brand Aware" | "";
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
    useCases: string[];
    description: string;
    category: string;
  };

  // 4. Offer & Sales
  offerSales: {
    pricingTiers: string[];
    clientTimeline: string[];
    roiRequirements: string[];
    salesDeckUrl: string[];
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newSignature, setNewSignature] = useState<EmailSignature>({
    firstName: "",
    lastName: "",
    title: ""
  });
  const [newCompetitor, setNewCompetitor] = useState<CompetitorAnalysis>({
    domain: "",
    differentiation: ""
  });
  // Move state to top-level component
  const [newCaseStudy, setNewCaseStudy] = useState({ url: '', marketSegment: '', title: '', description: '' });
  const [newTestimonial, setNewTestimonial] = useState({ content: '', author: '', company: '', metrics: '', title: '' });

  const [icpData, setIcpData] = useState<EnhancedICPData>({
    adminAccess: {
      emailSignatures: [],
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
      competitorAnalysis: [],
      useCases: [],
      description: "",
      category: "",
    },
    offerSales: {
      pricingTiers: [],
      clientTimeline: [],
      roiRequirements: [],
      salesDeckUrl: [],
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

  // Merge Admin & Access and Domain into a single step
  const steps = [
    { title: "Admin", key: "admin" },
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

  const removeEmailSignature = (index: number) => {
    setIcpData(prev => ({
      ...prev,
      adminAccess: {
        ...prev.adminAccess,
        emailSignatures: prev.adminAccess.emailSignatures.filter((_, i) => i !== index)
      }
    }));
  };

  const removeCompetitor = (index: number) => {
    setIcpData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        competitorAnalysis: prev.product.competitorAnalysis.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddSignature = () => {
    if (newSignature.firstName.trim() && newSignature.lastName.trim() && newSignature.title.trim()) {
      setIcpData(prev => ({
        ...prev,
        adminAccess: {
          ...prev.adminAccess,
          emailSignatures: [...prev.adminAccess.emailSignatures, { ...newSignature }]
        }
      }));
      
      // Clear the form fields
      setNewSignature({ firstName: "", lastName: "", title: "" });
    }
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.domain.trim() && newCompetitor.differentiation.trim()) {
      setIcpData(prev => ({
        ...prev,
        product: {
          ...prev.product,
          competitorAnalysis: [...prev.product.competitorAnalysis, { ...newCompetitor }]
        }
      }));
      
      // Clear the form fields
      setNewCompetitor({ domain: "", differentiation: "" });
    }
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

  // Helper function to get cumulative product data for AI suggestions
  const getCumulativeProductData = () => {
    return {
      description: icpData.product.description,
      category: icpData.product.category,
      valueProposition: icpData.product.valueProposition,
      valuePropositionVariations: icpData.product.valuePropositionVariations,
      problemsWithRootCauses: icpData.product.problemsWithRootCauses,
      keyFeatures: icpData.product.keyFeatures,
      businessOutcomes: icpData.product.businessOutcomes,
      useCases: icpData.product.useCases,
      uniqueSellingPoints: icpData.product.uniqueSellingPoints,
      urgencyConsequences: icpData.product.urgencyConsequences
    };
  };

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
      case 0: // Admin (merged)
        if (icpData.adminAccess.emailSignatures.length === 0) {
          errors.push("At least one email signature is required");
        }
        icpData.adminAccess.emailSignatures.forEach((sig, index) => {
          if (!sig.firstName.trim()) errors.push(`Email signature ${index + 1}: First name is required`);
          if (!sig.lastName.trim()) errors.push(`Email signature ${index + 1}: Last name is required`);
          if (!sig.title.trim()) errors.push(`Email signature ${index + 1}: Title is required`);
        });
        if (!icpData.domain.trim()) {
          errors.push("Company domain is required");
        }
        break;
        
      case 2: // Product
        if (!icpData.product.valueProposition.trim()) {
          errors.push("Value proposition is required");
        }
        // No longer require value proposition variations, as the UI does not ask for it
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
        if (icpData.offerSales.clientTimeline.length === 0) {
          errors.push("At least one client timeline is required");
        }
        if (icpData.offerSales.salesDeckUrl.length === 0) {
          errors.push("At least one sales deck URL is required");
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
              // Validate title as array of strings ONLY
              const titleIsValid = Array.isArray(persona.title) && persona.title.some(t => typeof t === 'string' && t.trim());
              if (!titleIsValid) errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: At least one job title is required`);

              if (!persona.seniority || typeof persona.seniority !== 'string' || !persona.seniority.trim()) errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: Seniority is required`);
              if (!persona.decisionInfluence) errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: Decision influence is required`);
              if (!persona.primaryResponsibilities || !Array.isArray(persona.primaryResponsibilities) || persona.primaryResponsibilities.filter(r => typeof r === 'string' && r.trim()).length === 0) {
                errors.push(`Segment ${index + 1}, Persona ${pIndex + 1}: At least one responsibility is required`);
              }
              if (!persona.challenges || !Array.isArray(persona.challenges) || persona.challenges.filter(c => typeof c === 'string' && c.trim()).length === 0) {
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
      setValidationErrors(validation.errors);
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      // Stay on current step to show highlighted required fields
      return;
    }
    
    // Clear validation errors and move to next step
    setValidationErrors([]);
    const newStep = Math.min(steps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
  };

  const handlePrevStep = () => {
    // Clear validation errors when going back
    setValidationErrors([]);
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
        // Remove targetAccountSegments to avoid confusion
        targetAccountSegments: undefined,
      };
      
      console.log("=== FRONTEND ENHANCED ICP DEBUG ===");
      console.log("Sending data keys:", Object.keys(apiData));
      console.log("Domain:", apiData.domain);
      console.log("Product valueProposition:", apiData.product?.valueProposition);
      console.log("Segments count:", apiData.segments?.length);
      console.log("AdminAccess data:", apiData.adminAccess);
      console.log("================================");
      
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
      console.error("Submit ICP error:", error);
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

  // Merged Admin + Domain step
  const renderAdminDomainStep = () => {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Admin</h2>
          <div className="mb-6">
            <div className="mb-4">
              <span className="font-semibold">Service</span>
              <div className="mt-2">
                <Badge variant="secondary">Outbound</Badge>
              </div>
            </div>
            <div className="mb-6">
              <span className="font-semibold">Domain</span>
              <Input
                placeholder="example.com"
                value={icpData.domain}
                onChange={(e) => {
                  setIcpData(prev => ({ ...prev, domain: e.target.value }));
                }}
                className={!icpData.domain.trim() && validationErrors.some(error => error.includes("Company domain")) ? "border-red-500" : ""}
              />
            </div>
            <div className="mb-6">
              <span className="font-semibold">What should be the email signatures for each sender? <span className="text-red-500">*</span></span>
              <div className="text-gray-500 text-sm mb-2">First Name, Last Name, Title</div>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="First Name"
                    value={newSignature.firstName}
                    onChange={(e) => setNewSignature(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                  <Input
                    placeholder="Last Name"
                    value={newSignature.lastName}
                    onChange={(e) => setNewSignature(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Title"
                      value={newSignature.title}
                      onChange={(e) => setNewSignature(prev => ({ ...prev, title: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddSignature}
                      disabled={!newSignature.firstName.trim() || !newSignature.lastName.trim() || !newSignature.title.trim()}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              {/* Display added signatures */}
              {icpData.adminAccess.emailSignatures.length > 0 ? (
                <div>
                  <h5 className="font-medium mb-3">Added Email Signatures:</h5>
                  {icpData.adminAccess.emailSignatures.map((signature, index) => (
                    <div key={index} className="border p-3 rounded-lg mb-2 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          <strong>{signature.firstName} {signature.lastName}</strong> - {signature.title}
                        </span>
                        <Button variant="destructive" size="sm" onClick={() => removeEmailSignature(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No email signatures added yet. Fill in the form above and click "Add" to get started.</p>
                </div>
              )}
            </div>
            <div className="mb-6">
              <span className="font-semibold">Invite team@workflows.io to your product platform</span>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="platform-access"
                  checked={icpData.adminAccess.platformAccessGranted}
                  onCheckedChange={(checked) => {
                    setIcpData(prev => ({
                      ...prev,
                      adminAccess: { ...prev.adminAccess, platformAccessGranted: checked as boolean }
                    }));
                  }}
                />
                <label htmlFor="platform-access" className="text-sm">
                  Check the box if you've invited us.
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductStep = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-6">Product</h2>
        {/* Value Proposition */}
        <div className="mb-6">
          <label className="font-semibold">Value Proposition <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Write your value proposition in 50 characters or less. You can give us several variations, especially if you have different offerings.</div>
          <InputFieldWithAI
            label=""
            placeholder="Enter value proposition..."
            value={icpData.product.valueProposition}
            onChange={(value) => {
              setIcpData(prev => ({ ...prev, product: { ...prev.product, valueProposition: value } }));
            }}
            fieldType="valueProposition"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
            maxLength={50}
          />
        </div>
        {/* Problems */}
        <div className="mb-6">
          <label className="font-semibold">Problems <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Explain the problems you solve in bullet points. Mention the problems and the root causes of them.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a problem and its root cause..."
            items={icpData.product.problemsWithRootCauses}
            onAdd={(value) => addArrayItem("product.problemsWithRootCauses", value)}
            onRemove={(index) => removeArrayItem("product.problemsWithRootCauses", index)}
            fieldType="problemsWithRootCauses"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* Features */}
        <div className="mb-6">
          <label className="font-semibold">Features <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Describe the most noteworthy features of your solution.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a feature..."
            items={icpData.product.keyFeatures}
            onAdd={(value) => addArrayItem("product.keyFeatures", value)}
            onRemove={(index) => removeArrayItem("product.keyFeatures", index)}
            fieldType="keyFeatures"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* Solutions */}
        <div className="mb-6">
          <label className="font-semibold">Solutions <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Describe business outcomes (not features), and include metrics where possible.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a business outcome..."
            items={icpData.product.businessOutcomes}
            onAdd={(value) => addArrayItem("product.businessOutcomes", value)}
            onRemove={(index) => removeArrayItem("product.businessOutcomes", index)}
            fieldType="businessOutcomes"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* USPs */}
        <div className="mb-6">
          <label className="font-semibold">USPs <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Why should companies choose you over other options.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a USP..."
            items={icpData.product.uniqueSellingPoints}
            onAdd={(value) => addArrayItem("product.uniqueSellingPoints", value)}
            onRemove={(index) => removeArrayItem("product.uniqueSellingPoints", index)}
            fieldType="uniqueSellingPoints"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* Why now */}
        <div className="mb-6">
          <label className="font-semibold">Why now <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">What are the consequences for your prospects by not solving the problems.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a consequence..."
            items={icpData.product.urgencyConsequences}
            onAdd={(value) => addArrayItem("product.urgencyConsequences", value)}
            onRemove={(index) => removeArrayItem("product.urgencyConsequences", index)}
            fieldType="urgencyConsequences"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* Competitors */}
        <div className="mb-6">
          <label className="font-semibold">Competitors <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">List the domains of your main competitors and briefly explain your main differentiators.</div>
          {/* New competitor form */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="competitor.com"
                value={newCompetitor.domain}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, domain: e.target.value }))}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="How you differentiate..."
                  value={newCompetitor.differentiation}
                  onChange={(e) => setNewCompetitor(prev => ({ ...prev, differentiation: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitor.domain.trim() || !newCompetitor.differentiation.trim()}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          {/* Display added competitors */}
          {icpData.product.competitorAnalysis.length > 0 ? (
            <div>
              <h5 className="font-medium mb-3">Added Competitors:</h5>
              {icpData.product.competitorAnalysis.map((competitor, index) => (
                <div key={index} className="border p-3 rounded-lg mb-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      <strong>{competitor.domain}</strong> - {competitor.differentiation}
                    </span>
                    <Button variant="destructive" size="sm" onClick={() => removeCompetitor(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No competitors added yet. Fill in the form above and click "Add" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOfferSalesStep = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-6">Offer</h2>
        {/* Packages */}
        <div className="mb-6">
          <label className="font-semibold">Packages <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Explain different pricing tiers.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a pricing tier..."
            items={icpData.offerSales.pricingTiers}
            onAdd={(value) => addArrayItem("offerSales.pricingTiers", value)}
            onRemove={(index) => removeArrayItem("offerSales.pricingTiers", index)}
            fieldType="pricingTiers"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* Timeline */}
        <div className="mb-6">
          <label className="font-semibold">Timeline <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">How soon can your clients get ROI and what's needed on their end.</div>
          <ArrayFieldWithAI
            label=""
            placeholder="Add a timeline or ROI milestone..."
            items={icpData.offerSales.clientTimeline}
            onAdd={(value) => addArrayItem("offerSales.clientTimeline", value)}
            onRemove={(index) => removeArrayItem("offerSales.clientTimeline", index)}
            fieldType="clientTimeline"
            domain={icpData.domain}
            cumulativeData={getCumulativeProductData()}
          />
        </div>
        {/* Sales Deck URL */}
        <div className="mb-6">
          <label className="font-semibold">Sales Deck URL <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Include your sales deck (not pitch deck).</div>
          <ArrayField
            label=""
            placeholder="https://docs.google.com/presentation/d/..."
            items={icpData.offerSales.salesDeckUrl}
            onAdd={(value) => addArrayItem("offerSales.salesDeckUrl", value)}
            onRemove={(index) => removeArrayItem("offerSales.salesDeckUrl", index)}
          />
        </div>
      </div>
    </div>
  );

  const renderSocialProofStep = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-6">Social Proof</h2>
        {/* Case Studies */}
        <div className="mb-8">
          <label className="font-semibold">Case Studies <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">Link case studies per market segment.</div>
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input
                placeholder="Link (URL)"
                value={newCaseStudy.url}
                onChange={e => setNewCaseStudy(cs => ({ ...cs, url: e.target.value }))}
                className="w-full"
              />
              <Input
                placeholder="Market Segment"
                value={newCaseStudy.marketSegment}
                onChange={e => setNewCaseStudy(cs => ({ ...cs, marketSegment: e.target.value }))}
                className="w-full"
              />
              <Input
                placeholder="Title"
                value={newCaseStudy.title}
                onChange={e => setNewCaseStudy(cs => ({ ...cs, title: e.target.value }))}
                className="w-full"
              />
            </div>
            <Textarea
              placeholder="Description"
              value={newCaseStudy.description}
              onChange={e => setNewCaseStudy(cs => ({ ...cs, description: e.target.value }))}
              className="min-h-[80px] mb-4"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (newCaseStudy.url.trim()) {
                    setIcpData(prev => ({
                      ...prev,
                      socialProof: {
                        ...prev.socialProof,
                        caseStudies: [...prev.socialProof.caseStudies, { ...newCaseStudy }]
                      }
                    }));
                    setNewCaseStudy({ url: '', marketSegment: '', title: '', description: '' });
                  }
                }}
                disabled={!newCaseStudy.url.trim()}
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-md shadow"
              >
                Add
              </Button>
            </div>
          </div>
          {/* Display added case studies */}
          {icpData.socialProof.caseStudies.length > 0 ? (
            <div>
              <h5 className="font-medium mb-3">Added Case Studies:</h5>
              <div className="space-y-2">
                {icpData.socialProof.caseStudies.map((cs, idx) => (
                  <div key={idx} className="border p-3 rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium text-base">{cs.title || cs.url}</div>
                      <div className="text-xs text-gray-500">{cs.marketSegment}</div>
                      <div className="text-xs text-gray-500 whitespace-pre-line">{cs.description}</div>
                      <a href={cs.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline">{cs.url}</a>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => {
                      setIcpData(prev => ({
                        ...prev,
                        socialProof: {
                          ...prev.socialProof,
                          caseStudies: prev.socialProof.caseStudies.filter((_, i) => i !== idx)
                        }
                      }));
                    }}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No case studies added yet. Fill in the form above and click "Add" to get started.</p>
            </div>
          )}
        </div>
        {/* Testimonials */}
        <div className="mb-8">
          <label className="font-semibold">Testimonials <span className="text-red-500">*</span></label>
          <div className="text-gray-500 text-sm mb-2">List notable testimonials, ideally with metrics.</div>
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Textarea
                placeholder="Testimonial Content"
                value={newTestimonial.content}
                onChange={e => setNewTestimonial(t => ({ ...t, content: e.target.value }))}
                className="w-full min-h-[70px]"
              />
              <Textarea
                placeholder="Metrics (optional)"
                value={newTestimonial.metrics}
                onChange={e => setNewTestimonial(t => ({ ...t, metrics: e.target.value }))}
                className="w-full min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Input
                placeholder="Author"
                value={newTestimonial.author}
                onChange={e => setNewTestimonial(t => ({ ...t, author: e.target.value }))}
                className="w-full"
              />
              <Input
                placeholder="Company"
                value={newTestimonial.company}
                onChange={e => setNewTestimonial(t => ({ ...t, company: e.target.value }))}
                className="w-full"
              />
              <Input
                placeholder="Title (optional)"
                value={newTestimonial.title}
                onChange={e => setNewTestimonial(t => ({ ...t, title: e.target.value }))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (newTestimonial.content.trim()) {
                    setIcpData(prev => ({
                      ...prev,
                      socialProof: {
                        ...prev.socialProof,
                        testimonials: [...prev.socialProof.testimonials, { ...newTestimonial }]
                      }
                    }));
                    setNewTestimonial({ content: '', author: '', company: '', metrics: '', title: '' });
                  }
                }}
                disabled={!newTestimonial.content.trim()}
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-md shadow"
              >
                Add
              </Button>
            </div>
          </div>
          {/* Display added testimonials */}
          {icpData.socialProof.testimonials.length > 0 ? (
            <div>
              <h5 className="font-medium mb-3">Added Testimonials:</h5>
              <div className="space-y-2">
                {icpData.socialProof.testimonials.map((t, idx) => (
                  <div key={idx} className="border p-3 rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium text-base whitespace-pre-line">{t.content}</div>
                      <div className="text-xs text-gray-500">{t.author} {t.company && `(${t.company})`}</div>
                      {t.metrics && <div className="text-xs text-gray-500 whitespace-pre-line">{t.metrics}</div>}
                      {t.title && <div className="text-xs text-gray-500">{t.title}</div>}
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => {
                      setIcpData(prev => ({
                        ...prev,
                        socialProof: {
                          ...prev.socialProof,
                          testimonials: prev.socialProof.testimonials.filter((_, i) => i !== idx)
                        }
                      }));
                    }}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No testimonials added yet. Fill in the form above and click "Add" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
      domain={icpData.domain}
      cumulativeData={getCumulativeProductData()}
    />
  );

  const renderOutboundStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Previous Outbound Experience</h3>
      
      <div className="space-y-4">
        <ArrayField
          label="Do you have any outbound emails / DMs that have performed well?"
          placeholder="Paste your successful email/DM template here..."
          items={icpData.outboundExperience.successfulEmails}
          onAdd={(value) => addArrayItem("outboundExperience.successfulEmails", value)}
          onRemove={(index) => removeArrayItem("outboundExperience.successfulEmails", index)}
        />
      </div>

      <div className="space-y-4">
        <ArrayField
          label="Do you have any outbound cold call scripts that have worked well?"
          placeholder="Paste your successful call script here..."
          items={icpData.outboundExperience.successfulCallScripts}
          onAdd={(value) => addArrayItem("outboundExperience.successfulCallScripts", value)}
          onRemove={(index) => removeArrayItem("outboundExperience.successfulCallScripts", index)}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderAdminDomainStep();
      case 1: return renderProductStep();
      case 2: return renderOfferSalesStep();
      case 3: return renderSocialProofStep();
      case 4: return renderSegmentsStep();
      case 5: return renderOutboundStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Enhanced ICP Model - {steps[currentStep].title}</span>
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
                    "Complete ICP Model"
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
