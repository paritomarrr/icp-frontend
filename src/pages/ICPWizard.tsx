import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/lib/auth";
import { storageService } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { ICPData } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
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

const ICPWizard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [compName, setCompName] = useState("");
  const [compUrl, setCompUrl] = useState("");

  const [icpInputs, setIcpInputs] = useState<ICPWizardInputs>({
    companyUrl: "https://mirakl.com",
    products: ["Marketplace Platform"],
    personas: ["VP of Product"],
    useCases: ["Launch B2B marketplace"],
    differentiation: "Mirakl is the fastest to launch",
    segments: ["Enterprise", "Retail"],
    competitors: [{ "name": "VTEX", "url": "https://vtex.com" }],
  });

  const [activeSection, setActiveSection] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const totalSections = 7;

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        console.log("🧠 ICPWizard → currentUser:", currentUser);
        if (!currentUser) {
          console.log("⛔ No user found, redirecting to login");
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
        console.log("🧠 Retrieved workspace:", data);
      } catch (err) {
        console.error("Failed to fetch workspace", err);
        setLoading(false);
        navigate("/login");
      }
    };

    fetchWorkspace();
  }, [slug]);

  if (loading) return null;

  if (!user || !workspace) {
    console.log("⛔ User or workspace not found, redirecting to login");
    return <Navigate to="/login" />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setIcpInputs({ ...icpInputs, [name]: value });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const validateSection = (section: number): boolean => {
    const sectionMap = [
      { key: "companyUrl", label: "Company URL" },
      { key: "products", label: "Products" },
      { key: "personas", label: "Personas" },
      { key: "useCases", label: "Use Cases" },
      { key: "differentiation", label: "Differentiation" },
      { key: "segments", label: "Segments" },
      { key: "competitors", label: "Competitors" },
    ];

    const { key, label } = sectionMap[section];
    const value = icpInputs[key as keyof ICPWizardInputs];

    if (key === "competitors") {
      const competitors = value as { name: string; url: string }[];
      if (
        !Array.isArray(competitors) ||
        competitors.length === 0 ||
        competitors.some((c) => !c.name.trim() || !c.url.trim())
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          [key]: "Please add valid competitors with name and URL",
        }));
        return false;
      }
    }

    if (
      value === undefined ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      setValidationErrors({
        ...validationErrors,
        [key]: `${label} is required`,
      });
      return false;
    }

    if (
      key === "companyUrl" &&
      typeof value === "string" &&
      !isValidUrl(value)
    ) {
      setValidationErrors({
        ...validationErrors,
        [key]: "Please enter a valid URL",
      });
      return false;
    }

    return true;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith("http") ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleNext = () => {
    if (validateSection(activeSection)) {
      setActiveSection((prev) => Math.min(prev + 1, totalSections - 1));
    } else {
      toast({
        title: "Required Field",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const handleCompetitorAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (compName.trim() && compUrl.trim()) {
        setIcpInputs((prev) => ({
          ...prev,
          competitors: [
            ...(prev.competitors || []),
            { name: compName.trim(), url: compUrl.trim() },
          ],
        }));
        setCompName("");
        setCompUrl("");
      }
    }
  };

  const handlePrev = () => {
    setActiveSection((prev) => Math.max(prev - 1, 0));
  };

  const sectionLabels = [
    "Company URL",
    "Products",
    "Personas",
    "Use Cases",
    "Differentiation",
    "Segments",
    "Competitors",
  ];

  const handleSubmit = async () => {
    if (!slug) return;

    // 🛠️ If competitor input fields are non-empty, add them manually
    const trimmedName = compName.trim();
    const trimmedUrl = compUrl.trim();
    if (trimmedName && trimmedUrl) {
      setIcpInputs((prev) => ({
        ...prev,
        competitors: [
          ...prev.competitors,
          { name: trimmedName, url: trimmedUrl },
        ],
      }));
      setCompName("");
      setCompUrl("");
      return; // 🔁 retry submit after state update
    }

    let hasErrors = false;
    for (let i = 0; i < totalSections; i++) {
      if (!validateSection(i)) hasErrors = true;
    }

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
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

      if (!res.ok) throw new Error("Failed to save ICP");

      const updated = await res.json();

      console.log("💾 Saving workspace under slug:", updated.slug);

      storageService.saveWorkspace(updated.slug, updated);
      console.log("🔐 Saved in localStorage:", updated.slug, updated);


      console.log("💾 ICPWizard → Saved workspace slug:", updated.slug);
      console.log("💾 ICPWizard → Full saved workspace:", updated);

      toast({
        title: isEditing ? "ICP Updated!" : "ICP Created!",
        description: "Saved successfully",
      });

      setTimeout(() => navigate(`/workspace/${updated.slug}/home`), 1000);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not save ICP",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <LoadingPage onComplete={() => setIsGenerating(false)} />;
  }

  const renderFormSection = () => {
    const section = [
      {
        title: "Company Information",
        field: "companyUrl",
        placeholder: "Enter Company Website URL (e.g., company.com)",
        type: "input",
      },
      {
        title: "Products & Services",
        field: "products",
        placeholder: "Type a product and press Enter",
        type: "tags",
      },
      {
        title: "Target Personas",
        field: "personas",
        placeholder: "Type a persona and press Enter",
        type: "tags",
      },
      {
        title: "Use Cases",
        field: "useCases",
        placeholder: "Type a use case and press Enter",
        type: "tags",
      },
      {
        title: "Differentiation",
        field: "differentiation",
        placeholder: "What makes the company different?",
        type: "textarea",
      },
      {
        title: "Market Segments",
        field: "segments",
        placeholder: "Type a segment and press Enter",
        type: "tags",
      },
      {
        title: "Competitors",
        field: "competitors",
        placeholder: "Enter competitor name + URL",
        type: "competitors",
      },
    ][activeSection];

    const key = section.field as keyof ICPWizardInputs;
    const hasError = validationErrors[section.field];

    if (section.type === "tags") {
      return (
        <div className="space-y-3">
          <label className="font-semibold">{section.title}</label>
          <Input
            placeholder={section.placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val && !(icpInputs[key] as string[]).includes(val)) {
                  setIcpInputs({
                    ...icpInputs,
                    [key]: [...(icpInputs[key] as string[]), val],
                  });
                  e.currentTarget.value = "";
                }
              }
            }}
            onBlur={(e) => {
              const val = e.currentTarget.value.trim();
              if (val && !(icpInputs[key] as string[]).includes(val)) {
                setIcpInputs({
                  ...icpInputs,
                  [key]: [...(icpInputs[key] as string[]), val],
                });
                e.currentTarget.value = "";
              }
            }}
          />

          <div className="flex flex-wrap gap-2">
            {(icpInputs[key] as string[]).map((tag, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  className="ml-1 text-xs"
                  onClick={() => {
                    const updated = [...(icpInputs[key] as string[])];
                    updated.splice(i, 1);
                    setIcpInputs({ ...icpInputs, [key]: updated });
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      );
    }

    // 🔹 Competitor Input (name + url)
    if (section.type === "competitors") {
      return (
        <div className="space-y-3">
          <label className="font-semibold">{section.title}</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Shopify"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
            />

            <Input
              placeholder="https://competitor.com"
              value={compUrl}
              onChange={(e) => setCompUrl(e.target.value)}
              onKeyDown={handleCompetitorAdd}
              onBlur={(e) => {
                const trimmedName = compName.trim();
                const trimmedUrl = compUrl.trim();
                if (trimmedName && trimmedUrl) {
                  setIcpInputs((prev) => ({
                    ...prev,
                    competitors: [
                      ...prev.competitors,
                      { name: trimmedName, url: trimmedUrl },
                    ],
                  }));
                  setCompName("");
                  setCompUrl("");
                }
              }}
            />
          </div>
          <div className="space-y-1">
            {icpInputs.competitors.map((comp, i) => (
              <div
                key={i}
                className="text-sm flex items-center justify-between"
              >
                <span>
                  {comp.name} —{" "}
                  <a
                    href={comp.url}
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    {comp.url}
                  </a>
                </span>
                <button
                  className="text-xs text-red-600"
                  onClick={() => {
                    const updated = [...icpInputs.competitors];
                    updated.splice(i, 1);
                    setIcpInputs({ ...icpInputs, competitors: updated });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 🔹 Normal Input / Textarea
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-slate-700">
            {section.title}
          </h3>
          {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
        {section.type === "input" ? (
          <Input
            type="url"
            name={section.field}
            placeholder={section.placeholder}
            value={icpInputs[key] as string}
            onChange={handleChange}
            className={hasError ? "border-red-500" : ""}
          />
        ) : (
          <Textarea
            name={section.field}
            placeholder={section.placeholder}
            value={icpInputs[key] as string}
            onChange={handleChange}
            className={`min-h-[120px] ${hasError ? "border-red-500" : ""}`}
          />
        )}
        {hasError && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEditing
                ? `Edit ICP: ${workspace.name}`
                : `ICP Wizard: ${workspace.name}`}
            </CardTitle>
            <p className="text-slate-600">
              {isEditing
                ? "Update your inputs to regenerate the ICP analysis"
                : "Complete all sections to generate your ICP analysis"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress
              value={(activeSection + 1) * (100 / totalSections)}
              className="h-2"
            />
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Section {activeSection + 1} of {totalSections}
              </span>
              <span>{sectionLabels[activeSection]}</span>
            </div>

            {renderFormSection()}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={activeSection === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {activeSection === totalSections - 1 ? (
                <Button onClick={handleSubmit}>
                  {isEditing ? "Regenerate ICP" : "Generate ICP"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ICPWizard;
