
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CollegeInfo, SearchParams, GroundingSource } from "../types";
import { NOT_AVAILABLE } from "../constants";

const CACHE_PREFIX = "clg_fnd_v3_";

const getCacheKey = (params: SearchParams): string => {
  return CACHE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(params)))).substring(0, 40);
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
  
  // Adjusted prompt to handle multiple specific names or a single query
  const prompt = `Search for Indian college details. 
You are given one or more institution names or a general query. 
If the input contains a list of specific colleges, find and return data for EACH of those specific colleges. 
If it is a single name, return details for that college and any other highly relevant institutions in the same area.

Input Name(s)/Query: ${params.collegeName}
State: ${params.state}
District: ${params.district || 'Not Specified'}
Filters: ${params.collegeType || 'Any'}, ${params.accreditation || 'Any'}, ${params.courses?.join(',') || 'Any'}

Required JSON structure (Return an ARRAY of objects):
[
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
  }
]

IMPORTANT: Provide verified information. If a specific college in the list cannot be found, omit it from the array. Aim for a maximum of 10 results total.`;

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
    
    let rawData = JSON.parse(text.trim());
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

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
      sources: sources.map(s => s.uri)
    }));

    const result = { colleges, sources };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("Gemini Search Error:", err);
    throw new Error("The search failed. Please try again with fewer names or more specific details.");
  }
};
