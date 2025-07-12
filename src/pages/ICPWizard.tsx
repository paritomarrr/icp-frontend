import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Suggestions } from "@/components/ui/suggestions";
import { authService } from "@/lib/auth";
import { storageService } from "@/lib/storage";
import { icpWizardApi, StepData } from "@/lib/api";
import { ICPData } from "@/types";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingPage from "@/components/LoadingPage";

interface ICPWizardInputs {
  companyUrl: string;
  products: string[];
  personas: string[];
  useCases: string[];
  differentiation: string;
  segments: string[];
  competitors: { name: string; url: string }[];
}

const fieldConfigs = [
  {
    key: "companyUrl",
    label: "Company Website",
    placeholder: "Enter your company website URL (e.g., company.com)",
    type: "input",
    required: true,
  },
  {
    key: "products",
    label: "Products & Services",
    placeholder: "What products or services do you offer?",
    type: "array",
    required: true,
  },
  {
    key: "personas",
    label: "Target Personas",
    placeholder: "Who are your ideal customers?",
    type: "array",
    required: true,
  },
  {
    key: "useCases",
    label: "Use Cases",
    placeholder: "How do customers use your products?",
    type: "array",
    required: true,
  },
  {
    key: "differentiation",
    label: "Differentiation",
    placeholder: "What makes your company unique?",
    type: "input",
    required: true,
  },
  {
    key: "segments",
    label: "Market Segments",
    placeholder: "What markets do you target?",
    type: "array",
    required: true,
  },
  {
    key: "competitors",
    label: "Competitors",
    placeholder: "Who are your main competitors?",
    type: "competitors",
    required: true,
  },
];

