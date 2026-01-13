
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
}

export interface SearchParams {
  collegeName: string;
  state: string;
  district?: string;
  collegeType?: string;
  accreditation?: string;
  courses?: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}
