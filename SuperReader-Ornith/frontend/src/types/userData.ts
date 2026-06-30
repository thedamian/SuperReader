export interface UserData {
  // Personal Information
  firstName: string;
  lastName: string;
  
  // Address Fields (split as requested)
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Contact Information
  phone: string;
  email?: string;
  
  // Government ID Fields
  ssn?: string; // Social Security Number
  dateOfBirth?: string;
  placeOfBirth?: string;
  
  // Additional Information for government forms
  nationality?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  employerName?: string;
  employerAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Document-specific fields
  passportNumber?: string;
  driverLicenseNumber?: string;
  issuingState?: string;
  expirationDate?: string;
}

export interface FieldMapping {
  fieldId: keyof UserData | string;
  fieldName: string;
  value: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface AnalysisResult {
  detectedText: string;
  fields: FieldMapping[];
  confidence: number;
}
