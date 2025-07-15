import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

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
  const [newCaseStudy, setNewCaseStudy] = useState<CaseStudy>({
    url: "",
    marketSegment: "",
    title: "",
    description: ""
  });

  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    content: "",
    author: "",
    company: "",
    title: "",
    metrics: ""
  });

  const handleAddCaseStudy = () => {
    if (newCaseStudy.url.trim() && newCaseStudy.title.trim() && newCaseStudy.description.trim()) {
      onUpdate({
        ...socialProof,
        caseStudies: [...socialProof.caseStudies, { ...newCaseStudy }]
      });
      
      // Clear the form fields
      setNewCaseStudy({
        url: "",
        marketSegment: "",
        title: "",
        description: ""
      });
    }
  };

  const handleAddTestimonial = () => {
    if (newTestimonial.content.trim() && newTestimonial.author.trim()) {
      onUpdate({
        ...socialProof,
        testimonials: [...socialProof.testimonials, { ...newTestimonial }]
      });
      
      // Clear the form fields
      setNewTestimonial({
        content: "",
        author: "",
        company: "",
        title: "",
        metrics: ""
      });
    }
  };

  const removeCaseStudy = (index: number) => {
    const updatedCaseStudies = socialProof.caseStudies.filter((_, i) => i !== index);
    onUpdate({
      ...socialProof,
      caseStudies: updatedCaseStudies
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
          Provide links to case studies, categorized by market segment. Fill in the form below and click "Add" to save each case study.
        </p>
        
        {/* New case study form */}
        <div className="space-y-3 mb-4 border p-4 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Case study URL"
              value={newCaseStudy.url}
              onChange={(e) => setNewCaseStudy(prev => ({ ...prev, url: e.target.value }))}
            />
            <Input
              placeholder="Market segment"
              value={newCaseStudy.marketSegment}
              onChange={(e) => setNewCaseStudy(prev => ({ ...prev, marketSegment: e.target.value }))}
            />
          </div>
          
          <Input
            placeholder="Case study title"
            value={newCaseStudy.title}
            onChange={(e) => setNewCaseStudy(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Brief description"
              value={newCaseStudy.description}
              onChange={(e) => setNewCaseStudy(prev => ({ ...prev, description: e.target.value }))}
              className="flex-1"
              rows={3}
            />
            <Button 
              onClick={handleAddCaseStudy}
              disabled={!newCaseStudy.url.trim() || !newCaseStudy.title.trim() || !newCaseStudy.description.trim()}
              className="bg-black text-white hover:bg-gray-800 self-start"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Display added case studies */}
        {socialProof.caseStudies.length > 0 ? (
          <div>
            <h5 className="font-medium mb-3">Added Case Studies:</h5>
            {socialProof.caseStudies.map((caseStudy, index) => (
              <div key={index} className="border p-3 rounded-lg mb-2 bg-white">
                <div className="flex justify-between items-start">
                  <div className="text-sm flex-1">
                    <div><strong>{caseStudy.title}</strong></div>
                    <div className="text-gray-600">{caseStudy.marketSegment}</div>
                    <div className="text-gray-500 text-xs mt-1">{caseStudy.url}</div>
                    <div className="text-gray-700 mt-1">{caseStudy.description}</div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeCaseStudy(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No case studies added yet. Fill in the form above and click "Add" to get started.</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium mb-4">Testimonials</h4>
        <p className="text-sm text-gray-600 mb-4">
          List notable testimonials (ideally with metrics). Fill in the form below and click "Add" to save each testimonial.
        </p>
        
        {/* New testimonial form */}
        <div className="space-y-3 mb-4 border p-4 rounded-lg bg-gray-50">
          <Textarea
            placeholder="Testimonial content"
            value={newTestimonial.content}
            onChange={(e) => setNewTestimonial(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Author name"
              value={newTestimonial.author}
              onChange={(e) => setNewTestimonial(prev => ({ ...prev, author: e.target.value }))}
            />
            <Input
              placeholder="Company"
              value={newTestimonial.company}
              onChange={(e) => setNewTestimonial(prev => ({ ...prev, company: e.target.value }))}
            />
            <Input
              placeholder="Author title"
              value={newTestimonial.title}
              onChange={(e) => setNewTestimonial(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Metrics (e.g., '50% increase in efficiency')"
              value={newTestimonial.metrics}
              onChange={(e) => setNewTestimonial(prev => ({ ...prev, metrics: e.target.value }))}
              className="flex-1"
            />
            <Button 
              onClick={handleAddTestimonial}
              disabled={!newTestimonial.content.trim() || !newTestimonial.author.trim()}
              className="bg-black text-white hover:bg-gray-800"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Display added testimonials */}
        {socialProof.testimonials.length > 0 ? (
          <div>
            <h5 className="font-medium mb-3">Added Testimonials:</h5>
            {socialProof.testimonials.map((testimonial, index) => (
              <div key={index} className="border p-3 rounded-lg mb-2 bg-white">
                <div className="flex justify-between items-start">
                  <div className="text-sm flex-1">
                    <div className="text-gray-700 mb-2">"{testimonial.content}"</div>
                    <div><strong>{testimonial.author}</strong></div>
                    {testimonial.title && <div className="text-gray-600">{testimonial.title}</div>}
                    {testimonial.company && <div className="text-gray-600">{testimonial.company}</div>}
                    {testimonial.metrics && <div className="text-blue-600 font-medium">{testimonial.metrics}</div>}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No testimonials added yet. Fill in the form above and click "Add" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
