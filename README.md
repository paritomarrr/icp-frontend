# ICP Model Frontend (Workflows.io)

## Overview

This project is the frontend for the ICP Model (Workflows.io), a modern onboarding and GTM data collection tool. The app features a multi-step onboarding wizard that collects detailed information about a business, its products, segments, personas, and outbound experience. The new design is focused on clarity, flexibility, and actionable data—without any AI enrichment except for field-level suggestions.

## Key Features

- **Multi-step onboarding wizard**: Each major section (Admin, Product Understanding, Offer & Sales, Social Proof, Target Segments, Previous Outbound Experience) is a separate step.
- **Dynamic segment/persona entry**: Add multiple segments and personas as needed.
- **Field-level AI suggestions**: Get helpful suggestions for each field, but no auto-enrichment or extra AI data is stored.
- **Modern, clean UI**: Designed for clarity and ease of use.
- **Dedicated pages for Products, Segments, and Personas**: Each page reflects the new data structure.

## Data Structure

The form collects and stores data in the following structure:

```js
{
  admin: {
    emailSignatures: [ { firstName, lastName, title } ],
    platformAccess: Boolean,
    domain: String
  },
  productUnderstanding: {
    valueProposition: [String],
    problemsSolved: [String],
    keyFeatures: [String],
    solutionsOutcomes: [String],
    usps: [String],
    urgency: [String],
    competitorAnalysis: [ { domain, differentiation } ]
  },
  offerSales: {
    pricingPackages: [String],
    clientTimelineROI: String,
    salesDeckUrl: String
  },
  socialProof: {
    caseStudies: [ { url, segment } ],
    testimonials: [String]
  },
  targetSegments: [
    {
      name: String,
      firmographics: { industry, employeeCount, locations: [String] },
      signals: [String],
      qualification: {
        tier1Criteria: [String],
        lookalikeCompanyUrls: [String],
        disqualifyingCriteria: [String]
      },
      messaging: {
        specificBenefits: [String],
        awarenessLevel: String,
        ctaOptions: [String]
      },
      personas: [
        {
          mappedSegment: String,
          department: String,
          jobTitles: [String],
          valueProposition: String,
          specificCTA: String,
          responsibilities: [String],
          okrs: [String],
          painPoints: [String]
        }
      ]
    }
  ],
  previousOutboundExperience: {
    successfulEmailsOrDMs: [String],
    coldCallScripts: [String]
  }
}
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### Setup
1. Clone the repo:
   ```sh
   git clone <your-repo-url>
   cd icp-frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```
3. Create a `.env` file in the root:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Start the development server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```

### Deployment
- Deploy to Vercel, Netlify, or your preferred static hosting provider.
- Set the `VITE_API_URL` environment variable to point to your backend API.

## Development Workflow
- Update the onboarding wizard steps in `src/pages/ICPWizard.tsx`.
- Update the data display pages (Products, Segments, Personas) to reflect the new structure.
- Only field-level AI suggestions are provided; no enrichment or auto-filling is performed.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
