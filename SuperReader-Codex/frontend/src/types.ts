export interface UserInfo {
  firstName: string;
  lastName: string;
  middleInitial: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  streetAddress: string;
  apartmentUnit: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  other: string;
}

export type FieldBox = {
  fieldName: keyof UserInfo | string;
  label: string;
  value: string;
  box: [number, number, number, number];
};

export const EMPTY_USER_INFO: UserInfo = {
  firstName: '',
  lastName: '',
  middleInitial: '',
  dateOfBirth: '',
  socialSecurityNumber: '',
  streetAddress: '',
  apartmentUnit: '',
  city: '',
  state: '',
  zipCode: '',
  phoneNumber: '',
  email: '',
  other: '',
};

export const FIELD_LABELS: Record<keyof UserInfo, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  middleInitial: 'Middle Initial',
  dateOfBirth: 'Date of Birth',
  socialSecurityNumber: 'Social Security Number',
  streetAddress: 'Street Address',
  apartmentUnit: 'Apartment / Unit #',
  city: 'City',
  state: 'State',
  zipCode: 'ZIP Code',
  phoneNumber: 'Phone Number',
  email: 'Email Address',
  other: 'Other Information',
};