const ICPWizard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airtableRecordId, setAirtableRecordId] = useState<string | null>(null);
  const [icpInputs, setIcpInputs] = useState<ICPWizardInputs>({
    companyUrl: "",
    products: [],
    personas: [],
    useCases: [],
    differentiation: "",
    segments: [],
    competitors: [],
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // For array/competitor field input
  const [inputValue, setInputValue] = useState("");
  const [compName, setCompName] = useState("");
  const [compUrl, setCompUrl] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }
        setUser(currentUser);
        const res = await fetch(
          `http://localhost:3000/api/workspaces/slug/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          }
        );
        if (!res.ok) throw new Error("Workspace not found");
        const data = await res.json();
        setWorkspace(data);
        storageService.saveWorkspace(data.slug, data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        navigate("/login");
      }
    };
    fetchWorkspace();
  }, [slug]);

  // Fetch suggestions for the active field (except the first field)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!activeField || activeField === "companyUrl") return;
      setSuggestionsLoading(true);
      setSuggestions(null);
      const fieldIndex = fieldConfigs.findIndex(f => f.key === activeField);
      if (fieldIndex === -1) return;
      const res = await icpWizardApi.generateSuggestions(fieldIndex, { companyName: workspace.companyName, ...icpInputs }, workspace.companyName);
      setSuggestionsLoading(false);
      if (res.success && res.suggestions) {
        setSuggestions(res.suggestions);
      }
    };
    if (workspace && activeField) fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeField, workspace]);

  if (loading) return null;
  if (!user || !workspace) {
    return <Navigate to="/login" />;
  }

  const handleAcceptSuggestions = (acceptedSuggestions: any) => {
    let processedValue = acceptedSuggestions;
    if (activeField === 'competitors' && Array.isArray(acceptedSuggestions)) {
      processedValue = acceptedSuggestions.map((item: any) => {
        if (typeof item === 'string') {
          const match = item.match(/^(.+?)\s*\((.+?)\)$/);
          if (match) {
            return { name: match[1].trim(), url: match[2].trim() };
          } else {
            return { name: item, url: '' };
          }
        }
        return item;
      });
    }
    if (["products", "personas", "useCases", "segments"].includes(activeField) && !Array.isArray(acceptedSuggestions)) {
      processedValue = [acceptedSuggestions];
    }
    if (["companyUrl", "differentiation"].includes(activeField)) {
      if (Array.isArray(acceptedSuggestions)) {
        processedValue = acceptedSuggestions[0] || '';
      } else if (typeof acceptedSuggestions === 'string') {
        processedValue = acceptedSuggestions;
      }
    }
    setIcpInputs(prev => ({
      ...prev,
      [activeField]: processedValue
    }));
    setSuggestions(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Validate all required fields
    for (const config of fieldConfigs) {
      const value = icpInputs[config.key as keyof ICPWizardInputs];
      if (config.required && (!value || (Array.isArray(value) && value.length === 0))) {
        toast({
          title: 'Field Required',
          description: `Please fill in or accept a suggestion for "${config.label}" before submitting.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }
    try {
      const stepData: StepData = {
        companyName: workspace.companyName,
        companyUrl: icpInputs.companyUrl,
        products: icpInputs.products,
        personas: icpInputs.personas,
        useCases: icpInputs.useCases,
        differentiation: icpInputs.differentiation,
        segments: icpInputs.segments,
        competitors: icpInputs.competitors,
      };
      // Submit to Airtable (and get/update recordId)
      const result = await icpWizardApi.submitStep(stepData, fieldConfigs.length - 1, slug!, airtableRecordId);
      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit to Airtable',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      setAirtableRecordId(result.airtableRecordId);
      // Submit to MongoDB
      const res = await fetch(
        `http://localhost:3000/api/workspaces/${workspace.slug}/icp`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(icpInputs),
        }
      );
      if (!res.ok) {
        toast({
          title: 'Error',
          description: 'Failed to save ICP to database',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      const updated = await res.json();
      storageService.saveWorkspace(updated.slug, updated);
      toast({
        title: "ICP Created!",
        description: "Redirecting to workspace...",
      });
      navigate(`/workspace/${workspace.slug}/home`);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not save ICP',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render all fields in a single card
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-8 px-2">
      {isSubmitting && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl px-8 py-8 flex flex-col items-center min-w-[280px] max-w-xs border border-slate-200">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <div className="text-base font-semibold text-slate-700">Generating ICP...</div>
            </div>
          </div>
        </>
      )}
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-0 sm:p-0">
            <div className="border-b border-slate-100 px-8 pt-8 pb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 tracking-tight">Create ICP: {workspace.name}</h1>
              <p className="text-slate-500 text-xs">Fill out all fields below. AI suggestions will appear as you focus on each field.</p>
            </div>
            <div className="px-8 pt-6 pb-2">
              {fieldConfigs.map((config, idx) => {
                const value = icpInputs[config.key as keyof ICPWizardInputs];
                return (
                  <div key={config.key} className="mb-6">
                    <label className="block font-medium text-slate-700 mb-1 text-sm" htmlFor={config.key}>{config.label}</label>
                    <div className="text-slate-400 text-xs mb-1">{config.placeholder}</div>
                    {config.type === "input" ? (
                      <Textarea
                        id={config.key}
                        placeholder={config.placeholder}
                        value={value as string}
                        onFocus={() => setActiveField(config.key)}
                        onChange={e => setIcpInputs(prev => ({ ...prev, [config.key]: e.target.value }))}
                        className="min-h-[60px] text-sm border-slate-200 focus:border-blue-400"
                      />
                    ) : null}
                    {config.type === "array" ? (
                      <div>
                        <div className="flex gap-2 mb-1">
                          <Input
                            placeholder="Add item..."
                            value={activeField === config.key ? inputValue : ""}
                            onFocus={() => setActiveField(config.key)}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (inputValue.trim() && !(value as string[]).includes(inputValue.trim())) {
                                  setIcpInputs(prev => ({
                                    ...prev,
                                    [config.key]: [...(value as string[]), inputValue.trim()]
                                  }));
                                  setInputValue("");
                                }
                              }
                            }}
                            className="flex-1 text-sm border-slate-200 focus:border-blue-400"
                          />
                          <Button type="button" onClick={() => {
                            if (inputValue.trim() && !(value as string[]).includes(inputValue.trim())) {
                              setIcpInputs(prev => ({
                                ...prev,
                                [config.key]: [...(value as string[]), inputValue.trim()]
                              }));
                              setInputValue("");
                            }
                          }} size="sm" className="text-xs">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(value as string[]).map((item, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-2 border border-blue-100"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => setIcpInputs(prev => ({
                                  ...prev,
                                  [config.key]: (value as string[]).filter((_, i) => i !== index)
                                }))}
                                className="text-blue-500 hover:text-blue-700 text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {config.type === "competitors" ? (
                      <div>
                        <div className="flex gap-2 mb-1">
                          <Input
                            placeholder="Competitor name"
                            value={activeField === config.key ? compName : ""}
                            onFocus={() => setActiveField(config.key)}
                            onChange={e => setCompName(e.target.value)}
                            className="flex-1 text-sm border-slate-200 focus:border-blue-400"
                          />
                          <Input
                            placeholder="Website URL"
                            value={activeField === config.key ? compUrl : ""}
                            onFocus={() => setActiveField(config.key)}
                            onChange={e => setCompUrl(e.target.value)}
                            className="flex-1 text-sm border-slate-200 focus:border-blue-400"
                          />
                          <Button type="button" onClick={() => {
                            if (compName.trim() && compUrl.trim()) {
                              setIcpInputs(prev => ({
                                ...prev,
                                competitors: [...prev.competitors, { name: compName.trim(), url: compUrl.trim() }]
                              }));
                              setCompName("");
                              setCompUrl("");
                            }
                          }} size="sm" className="text-xs">Add</Button>
                        </div>
                        <div className="space-y-1">
                          {(value as any[]).map((comp, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-slate-100">
                              <div>
                                <p className="font-medium text-xs">{comp.name}</p>
                                <p className="text-xs text-gray-500">{comp.url}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIcpInputs(prev => ({
                                  ...prev,
                                  competitors: prev.competitors.filter((_, i) => i !== index)
                                }))}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {/* Suggestions for active field (not companyUrl) */}
                    {activeField === config.key && config.key !== "companyUrl" && (
                      <div className="mt-3">
                        {suggestionsLoading ? (
                          <div className="text-blue-500 text-xs">Loading suggestions...</div>
                        ) : suggestions ? (
                          <Suggestions
                            suggestions={suggestions}
                            onAccept={handleAcceptSuggestions}
                            type={config.type === "input" ? "string" : (config.type as "array" | "competitors")}
                            title={`AI Suggestions for ${config.label}`}
                            description="Claude has analyzed your previous answers and generated these suggestions. You can accept, edit, or skip them."
                          />
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 px-8 pt-2 pb-8 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating ICP...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Generate ICP
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ICPWizard;