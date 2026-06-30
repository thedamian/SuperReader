import type { Profile } from "./types";

export const STORAGE_KEY = "superreader.profile.v1";

export const emptyProfile: Profile = {
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  dateOfBirth: "",
  socialSecurityNumber: "",
  phoneNumber: "",
  alternatePhone: "",
  email: "",
  streetAddress: "",
  apartment: "",
  city: "",
  state: "",
  zipCode: "",
  county: "",
  country: "United States",
  mailingStreetAddress: "",
  mailingApartment: "",
  mailingCity: "",
  mailingState: "",
  mailingZipCode: "",
  citizenshipStatus: "",
  maritalStatus: "",
  sex: "",
  veteranStatus: "",
  employerName: "",
  occupation: "",
  annualIncome: "",
  householdSize: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  insuranceProvider: "",
  policyNumber: "",
  medicareNumber: "",
  medicaidNumber: "",
  driverLicenseNumber: "",
  driverLicenseState: ""
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile;
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return emptyProfile;
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function hasUsefulProfile(profile: Profile) {
  return Object.values(profile).some((value) => value.trim().length > 0);
}
