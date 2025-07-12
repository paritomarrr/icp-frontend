
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ICPInputs {
  companyUrl: string;
  products: string;
  personas: string;
  useCases: string;
  differentiation: string;
  segments: string;
  competitors: string;
}

const generateSystemPrompt = (inputs: ICPInputs, variant: number) => {
  const basePrompt = `You are an expert Go-to-Market strategist. Generate a comprehensive Ideal Customer Profile analysis based on the following company information:

Company URL: ${inputs.companyUrl}
Products/Services: ${inputs.products}
Target Personas: ${inputs.personas}
Use Cases: ${inputs.useCases}
Differentiation: ${inputs.differentiation}
Market Segments: ${inputs.segments}
Competitors: ${inputs.competitors}

Please provide a detailed analysis for each section. Structure your response clearly with the following sections:

PRODUCTS:
- Provide detailed product-market fit analysis
- Identify key value propositions
- Highlight unique features and benefits
- Explain pricing and positioning strategy

PERSONAS:
- Create detailed buyer persona profiles
- Include pain points, motivations, and decision criteria
- Map personas to departments and job titles
- Define primary responsibilities and OKRs for each persona

USE_CASES:
- Identify specific scenarios where the solution adds value
- Provide concrete examples of implementation
- Explain ROI and business impact
- Detail why timing matters (why now)

DIFFERENTIATION:
- Clearly articulate competitive advantages
- Explain unique value propositions
- Identify market positioning strengths
- Highlight barriers to entry for competitors

SEGMENTS:
- Define target market characteristics
- Provide firmographic details (revenue, employees, industry)
- Explain segment prioritization and qualification criteria
- Include geographic and demographic factors

COMPETITORS:
- Analyze competitive landscape
- Identify direct and indirect competitors
- Explain competitive positioning strategy
- Highlight competitive advantages and vulnerabilities

Make your analysis actionable and specific to this company.`;

  const variants = [
    basePrompt + "\n\nFocus on enterprise-level insights with strategic depth and market analysis.",
    basePrompt + "\n\nEmphasize practical implementation with tactical approaches and specific action items.",
    basePrompt + "\n\nHighlight innovation opportunities and market disruption potential with forward-looking insights.",
    basePrompt + "\n\nConcentrate on customer-centric value delivery and relationship building strategies."
  ];

  return variants[variant - 1] || variants[0];
};

const parseClaudeResponse = (response: string) => {
  const sections = {
    products: '',
    personas: '',
    useCases: '',
    differentiation: '',
    segments: '',
    competitors: ''
  };

  // Extract sections using regex patterns
  const extractSection = (text: string, sectionName: string) => {
    const patterns = [
      new RegExp(`${sectionName.toUpperCase()}:?\\s*([\\s\\S]*?)(?=\\n\\n[A-Z_]+:|$)`, 'i'),
      new RegExp(`\\n${sectionName.toUpperCase()}:?\\s*([\\s\\S]*?)(?=\\n\\n[A-Z_]+:|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  sections.products = extractSection(response, 'PRODUCTS');
  sections.personas = extractSection(response, 'PERSONAS');
  sections.useCases = extractSection(response, 'USE_CASES') || extractSection(response, 'USE CASES');
  sections.differentiation = extractSection(response, 'DIFFERENTIATION');
  sections.segments = extractSection(response, 'SEGMENTS');
  sections.competitors = extractSection(response, 'COMPETITORS');

  // Fallback to original content if parsing fails
  Object.keys(sections).forEach(key => {
    if (!sections[key as keyof typeof sections]) {
      sections[key as keyof typeof sections] = `Generated analysis for ${key}`;
    }
  });

  return sections;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inputs: ICPInputs = await req.json();
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    console.log('Generating ICP analysis for:', inputs.companyUrl);

    // Generate 4 variants in parallel
    const variantPromises = Array.from({ length: 4 }, async (_, index) => {
      const variantNumber = index + 1;
      const systemPrompt = generateSystemPrompt(inputs, variantNumber);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: systemPrompt
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error for variant ${variantNumber}:`, errorText);
        throw new Error(`Claude API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      console.log(`Generated variant ${variantNumber}`);
      return parseClaudeResponse(content);
    });

    const variants = await Promise.all(variantPromises);

    const result = {
      versions: {
        1: variants[0],
        2: variants[1],
        3: variants[2],
        4: variants[3]
      }
    };

    console.log('Successfully generated all 4 variants');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-icp function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate ICP analysis', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
