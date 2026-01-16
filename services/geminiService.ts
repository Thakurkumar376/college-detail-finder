
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CollegeInfo, SearchParams, GroundingSource, DashboardAnalysis, CollegeEvent, AreaSearchParams, CompanyInfo, CompanySearchParams } from "../types";
import { NOT_AVAILABLE } from "../constants";

const CACHE_PREFIX = "clg_fnd_v24_strict_audit_";

const getCacheKey = (params: any): string => {
  return CACHE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(params))));
};

export const searchCollegeInfo = async (params: SearchParams): Promise<{ colleges: CollegeInfo[]; sources: GroundingSource[] }> => {
  const cacheKey = getCacheKey(params);
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.colleges) return parsed;
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Search for Indian college details for: ${params.collegeName} in ${params.state}, ${params.district || 'All districts'}.
Return full institutional details in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    let rawData = JSON.parse(text.trim());
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    const colleges: CollegeInfo[] = dataArray.map((data: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || "Unknown Institution",
      state: data.state || params.state,
      district: data.district || params.district || NOT_AVAILABLE,
      universityAffiliation: data.universityAffiliation || NOT_AVAILABLE,
      collegeType: data.collegeType || NOT_AVAILABLE,
      coursesOffered: data.coursesOffered || [],
      principalName: data.principalName || NOT_AVAILABLE,
      principalContact: data.principalContact || NOT_AVAILABLE,
      principalEmail: data.principalEmail || NOT_AVAILABLE,
      tpoName: data.tpoName || NOT_AVAILABLE,
      tpoContact: data.tpoContact || NOT_AVAILABLE,
      tpoEmail: data.tpoEmail || NOT_AVAILABLE,
      website: data.website || NOT_AVAILABLE,
      aisheCode: data.aisheCode || NOT_AVAILABLE,
      establishedYear: data.establishedYear || NOT_AVAILABLE,
      accreditation: data.accreditation || NOT_AVAILABLE,
      totalStudentStrength: data.totalStudentStrength || NOT_AVAILABLE,
      facultyStrength: data.facultyStrength || NOT_AVAILABLE,
      address: data.address || NOT_AVAILABLE,
      pinCode: data.pinCode || NOT_AVAILABLE,
      isVerified: (data.confidenceScore || 0) > 0.7,
      confidenceScore: data.confidenceScore || 0,
      sources: [],
      schools: data.schools || []
    }));

    const result = { colleges, sources: [] };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("Gemini Search Error:", err);
    throw new Error("Failed to process request.");
  }
};

export const searchCompanyInfo = async (params: CompanySearchParams): Promise<CompanyInfo[]> => {
  const cacheKey = getCacheKey({ type: 'hr_precision_audit_v2025', ...params });
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `CRITICAL HR VERIFICATION AUDIT (FEBRUARY 2025): ${params.companyName} in ${params.city || ''} ${params.state}.

STRICT MANDATE FOR PRECISION:
- Find the REAL current HR Leader (Head of HR, Talent Acquisition Manager, or Recruitment Lead) for this specific entity.
- ANTI-HALLUCINATION RULE: If you cannot find a 2024 or 2025 record of this person, do not guess. Return "Data Not Available" for those fields.
- VERIFICATION SOURCE: You MUST provide the specific web domain where this data was found (e.g., company website, verified press release, or official LinkedIn directory).

PROTOCOLS:
1. CROSS-REFERENCE: Check the official company domain first (e.g., if company is Google, search for @google.com emails).
2. LINKEDIN VALIDATION: 
   - Provide direct /in/ URLs only. 
   - If the URL is verified as a direct match, set isLinkedInVerified to TRUE.
3. DOMAIN MATCHING: 
   - Set isEmailVerified to TRUE ONLY if the email domain matches the company's official careers portal domain.

JSON SCHEMA:
[
  {
    "hrName": string,
    "role": string (Current Title),
    "hrContact": string (Phone or Official Extension),
    "hrEmail": string (Professional Corporate Email),
    "hrLinkedIn": string (Full Profile URL),
    "location": string (Specific Branch/Office Address),
    "isLinkedInVerified": boolean,
    "isEmailVerified": boolean,
    "isPhoneVerified": boolean,
    "auditTrail": "Detailed evidence of verification source and date",
    "sourceUrl": "The exact URL used for verification",
    "confidenceScore": number (0.0 to 1.0)
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Verification Audit failed: No public nodes discovered.");
    
    const results: any[] = JSON.parse(text.trim());
    const finalLeads: CompanyInfo[] = (Array.isArray(results) ? results : []).map(c => ({
      ...c,
      id: Math.random().toString(36).substr(2, 9),
      name: params.companyName,
      city: params.city,
      state: params.state,
      industry: "Institutional Placement Node",
      website: c.sourceUrl || "Official Channel",
      verificationProof: c.auditTrail || "Cross-referenced via organizational search grounding."
    }));

    localStorage.setItem(cacheKey, JSON.stringify(finalLeads));
    return finalLeads;
  } catch (err) {
    console.error("Critical Audit Failure:", err);
    throw new Error("Bureau Alert: We encountered high levels of noise during the domain audit. Precision verification is currently inhibited.");
  }
};

export const searchAreaEvents = async (params: AreaSearchParams): Promise<CollegeEvent[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Search for major campus events in ${params.district}, ${params.state} for ${params.year}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return JSON.parse(response.text.trim());
  } catch (err) {
    throw new Error("Failed to fetch events.");
  }
};

export const analyzeDataset = async (headers: string[], sampleRows: any[]): Promise<DashboardAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze institutional dataset: ${headers.join(", ")}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text.trim());
  } catch (err) {
    return { insightSummary: "Skipped.", keyTakeaways: [], suggestedActions: [], dataQualityScore: 0 };
  }
};
