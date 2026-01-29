
export interface SchoolInfo {
  name: string;
  headName: string;
  headContact: string;
  headEmail: string;
  courses: string[];
}

export interface CollegeEvent {
  id: string;
  collegeName: string;
  district: string;
  state: string;
  communityName: string;
  leaderName: string;
  leaderContact: string;
  leaderEmail: string;
  memberName: string;
  memberContact: string;
  memberEmail: string;
  hackathonName: string;
  eventDate?: string;
  status: 'Upcoming' | 'Past' | 'Ongoing';
}

export interface CompanyInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  location: string;
  role: string;
  hrName: string;
  hrContact: string;
  hrEmail: string;
  hrLinkedIn: string;
  industry: string;
  website: string;
  confidenceScore: number;
  verificationProof: string;
  isLinkedInVerified?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  verificationDetails?: {
    linkedInStatus: string;
    emailStatus: string;
    phoneStatus: string;
  };
  auditTrail?: string;
  sourceUrl?: string;
}

export interface CollegeInfo {
  id: string;
  name: string;
  state: string;
  district: string;
  universityAffiliation: string;
  collegeType: string;
  coursesOffered: string[];
  principalName: string;
  principalContact: string;
  principalEmail: string;
  tpoName: string;
  tpoContact: string;
  tpoEmail: string;
  website: string;
  aisheCode: string;
  establishedYear: string;
  accreditation: string;
  totalStudentStrength: string;
  facultyStrength: string;
  address: string;
  pinCode: string;
  isVerified: boolean;
  confidenceScore: number;
  sources: string[];
  schools?: SchoolInfo[];
}

export interface SearchParams {
  collegeName: string;
  state: string;
  district?: string;
  collegeType?: string;
  accreditation?: string;
  courses?: string[];
}

export interface AreaSearchParams {
  state: string;
  district: string;
  year: string;
}

export interface CompanySearchParams {
  companyName: string;
  city: string;
  state: string;
  leadName?: string;
  leadRole?: string;
}

export interface QueryRow {
  id: string;
  name: string;
  state: string;
  district: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DashboardAnalysis {
  insightSummary: string;
  keyTakeaways: string[];
  suggestedActions: string[];
  dataQualityScore: number;
  swotAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  executiveBriefing?: string;
}
