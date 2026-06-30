export type Profile = {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  phoneNumber: string;
  alternatePhone: string;
  email: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  mailingStreetAddress: string;
  mailingApartment: string;
  mailingCity: string;
  mailingState: string;
  mailingZipCode: string;
  citizenshipStatus: string;
  maritalStatus: string;
  sex: string;
  veteranStatus: string;
  employerName: string;
  occupation: string;
  annualIncome: string;
  householdSize: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  policyNumber: string;
  medicareNumber: string;
  medicaidNumber: string;
  driverLicenseNumber: string;
  driverLicenseState: string;
};

export type GuidanceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Guidance = {
  found: boolean;
  fieldKey: string | null;
  fieldLabel: string | null;
  answer: string | null;
  instruction: string;
  confidence: number;
  box: GuidanceBox | null;
};
