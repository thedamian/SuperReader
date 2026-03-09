export interface PersonalData {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  age: string;
  dateOfBirth: string;
  email: string;
  gender: string;
}

export const DEFAULT_PERSONAL_DATA: PersonalData = {
  firstName: "",
  lastName: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  phoneNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  age: "",
  dateOfBirth: "",
  email: "",
  gender: "",
};

export const PERSONAL_DATA_LABELS: Record<keyof PersonalData, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  streetAddress: "Street Address",
  city: "City",
  state: "State / Province",
  zipCode: "ZIP / Postal Code",
  phoneNumber: "Phone Number",
  emergencyContactName: "Emergency Contact Name",
  emergencyContactPhone: "Emergency Contact Phone",
  age: "Age",
  dateOfBirth: "Date of Birth",
  email: "Email Address",
  gender: "Gender",
};

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedField {
  fieldKey: string;
  label: string;
  value: string;
  boundingBox: BoundingBox;
}

export const STORAGE_KEY = "superReaderPersonalData";
