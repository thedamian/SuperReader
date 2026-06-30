export interface UserProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string; // ISO date
  ssn: string;
  email: string;
  phone: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  employer: string;
  occupation: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  signatureName: string;
}

export const FIELD_LABELS: Record<keyof UserProfile, string> = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  dob: "Date of Birth",
  ssn: "Social Security Number",
  email: "Email Address",
  phone: "Phone Number",
  street: "Street Address",
  unit: "Apt / Unit",
  city: "City",
  state: "State",
  zip: "ZIP Code",
  country: "Country",
  employer: "Employer",
  occupation: "Occupation",
  emergencyName: "Emergency Contact Name",
  emergencyPhone: "Emergency Contact Phone",
  emergencyRelationship: "Emergency Contact Relationship",
  signatureName: "Signature Name",
};
