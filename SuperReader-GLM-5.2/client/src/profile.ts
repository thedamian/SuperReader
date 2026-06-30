export interface UserProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
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

export const EMPTY_PROFILE: UserProfile = {
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  ssn: "",
  email: "",
  phone: "",
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  employer: "",
  occupation: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
  signatureName: "",
};

export const PROFILE_KEY = "superreader.profile.v1";

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return { ...EMPTY_PROFILE, ...parsed };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function formatSSN(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 9);
  if (d.length === 0) return "";
  if (d.length < 4) return d;
  if (d.length < 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

export function formatDOB(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length === 0) return "";
  if (d.length < 3) return d;
  if (d.length < 5) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
