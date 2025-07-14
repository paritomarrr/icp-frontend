import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AIRTABLE_FORM_URL = 'https://airtable.com/appRRCzf2OtLhjk60/pagfrx489F3BIMSUd/form';

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function groupClaudeSuggestions(enrichment: any) {
  if (!enrichment) return {};
  // Map enrichment fields to Airtable fields as needed
  return {
    'Domain': enrichment.companyUrl || '',
    'Features': enrichment.products?.features || [],
    'Problems': enrichment.products?.problems || [],
    'Solutions': enrichment.products?.solution ? [enrichment.products.solution] : [],
    'USPs': enrichment.products?.usp || [],
    'Why now': enrichment.products?.whyNow || [],
    'Value Proposition': enrichment.oneLiner ? [enrichment.oneLiner] : [],
    'Company Summary': enrichment.companySummary ? [enrichment.companySummary] : [],
    // Add more mappings as needed
  };
}

export default function AirtableWizard() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      setError(null);
      try {
        // Fetch workspace data
        const res = await fetch(`http://localhost:3000/api/workspaces/slug/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch workspace');
        const workspace = await res.json();
        // Use the first enrichment version (or latest)
        const enrichment = workspace.icpEnrichmentVersions?.['1'] || Object.values(workspace.icpEnrichmentVersions || {})[0];
        if (!enrichment) throw new Error('No Claude enrichment found for this workspace');
        setSuggestions(groupClaudeSuggestions({ ...enrichment, companyUrl: workspace.companyUrl }));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch suggestions');
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchSuggestions();
  }, [slug]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      {/* Claude Suggestions Sidebar */}
      <div style={{ width: 380, background: '#fff', padding: 24, borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>AI Suggestions</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Use these suggestions to fill out the Airtable form. Click to copy and paste into the relevant field.
        </p>
        {loading ? (
          <div style={{ color: '#64748b', fontSize: 16 }}>Loading suggestions...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', fontSize: 16 }}>{error}</div>
        ) : (
          Object.entries(suggestions).map(([field, values]) => (
            <div key={field} style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 8 }}>{field}</div>
              {Array.isArray(values) && values.length > 0 ? (
                <ul style={{ paddingLeft: 0, margin: 0 }}>
                  {values.map((s, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ background: '#e0e7ef', borderRadius: 6, padding: '6px 10px', fontSize: 15, marginRight: 8 }}>{s}</span>
                      <button
                        onClick={() => {
                          copyToClipboard(s);
                          setCopied(`${field}-${idx}`);
                          setTimeout(() => setCopied(null), 1200);
                        }}
                        style={{
                          background: copied === `${field}-${idx}` ? '#4f46e5' : '#e0e7ef',
                          color: copied === `${field}-${idx}` ? '#fff' : '#334155',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: 13,
                          transition: 'background 0.2s',
                        }}
                      >
                        {copied === `${field}-${idx}` ? 'Copied!' : 'Copy'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#64748b', fontSize: 14 }}>No suggestions</div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Airtable Form */}
      <iframe
        src={AIRTABLE_FORM_URL}
        style={{ flex: 1, border: 'none', height: '100vh', background: '#f8fafc' }}
        title="Airtable Form"
      />
    </div>
  );
} 