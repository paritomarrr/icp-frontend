import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

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
  title: string;
  metrics: string;
}

interface SocialProof {
  caseStudies: CaseStudy[];
  testimonials: Testimonial[];
}

interface SocialProofStepProps {
  socialProof: SocialProof;
  onUpdate: (socialProof: SocialProof) => void;
}

export default function SocialProofStep({ socialProof, onUpdate }: SocialProofStepProps) {
  const addCaseStudy = () => {
    const newCaseStudy: CaseStudy = {
      url: "",
      marketSegment: "",
      title: "",
      description: ""
    };
    onUpdate({
      ...socialProof,
      caseStudies: [...socialProof.caseStudies, newCaseStudy]
    });
  };

  const updateCaseStudy = (index: number, field: keyof CaseStudy, value: string) => {
    const updatedCaseStudies = socialProof.caseStudies.map((caseStudy, i) =>
      i === index ? { ...caseStudy, [field]: value } : caseStudy
    );
    onUpdate({
      ...socialProof,
      caseStudies: updatedCaseStudies
    });
  };

  const removeCaseStudy = (index: number) => {
    const updatedCaseStudies = socialProof.caseStudies.filter((_, i) => i !== index);
    onUpdate({
      ...socialProof,
      caseStudies: updatedCaseStudies
    });
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      content: "",
      author: "",
      company: "",
      title: "",
      metrics: ""
    };
    onUpdate({
      ...socialProof,
      testimonials: [...socialProof.testimonials, newTestimonial]
    });
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string) => {
    const updatedTestimonials = socialProof.testimonials.map((testimonial, i) =>
      i === index ? { ...testimonial, [field]: value } : testimonial
    );
    onUpdate({
      ...socialProof,
      testimonials: updatedTestimonials
    });
  };

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = socialProof.testimonials.filter((_, i) => i !== index);
    onUpdate({
      ...socialProof,
      testimonials: updatedTestimonials
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-4">Case Studies</h4>
        <p className="text-sm text-gray-600 mb-4">
          Provide links to case studies, categorized by market segment.
        </p>
        
        {socialProof.caseStudies.map((caseStudy, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <h5 className="font-medium">Case Study {index + 1}</h5>
              {socialProof.caseStudies.length > 1 && (
                <Button variant="destructive" size="sm" onClick={() => removeCaseStudy(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Case study URL"
                value={caseStudy.url}
                onChange={(e) => updateCaseStudy(index, 'url', e.target.value)}
              />
              <Input
                placeholder="Market segment"
                value={caseStudy.marketSegment}
                onChange={(e) => updateCaseStudy(index, 'marketSegment', e.target.value)}
              />
            </div>
            
            <Input
              placeholder="Case study title"
              value={caseStudy.title}
              onChange={(e) => updateCaseStudy(index, 'title', e.target.value)}
            />
            
            <Textarea
              placeholder="Brief description"
              value={caseStudy.description}
              onChange={(e) => updateCaseStudy(index, 'description', e.target.value)}
            />
          </div>
        ))}
        
        <Button variant="outline" onClick={addCaseStudy}>
          <Plus className="h-4 w-4 mr-2" />
          Add Case Study
        </Button>
      </div>

      <div>
        <h4 className="font-medium mb-4">Testimonials</h4>
        <p className="text-sm text-gray-600 mb-4">
          List notable testimonials (ideally with metrics).
        </p>
        
        {socialProof.testimonials.map((testimonial, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <h5 className="font-medium">Testimonial {index + 1}</h5>
              {socialProof.testimonials.length > 1 && (
                <Button variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Textarea
              placeholder="Testimonial content"
              value={testimonial.content}
              onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Author name"
                value={testimonial.author}
                onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
              />
              <Input
                placeholder="Company"
                value={testimonial.company}
                onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
              />
              <Input
                placeholder="Author title"
                value={testimonial.title}
                onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
              />
            </div>
            
            <Input
              placeholder="Metrics (e.g., '50% increase in efficiency')"
              value={testimonial.metrics}
              onChange={(e) => updateTestimonial(index, 'metrics', e.target.value)}
            />
          </div>
        ))}
        
        <Button variant="outline" onClick={addTestimonial}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>
    </div>
  );
}
