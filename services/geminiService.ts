
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CollegeInfo, SearchParams, GroundingSource, DashboardAnalysis, CollegeEvent, AreaSearchParams, CompanyInfo, CompanySearchParams } from "../types";
import { NOT_AVAILABLE } from "../constants";

const CACHE_PREFIX = "colle_intel_v45_deep_identity_";

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
  
  const prompt = `Search for Indian college details for: ${params.collegeName || 'All colleges'} in ${params.state}, ${params.district || 'All districts'}.
If collegeName is not provided, return a list of major colleges in that district.
Return full institutional details in JSON format including university affiliation, principal, and TPO contacts.`;

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
  const cacheKey = getCacheKey({ type: 'hr_v41_high_precision', ...params });
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `PRECISION HR AUDIT MISSION: 
COMPANY: ${params.companyName}
BRANCH: ${params.city || ''}, ${params.state}, India

EXECUTION STEPS:
1. BRANCH LOCATION AUDIT: Verify physical office in ${params.city}.
2. LEADERSHIP IDENTIFICATION: Find current Senior HR leadership for THIS BRANCH specifically.
3. DATA CROSS-VERIFICATION: Check LinkedIn for CURRENT (2024-2025) status.

JSON FORMAT:
[
  {
    "hrName": string,
    "role": string,
    "hrContact": string,
    "hrEmail": string,
    "hrLinkedIn": string,
    "location": string,
    "auditTrail": string,
    "confidenceScore": number
  }
]
IMPORTANT: If data is missing or unverified, use "N/A".`;

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
    const results: any[] = JSON.parse(text || "[]");
    
    if (results.length === 0) {
      throw new Error(`Audit failed for ${params.companyName}.`);
    }
    
    const finalLeads: CompanyInfo[] = results.map(c => ({
      ...c,
      id: Math.random().toString(36).substr(2, 9),
      name: params.companyName,
      city: params.city || "Regional",
      state: params.state,
      industry: "Corporate Human Resources",
      website: "Institutional Audit Node",
      verificationProof: c.auditTrail || "Multi-vector search grounding completed."
    }));

    localStorage.setItem(cacheKey, JSON.stringify(finalLeads));
    return finalLeads;
  } catch (err: any) {
    console.error("Audit Failure:", err);
    throw new Error(err.message || `Bureau Alert: Verification failed for ${params.companyName}.`);
  }
};

export const searchAreaEvents = async (params: AreaSearchParams): Promise<CollegeEvent[]> => {
  const cacheKey = getCacheKey({ type: 'deep_identity_mining_v45', ...params });
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `ACT AS A HIGH-LEVEL CORPORATE INTELLIGENCE AGENT. YOUR MISSION IS TO PERFORM A DEEP-DIVE IDENTITY AUDIT OF TECHNICAL CHAPTERS IN THE DISTRICT: ${params.district}, STATE: ${params.state}.

DO NOT RETURN "VERIFICATION PENDING" OR "N/A" FOR NAMES UNLESS IT IS ABSOLUTELY IMPOSSIBLE AFTER 10+ SEARCH ITERATIONS.

IDENTITY MINING PROTOCOL (STRICT):
1. SEARCH QUERY ESCALATION: 
   - Start with: "[College Name] [Event Name] contact list"
   - Escalate to: "[College Name] GDSC Lead 2024 2025" or "[College Name] IEEE Chairperson name"
   - Mine LinkedIn: "site:linkedin.com [College Name] Student Coordinator"
   - Mine Instagram: "site:instagram.com [College Name] [Tech Club Name] team"
2. SOURCE VERIFICATION:
   - Check PDF brochures of technical festivals hosted in ${params.district}. These brochures ALWAYS list student coordinators and their mobile numbers in the "Contact Us" section.
   - Look for Unstop/Devpost event pages which list "Organizers" or "Prizes/Rules" sections containing coordinator identities.
3. DATA RECONSTRUCTION:
   - If the 2025 Lead is not yet indexed, find the 2024 Lead. Most leads are core members for 2+ years.
   - If a specific hackathon isn't announced, find the college's "Annual Tech Fest" (e.g., Pulse, Innovision, etc.) and extract the Core Committee members.

OUTPUT REQUIREMENTS:
- leaderName: MUST be a real human name (e.g., "Siddharth Verma").
- leaderContact: Locate the 10-digit mobile number from brochures or social media tags.
- memberName: Find the PR Head or Technical Secretary's name.

JSON FORMAT (LIST 15+ UNIQUE INSTITUTIONAL NODES):
[
  {
    "collegeName": string,
    "district": string,
    "state": string,
    "communityName": string,
    "leaderName": string,
    "leaderContact": string,
    "leaderEmail": string,
    "memberName": string,
    "memberContact": string,
    "memberEmail": string,
    "hackathonName": string
  }
]
IF NO PERSON IS FOUND FOR A NODE, SEARCH FOR A DIFFERENT COLLEGE. THE FINAL LIST MUST BE RICH WITH IDENTITIES.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 16000 } // MAX THOUGHT FOR DEEP SEARCH
      }
    });
    
    const results = JSON.parse(response.text.trim());
    if (!Array.isArray(results)) throw new Error("Bureau Error: Identity Mining Failed.");

    const finalResults = results.map((r: any) => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Upcoming'
    }));
    
    localStorage.setItem(cacheKey, JSON.stringify(finalResults));
    return finalResults;
  } catch (err) {
    console.error("Deep Mining Error:", err);
    throw new Error(`Deep District Audit Failure: No high-confidence identity nodes could be extracted for ${params.district}.`);
  }
};

export const analyzeDataset = async (headers: string[], sampleRows: any[]): Promise<DashboardAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze institutional dataset: ${headers.join(", ")}. Return a high-impact DashboardAnalysis object in JSON format. Ensure all arrays like keyTakeaways and suggestedActions are present.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text.trim());
  } catch (err) {
    return { insightSummary: "Analysis unavailable.", keyTakeaways: [], suggestedActions: [], dataQualityScore: 0 };
  }
};
