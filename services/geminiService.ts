
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CollegeInfo, SearchParams, GroundingSource } from "../types";
import { NOT_AVAILABLE } from "../constants";

const CACHE_PREFIX = "clg_fnd_";

const getCacheKey = (params: SearchParams): string => {
  // Shorter, safer cache key
  return CACHE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(params)))).substring(0, 40);
};

export const searchCollegeInfo = async (params: SearchParams): Promise<{ college: CollegeInfo; sources: GroundingSource[] }> => {
  const cacheKey = getCacheKey(params);
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Ensure we have a valid object
      if (parsed && parsed.college) return parsed;
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  // Always use process.env.API_KEY directly when initializing GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Minimalist prompt for faster processing
  // Emphasis on district to disambiguate same-named colleges
  const prompt = `Search for Indian college details:
Name: ${params.collegeName}
State: ${params.state}
District: ${params.district || 'Not Specified'}
Filters: ${params.collegeType || 'Any'}, ${params.accreditation || 'Any'}, ${params.courses?.join(',') || 'Any'}

Required JSON structure (use "Not Available" for missing data):
{
  "name": string,
  "state": string,
  "district": string,
  "universityAffiliation": string,
  "collegeType": string,
  "coursesOffered": string[],
  "principalName": string,
  "principalContact": string,
  "principalEmail": string,
  "tpoName": string,
  "tpoContact": string,
  "tpoEmail": string,
  "website": string,
  "aisheCode": string,
  "establishedYear": string,
  "accreditation": string,
  "totalStudentStrength": string,
  "facultyStrength": string,
  "address": string,
  "pinCode": string,
  "confidenceScore": number (0-1)
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    // Parse the JSON response text
    const data = JSON.parse(text.trim());

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    const college: CollegeInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || params.collegeName,
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
      sources: sources.map(s => s.uri)
    };

    const result = { college, sources };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("Gemini Search Error:", err);
    throw new Error("The search took too long or failed. Please try a more specific name.");
  }
};
